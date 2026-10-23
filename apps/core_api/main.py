from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from apps.core_api.routes.live_call import router as live_call_router
from apps.core_api.routes.voice import router as voice_router
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.config import Settings, get_settings


def create_app(
    settings: Settings | None = None,
    database: Database | None = None,
) -> FastAPI:
    settings = settings or get_settings()
    database = database or Database(settings.database_url)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        await database.create_schema()
        yield
        await database.dispose()

    api = FastAPI(title="IELTIX Core", version="0.1.0", lifespan=lifespan)
    api.state.settings = settings
    api.state.database = database

    @api.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.service_name}
    api.include_router(live_call_router)
    api.include_router(voice_router)

    live_call_dir = Path(__file__).resolve().parent.parent / "live_call"
    if live_call_dir.exists():
        api.mount("/live-call", StaticFiles(directory=str(live_call_dir), html=True), name="live-call")

    return api


app = create_app()
