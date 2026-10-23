from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env.bot", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    service_name: str = "ieltix-core"
    app_env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./ieltix_bot.db"
    redis_url: str = "redis://localhost:6379/0"
    bot_token: str = ""
    bot_username: str = "ieltix_bot"
    admin_telegram_ids: str = "6956456422"
    public_base_url: str = "http://localhost:8000"
    web_app_url: str = "http://localhost:5173"
    call_token_secret: str = Field(
        default="development-only-change-this-secret",
        min_length=16,
    )
    call_token_ttl_seconds: int = Field(default=900, ge=60, le=3600)
    telegram_stars_price: int = Field(default=249, ge=1)
    telegram_stars_weekly_price: int = Field(default=49, ge=1)
    subscription_uzs_price: int = Field(default=59000, ge=1)
    voice_provider: str = "groq"
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3.8-27b"
    gemini_api_key: str = ""
    tts_voice_uz: str = "uz-UZ-MadinaNeural"
    tts_voice_en: str = "en-GB-RyanNeural"

    @property
    def admin_ids(self) -> frozenset[int]:
        return frozenset(
            int(value.strip())
            for value in self.admin_telegram_ids.split(",")
            if value.strip().isdigit()
        )

    @property
    def effective_web_app_url(self) -> str:
        if self.web_app_url.startswith("https://"):
            return self.web_app_url
        try:
            import json
            import urllib.request
            with urllib.request.urlopen("http://127.0.0.1:4040/api/tunnels", timeout=0.2) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                for t in data.get("tunnels", []):
                    u = t.get("public_url", "")
                    if u.startswith("https://"):
                        return u
        except Exception:
            pass
        return self.web_app_url


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
