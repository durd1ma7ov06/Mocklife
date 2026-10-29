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


@router.message(Command("app"))
@router.message(Command("webapp"))
@router.message(Command("web"))
@router.message(F.text.regexp(r"(?i)(web\s*sayt|web\s*platform|web\s*app|practice\s*on\s*website)"))
@router.message(
    F.text.in_({
        "🌐 Web platforma 🚀",
        "🌐 Web platforma",
        "🌐 Web platforma 🔒",
        "🌐 Web Platform 🚀",
        "🌐 Web Platform",
        "🌐 Web Platform 🔒",
        "🌐 Web saytda tayyorlanish",
        "🌐 Web saytda tayyorlanish 🔒",
        "Web saytda tayyorlanish",
        "🌐 Practice on Website",
        "🌐 Practice on Website 🔒",
        "Practice on Website",
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
        if not active_sub:
            active_sub = await sub_repo.activate_or_extend(user.id, plan="trial_7_days", duration_days=7)

    settings = get_settings()
    web_url = settings.effective_web_app_url.rstrip("/")

    launch_url = web_url
    if user and profile:
        name_encoded = urllib.parse.quote(getattr(user, "full_name", "Learner"))
        phone = getattr(user, "phone_number", "") or ""
        username = getattr(user, "username", "") or (message.from_user.username if message.from_user else "")
        current_band = getattr(profile, "current_band", 6.0)
        target_band = getattr(profile, "target_band", 7.5)
        exam_type = getattr(profile, "exam_type", "academic")
        launch_url = (
            f"{web_url}?tg_id={user.telegram_id}&name={name_encoded}&phone={phone}"
            f"&username={username}&band={current_band}&target={target_band}&exam={exam_type}&auth=telegram"
        )

    target_score = getattr(profile, 'target_band', 7.5) if profile else 7.5
    user_name = user.full_name if user else "IELTS Nomzod"

    launch_text = (
        f"🚀 <b>MockLife Web Platformasi & IELTS Mock Arena</b>\n\n"
        f"Assalomu alaykum, <b>{user_name}</b>! 👋\n"
        f"Katta ekrandagi Computer-Delivered Mock Arena, Reading/Listening split-screen va Writing Studio platformasi to'liq faol!\n\n"
        f"🎯 Maqsadingiz: <b>Band {target_score:.1f}</b>\n"
        f"🎁 <b>VIP Imtiyoz:</b> Barcha testlar, tahliliy izohlar va 3D Foxy AI ochiq.\n\n"
        f"Quyidagi tugma orqali to'g'ridan-to'g'ri ochishingiz mumkin: 👇"
        if locale == "uz"
        else
        f"🚀 <b>MockLife Web Platform & IELTS Mock Arena</b>\n\n"
        f"Hello, <b>{user_name}</b>! 👋\n"
        f"Our desktop Computer-Delivered Mock Arena, Reading/Listening split-screen and Writing Studio are 100% active!\n\n"
        f"🎯 Target: <b>Band {target_score:.1f}</b>\n"
        f"🎁 <b>VIP Status:</b> Full test access and AI evaluations unlocked.\n\n"
        f"Launch directly below: 👇"
    )

    open_mini_app_btn = "🚀 Web Platformani Ochish (Mini App)" if locale == "uz" else "🚀 Open Web Platform (Mini App)"
    open_browser_btn = "💻 Brauzerda Ochish (Havola)" if locale == "uz" else "💻 Open in Browser (Link)"

    buttons = []
    if launch_url.startswith("https://"):
        buttons.append([InlineKeyboardButton(text=open_mini_app_btn, web_app=WebAppInfo(url=launch_url))])
        buttons.append([InlineKeyboardButton(text=open_browser_btn, url=launch_url)])
    else:
        buttons.append([InlineKeyboardButton(text=open_mini_app_btn, url=launch_url)])

    buttons.append([
        InlineKeyboardButton(
            text="🎯 Telegramda Mashq Qilish" if locale == "uz" else "🎯 Practice in Telegram",
            callback_data="skill:menu",
        ),
        InlineKeyboardButton(
            text="🎙 AI Live Speaking" if locale == "uz" else "🎙 AI Live Speaking",
            callback_data="live_call:start",
        ),
    ])
    buttons.append([
        InlineKeyboardButton(
            text="👤 Mening Profilim" if locale == "uz" else "👤 My Profile",
            callback_data="profile:show",
        )
    ])

    keyboard = InlineKeyboardMarkup(inline_keyboard=buttons)

    if VIP_BANNER_PATH.exists():
        try:
            await message.answer_photo(
                photo=FSInputFile(VIP_BANNER_PATH),
                caption=launch_text,
                reply_markup=keyboard,
                parse_mode="HTML",
            )
            return
        except Exception:
            pass

    await message.answer(launch_text, reply_markup=keyboard, parse_mode="HTML")

