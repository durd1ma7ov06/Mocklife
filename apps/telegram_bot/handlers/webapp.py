from pathlib import Path
import urllib.parse
from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import FSInputFile, InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo

from apps.telegram_bot.keyboards.main import main_menu
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import (
    SqlAlchemyProfileRepository,
    SqlAlchemySubscriptionRepository,
    SqlAlchemyUserRepository,
)
from packages.ieltix_core.application.subscriptions import SubscriptionService
from packages.ieltix_core.config import get_settings

VIP_BANNER_PATH = Path(__file__).resolve().parent.parent / "assets" / "vip_stars_banner.jpg"

router = Router(name="webapp")


def webapp_keyboard(web_url: str, locale: str) -> InlineKeyboardMarkup:
    open_btn = "🚀 Web Platformani Ochish (Mini App)" if locale == "uz" else "🚀 Open Web Platform (Mini App)"
    rows = []
    if web_url and web_url.startswith("https://"):
        rows.append([InlineKeyboardButton(text=open_btn, web_app=WebAppInfo(url=web_url))])
    else:
        rows.append([InlineKeyboardButton(text=open_btn, url=web_url)])

    rows.append([
        InlineKeyboardButton(
            text="📖 Reading Mock" if locale == "uz" else "📖 Reading Mock",
            callback_data="skill:reading",
        ),
        InlineKeyboardButton(
            text="🎧 Listening Mock" if locale == "uz" else "🎧 Listening Mock",
            callback_data="skill:listening",
        ),
    ])
    rows.append([
        InlineKeyboardButton(
            text="✍️ Writing Studio" if locale == "uz" else "✍️ Writing Studio",
            callback_data="skill:writing",
        ),
        InlineKeyboardButton(
            text="🎙 Speaking AI" if locale == "uz" else "🎙 Speaking AI",
            callback_data="skill:speaking",
        ),
    ])
    return InlineKeyboardMarkup(inline_keyboard=rows)


@router.message(Command("webapp"))
@router.message(Command("web"))
@router.message(F.text.regexp(r"(?i)(web\s*sayt|web\s*platform|web\s*app|practice\s*on\s*website)"))
@router.message(
    F.text.in_({
        "🌐 Web saytda tayyorlanish",
        "🌐 Web saytda tayyorlanish 🔒",
        "Web saytda tayyorlanish",
        "🌐 Practice on Website",
        "🌐 Practice on Website 🔒",
        "Practice on Website",
        "🌐 Web Platform",
        "🌐 Web Platform 🔒",
        "Web Platform",
        "🌐 Web App Platforma",
        "🌐 Web App",
        "🌐 Web App 🔒",
        "Web App",
        "webapp",
    })
)
async def show_webapp_info(message: Message, database: Database) -> None:
    telegram_id = message.from_user.id if message.from_user else 0
    locale = "uz"
    user = None
    profile = None
    active_sub = None
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if not user:
            await message.answer("Iltimos, avval /start ni bosing.")
            return
        locale = user.locale
        profile = await SqlAlchemyProfileRepository(session).get_by_user_id(user.id)
        sub_repo = SqlAlchemySubscriptionRepository(session)
        active_sub = await sub_repo.get_active(user.id)
        settings = get_settings()
        is_admin = telegram_id in settings.admin_ids or telegram_id == 6956456422 or getattr(user, "is_admin", False)

    settings = get_settings()
    web_url = settings.effective_web_app_url.rstrip("/")

    launch_url = web_url
    if user and profile:
        name_encoded = urllib.parse.quote(getattr(user, "full_name", "Learner"))
        phone = getattr(user, "phone_number", "") or ""
        current_band = getattr(profile, "current_band", 6.0)
        target_band = getattr(profile, "target_band", 7.5)
        exam_type = getattr(profile, "exam_type", "academic")
        launch_url = (
            f"{web_url}?tg_id={user.telegram_id}&name={name_encoded}&phone={phone}"
            f"&band={current_band}&target={target_band}&exam={exam_type}"
        )

    locked_text = (
        "🔒 <b>MockLife Web Platformasi — Hali ishga tushmadi!</b>\n\n"
        "⏳ <b>Ushbu bo'lim hozirda yakuniy sozlash jarayonida.</b>\n"
        "Katta ekranli Web App, Reading/Listening split-view va Computer-Delivered Mock Arena tez kunda rasman to'liq ishga tushiriladi.\n\n"
        "🚀 <b>Tez kunda ishga tushadi!</b>\n\n"
        "Ungacha siz barcha 4 ta modul (<b>Writing, Reading, Speaking, Listening</b>) mashqlarini va <b>3D Foxy AI Speaking Examiner</b> bilan jonli tayyorgarlikni to'g'ridan-to'g'ri ushbu Telegram botimizda to'liq amalga oshirishingiz mumkin! 👇"
        if locale == "uz"
        else
        "🔒 <b>MockLife Web Platform — Not Launched Yet!</b>\n\n"
        "⏳ <b>This section is currently undergoing final setup and testing.</b>\n"
        "Our desktop Web App, split-screen reading and Computer-Delivered Mock Arena will be officially launched very soon.\n\n"
        "🚀 <b>Launching very soon!</b>\n\n"
        "In the meantime, you can practice all 4 skills (<b>Writing, Reading, Speaking, Listening</b>) and speak with <b>3D Foxy AI Examiner</b> right here inside our Telegram bot! 👇"
    )

    buttons = [
        [
            InlineKeyboardButton(
                text="🎯 Telegramda Mashq Qilish" if locale == "uz" else "🎯 Practice in Telegram",
                callback_data="skill:menu",
            )
        ],
        [
            InlineKeyboardButton(
                text="🎙 AI Live Speaking Suhbat" if locale == "uz" else "🎙 AI Live Speaking Practice",
                callback_data="live_call:start",
            )
        ],
        [
            InlineKeyboardButton(
                text="👤 Mening Profilim" if locale == "uz" else "👤 My Profile",
                callback_data="profile:show",
            )
        ],
    ]

    if is_admin:
        admin_btn_text = "🛠 Web App Sinov (Admin)" if locale == "uz" else "🛠 Web App Preview (Admin)"
        if launch_url.startswith("https://"):
            buttons.append([InlineKeyboardButton(text=admin_btn_text, web_app=WebAppInfo(url=launch_url))])
        else:
            buttons.append([InlineKeyboardButton(text=admin_btn_text, url=launch_url)])

    locked_keyboard = InlineKeyboardMarkup(inline_keyboard=buttons)

    if VIP_BANNER_PATH.exists():
        try:
            await message.answer_photo(
                photo=FSInputFile(VIP_BANNER_PATH),
                caption=locked_text,
                reply_markup=locked_keyboard,
                parse_mode="HTML",
            )
            return
        except Exception:
            pass

    await message.answer(locked_text, reply_markup=locked_keyboard, parse_mode="HTML")

