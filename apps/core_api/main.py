from fastapi import FastAPI

from packages.ieltix_core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    api = FastAPI(title="IELTIX Core", version="0.1.0")

    @api.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.service_name}

    return api


app = create_app()
