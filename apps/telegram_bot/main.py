import asyncio
import logging

from aiogram import Bot, Dispatcher

from apps.telegram_bot.handlers import (
    admin,
    live_call,
    onboarding,
    practice,
    profile,
    progress,
    start,
    subscription,
    webapp,
)
from apps.telegram_bot.middlewares.rate_limit import RateLimitMiddleware
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.config import Settings, get_settings


def create_dispatcher() -> Dispatcher:
    dispatcher = Dispatcher()
    dispatcher.message.middleware(RateLimitMiddleware())
    dispatcher.include_router(admin.router)
    dispatcher.include_router(start.router)
    dispatcher.include_router(live_call.router)
    dispatcher.include_router(webapp.router)
    dispatcher.include_router(subscription.router)
    dispatcher.include_router(practice.router)
    dispatcher.include_router(profile.router)
    dispatcher.include_router(progress.router)
    dispatcher.include_router(onboarding.router)
    return dispatcher


async def run(settings: Settings | None = None) -> None:
    settings = settings or get_settings()
    if not settings.bot_token:
        raise RuntimeError("BOT_TOKEN is required to start the Telegram bot")
    database = Database(settings.database_url)
    await database.create_schema()

    from packages.ieltix_core.application.key_pool import get_key_pool
    key_pool = get_key_pool(database)
    await key_pool.initialize(
        default_groq=settings.groq_api_key,
        default_gemini=settings.gemini_api_key,
        database=database,
    )

    dispatcher = create_dispatcher()
    while True:
        session = None
        bot = None
        try:
            from aiogram.client.session.aiohttp import AiohttpSession
            session = AiohttpSession(timeout=120.0)
            bot = Bot(settings.bot_token, session=session)
            logging.info("Starting bot polling for @%s...", settings.bot_username)
            try:
                from aiogram.types import MenuButtonDefault
                await bot.set_chat_menu_button(menu_button=MenuButtonDefault())
                logging.info("Chat menu button reset to default (IELTIX App removed)")
            except Exception as menu_exc:
                logging.warning("Could not reset chat menu button: %s", menu_exc)
            await dispatcher.start_polling(bot, database=database)
            break
        except (KeyboardInterrupt, SystemExit):
            break
        except Exception as exc:
            logging.warning("Telegram network or polling error: %s. Reconnecting in 3s...", exc)
            await asyncio.sleep(3)
        finally:
            if bot and bot.session:
                await bot.session.close()
    await database.dispose()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run())
