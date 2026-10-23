from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import CallbackQuery, Message

from apps.telegram_bot.keyboards.main import language_keyboard, main_menu, onboarding_keyboard
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import (
    SqlAlchemyProfileRepository,
    SqlAlchemySubscriptionRepository,
    SqlAlchemyUserRepository,
)
from packages.ieltix_core.application.onboarding import OnboardingService
from packages.ieltix_core.config import get_settings

router = Router(name="start")


def welcome_text(name: str) -> str:
    return (
        f"Assalomu alaykum, {name}! 👋\n"
        "MockLife — shaxsiy IELTS murabbiyingiz.\n\n"
        "Tilni tanlang / Choose your language"
    )


def main_menu_text(locale: str, target_band: float) -> str:
    if locale == "en":
        return f"🎯 Your plan is ready. Target band: {target_band:.1f}. Choose one of the 4 actions below:"
    return f"🎯 Rejangiz tayyor. Maqsad band: {target_band:.1f}. Quyidagi 4 ta asosiy bo'limdan birini tanlang:"


@router.message(CommandStart())
async def start(message: Message, database: Database) -> None:
    telegram_id = message.from_user.id if message.from_user else 0
    name = message.from_user.full_name if message.from_user else "MockLife Learner"

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            profile = await SqlAlchemyProfileRepository(session).get_by_user_id(user.id)
            if profile and profile.is_complete:
                settings = get_settings()
                web_url = settings.effective_web_app_url
                sub_repo = SqlAlchemySubscriptionRepository(session)
                active_sub = await sub_repo.get_active(user.id)
                has_plus = active_sub is not None

                welcome_back = (
                    f"Assalomu alaykum, <b>{user.full_name}</b>! 👋\n"
                    f"MockLife murabbiyingizga xush kelibsiz.\n"
                    f"Maqsadingiz: <b>Band {profile.target_band:.1f}</b> ({profile.exam_type.title()})\n\n"
                    f"Quyidagi 4 ta asosiy bo'limdan birini tanlang:"
                    if user.locale == "uz"
                    else
                    f"Welcome back, <b>{user.full_name}</b>! 👋\n"
                    f"Target band: <b>Band {profile.target_band:.1f}</b> ({profile.exam_type.title()})\n\n"
                    f"Choose one of the 4 main actions below:"
                )
                await message.answer(
                    welcome_back,
                    reply_markup=main_menu(user.locale, web_url, user, profile, has_plus=has_plus),
                    parse_mode="HTML",
                )
                return

    await message.answer(welcome_text(name), reply_markup=language_keyboard())


@router.callback_query(F.data.startswith("lang:"))
async def select_language(callback: CallbackQuery, database: Database) -> None:
    locale = (callback.data or "lang:uz").split(":", 1)[1]
    async with database.session() as session:
        service = OnboardingService(
            SqlAlchemyUserRepository(session), SqlAlchemyProfileRepository(session)
        )
        result = await service.begin(
            callback.from_user.id,
            callback.from_user.full_name,
            locale,
            callback.from_user.username,
        )
    await callback.answer()
    if result.profile.is_complete:
        settings = get_settings()
        web_url = settings.effective_web_app_url
        await callback.message.answer(
            main_menu_text(locale, result.profile.target_band),
            reply_markup=main_menu(locale, web_url, result.user, result.profile),
        )
    elif result.step == "name":
        from apps.telegram_bot.keyboards.main import name_keyboard
        prompt = (
            f"👤 Assalomu alaykum, {result.user.full_name}!\n\n"
            f"Iltimos, ismingizni tasdiqlang yoki to'liq ism-familiyangizni yozib yuboring:"
            if locale == "uz" else
            f"👤 Hello, {result.user.full_name}!\n\nPlease confirm your name or type your full name:"
        )
        await callback.message.answer(
            prompt,
            reply_markup=name_keyboard(result.user.full_name, locale),
        )
    else:
        await callback.message.answer(
            result.prompt,
            reply_markup=onboarding_keyboard(result.step, locale),
        )
