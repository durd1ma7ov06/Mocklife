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
    admin_telegram_ids: str = ""
    public_base_url: str = "http://localhost:8000"
    call_token_secret: str = Field(
        default="development-only-change-this-secret",
        min_length=16,
    )
    call_token_ttl_seconds: int = Field(default=900, ge=60, le=3600)
    telegram_stars_price: int = Field(default=250, ge=1)
    voice_provider: str = "local"
    groq_api_key: str = ""
    tts_voice_uz: str = "uz-UZ-SardorNeural"
    tts_voice_en: str = "en-US-GuyNeural"

    @property
    def admin_ids(self) -> frozenset[int]:
        return frozenset(
            int(value.strip())
            for value in self.admin_telegram_ids.split(",")
            if value.strip().isdigit()
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
