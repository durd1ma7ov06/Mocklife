import asyncio
from datetime import UTC, datetime, timedelta
import logging
import time
from typing import Any, Optional

import httpx

from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import SqlAlchemyApiKeyRepository

logger = logging.getLogger(__name__)


def mask_api_key(key: str) -> str:
    """Masks an API key for safe display (e.g. gsk_xxxx...xxxx)."""
    if not key:
        return "mavjud emas"
    clean = key.strip()
    if len(clean) <= 12:
        return f"{clean[:3]}...{clean[-2:]}"
    return f"{clean[:8]}...{clean[-4:]}"


class LLMKeyPool:
    """Manages multi-key pools for Groq and Gemini with round-robin load balancing,
    auto-failover on rate-limits (HTTP 429), and dynamic admin configuration.
    """

    _instance: Optional["LLMKeyPool"] = None

    def __init__(self, database: Optional[Database] = None) -> None:
        self.database = database
        self._groq_keys: list[str] = []
        self._gemini_keys: list[str] = []
        self._cooldowns: dict[str, float] = {}  # key -> timestamp until cooled down
        self._groq_rr: int = 0
        self._gemini_rr: int = 0
        self._initialized: bool = False

    @classmethod
    def get_instance(cls, database: Optional[Database] = None) -> "LLMKeyPool":
        if cls._instance is None:
            cls._instance = cls(database=database)
        elif database and not cls._instance.database:
            cls._instance.database = database
        return cls._instance

    async def initialize(
        self,
        default_groq: str = "",
        default_gemini: str = "",
        database: Optional[Database] = None,
    ) -> None:
        """Loads all active keys from database and registers defaults if needed."""
        if database:
            self.database = database

        if not self.database:
            if default_groq and default_groq not in self._groq_keys:
                self._groq_keys.append(default_groq.strip())
            if default_gemini and default_gemini not in self._gemini_keys:
                self._gemini_keys.append(default_gemini.strip())
            self._initialized = True
            return

        async with self.database.session() as session:
            repo = SqlAlchemyApiKeyRepository(session)
            # Seed default Groq key if provided and not yet registered
            if default_groq and default_groq.strip():
                clean_groq = default_groq.strip()
                existing = await repo.get_by_key(clean_groq)
                if not existing:
                    await repo.add_key(provider="groq", api_key=clean_groq, label="Asosiy Groq (.env)")

            # Seed default Gemini key if provided and not yet registered
            if default_gemini and default_gemini.strip():
                clean_gemini = default_gemini.strip()
                existing = await repo.get_by_key(clean_gemini)
                if not existing:
                    await repo.add_key(provider="gemini", api_key=clean_gemini, label="Asosiy Gemini (.env)")

            groq_records = await repo.get_active(provider="groq")
            gemini_records = await repo.get_active(provider="gemini")

            self._groq_keys = [r.api_key for r in groq_records]
            self._gemini_keys = [r.api_key for r in gemini_records]

        # Fallbacks if DB was empty
        if not self._groq_keys and default_groq:
            self._groq_keys.append(default_groq.strip())
        if not self._gemini_keys and default_gemini:
            self._gemini_keys.append(default_gemini.strip())

        self._initialized = True
        logger.info(
            "LLMKeyPool initialized: %d Groq keys, %d Gemini keys",
            len(self._groq_keys),
            len(self._gemini_keys),
        )

    async def reload(self) -> None:
        """Refreshes keys from database."""
        if not self.database:
            return
        async with self.database.session() as session:
            repo = SqlAlchemyApiKeyRepository(session)
            groq_records = await repo.get_active(provider="groq")
            gemini_records = await repo.get_active(provider="gemini")
            self._groq_keys = [r.api_key for r in groq_records]
            self._gemini_keys = [r.api_key for r in gemini_records]

    def get_groq_keys(self) -> list[str]:
        """Returns active Groq keys ordered with round-robin priority and cooled-down keys first."""
        if not self._groq_keys:
            return []
        now = time.time()
        # Separate cooled-down keys vs cooling-down keys
        ready = [k for k in self._groq_keys if self._cooldowns.get(k, 0) <= now]
        cooling = [k for k in self._groq_keys if self._cooldowns.get(k, 0) > now]

        # Rotate ready keys
        if ready:
            self._groq_rr = (self._groq_rr + 1) % len(ready)
            rotated = ready[self._groq_rr:] + ready[:self._groq_rr]
            return rotated + cooling
        return cooling or self._groq_keys

    def get_gemini_keys(self) -> list[str]:
        """Returns active Gemini keys ordered with round-robin priority."""
        if not self._gemini_keys:
            return []
        now = time.time()
        ready = [k for k in self._gemini_keys if self._cooldowns.get(k, 0) <= now]
        cooling = [k for k in self._gemini_keys if self._cooldowns.get(k, 0) > now]

        if ready:
            self._gemini_rr = (self._gemini_rr + 1) % len(ready)
            rotated = ready[self._gemini_rr:] + ready[:self._gemini_rr]
            return rotated + cooling
        return cooling or self._gemini_keys

    def mark_rate_limited(self, provider: str, api_key: str, cooldown_seconds: int = 60) -> None:
        """Puts key on temporary cooldown due to HTTP 429 or quota limit."""
        self._cooldowns[api_key] = time.time() + cooldown_seconds
        logger.warning(
            "API key %s (%s) marked rate-limited for %ds",
            mask_api_key(api_key),
            provider,
            cooldown_seconds,
        )

    async def record_usage(self, provider: str, api_key: str, success: bool) -> None:
        """Records call metrics in the database asynchronously."""
        if not self.database:
            return
        try:
            async with self.database.session() as session:
                repo = SqlAlchemyApiKeyRepository(session)
                await repo.record_usage(api_key, success)
        except Exception as exc:
            logger.debug("Failed to record API key usage: %s", exc)

    # -------------------------------------------------------------------------
    # Live Validation & Testing
    # -------------------------------------------------------------------------
    @staticmethod
    async def test_groq_key(api_key: str) -> tuple[bool, str]:
        """Tests Groq API key with a fast ping request."""
        clean = api_key.strip()
        if not clean.startswith("gsk_") or len(clean) < 20:
            return False, "Noto'g'ri format: Groq kaliti odatda 'gsk_' bilan boshlanadi."

        url = "https://api.groq.com/openai/v1/models"
        headers = {"Authorization": f"Bearer {clean}"}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    return True, "200 OK — Kalit to'liq ishlamoqda"
                elif resp.status_code == 401:
                    return False, "401 Xato: Kalit yaroqsiz yoki bekor qilingan."
                elif resp.status_code == 429:
                    return False, "429 Xato: Kalitda so'rovlar limiti tugagan."
                return False, f"Server javobi: {resp.status_code} ({resp.text[:100]})"
        except Exception as exc:
            return False, f"Tarmoq xatosi: {str(exc)}"

    @staticmethod
    async def test_gemini_key(api_key: str) -> tuple[bool, str]:
        """Tests Gemini API key with a fast model check."""
        clean = api_key.strip()
        if len(clean) < 20:
            return False, "Noto'g'ri format: Gemini kaliti kamida 20 belgidan iborat bo'lishi kerak."

        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={clean}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    return True, "200 OK — Kalit to'liq ishlamoqda"
                elif resp.status_code in (400, 403):
                    return False, f"{resp.status_code} Xato: Kalit yaroqsiz yoki API yoqilmagan."
                elif resp.status_code == 429:
                    return False, "429 Xato: Gemini kvotasi tugagan."
                return False, f"Server javobi: {resp.status_code}"
        except Exception as exc:
            return False, f"Tarmoq xatosi: {str(exc)}"

    # -------------------------------------------------------------------------
    # Admin Operations
    # -------------------------------------------------------------------------
    async def add_key(
        self,
        provider: str,
        api_key: str,
        label: Optional[str] = None,
        validate_live: bool = True,
    ) -> tuple[bool, str]:
        """Validates, persists in DB, and adds to active in-memory pool."""
        clean = api_key.strip()
        if provider == "groq":
            if validate_live:
                is_ok, msg = await self.test_groq_key(clean)
                if not is_ok:
                    return False, msg
        elif provider == "gemini":
            if validate_live:
                is_ok, msg = await self.test_gemini_key(clean)
                if not is_ok:
                    return False, msg
        else:
            return False, "Noma'lum provayder (faqat 'groq' yoki 'gemini')"

        if self.database:
            async with self.database.session() as session:
                repo = SqlAlchemyApiKeyRepository(session)
                await repo.add_key(provider=provider, api_key=clean, label=label)

        await self.reload()
        return True, "Kalit muvaffaqiyatli qo'shildi va faollashtirildi!"

    async def delete_key_by_id(self, key_id: int) -> bool:
        if not self.database:
            return False
        async with self.database.session() as session:
            repo = SqlAlchemyApiKeyRepository(session)
            deleted = await repo.delete_key(key_id)
        if deleted:
            await self.reload()
        return deleted

    async def get_all_keys_info(self) -> dict[str, list[dict[str, Any]]]:
        """Returns structured metadata of all keys for the admin interface."""
        now = time.time()
        groq_list = []
        gemini_list = []

        if self.database:
            async with self.database.session() as session:
                repo = SqlAlchemyApiKeyRepository(session)
                records = await repo.get_all()
                for r in records:
                    item = {
                        "id": r.id,
                        "provider": r.provider,
                        "api_key": r.api_key,
                        "masked": mask_api_key(r.api_key),
                        "label": r.label or f"{r.provider.capitalize()} Key",
                        "is_active": r.is_active,
                        "is_cooldown": self._cooldowns.get(r.api_key, 0) > now,
                        "total_calls": r.total_calls,
                        "failed_calls": r.failed_calls,
                    }
                    if r.provider == "groq":
                        groq_list.append(item)
                    else:
                        gemini_list.append(item)
        else:
            for idx, k in enumerate(self._groq_keys, 1):
                groq_list.append({
                    "id": idx,
                    "provider": "groq",
                    "api_key": k,
                    "masked": mask_api_key(k),
                    "label": f"Groq Key #{idx}",
                    "is_active": True,
                    "is_cooldown": self._cooldowns.get(k, 0) > now,
                    "total_calls": 0,
                    "failed_calls": 0,
                })
            for idx, k in enumerate(self._gemini_keys, 1):
                gemini_list.append({
                    "id": idx,
                    "provider": "gemini",
                    "api_key": k,
                    "masked": mask_api_key(k),
                    "label": f"Gemini Key #{idx}",
                    "is_active": True,
                    "is_cooldown": self._cooldowns.get(k, 0) > now,
                    "total_calls": 0,
                    "failed_calls": 0,
                })

        return {"groq": groq_list, "gemini": gemini_list}


def get_key_pool(database: Optional[Database] = None) -> LLMKeyPool:
    return LLMKeyPool.get_instance(database=database)
