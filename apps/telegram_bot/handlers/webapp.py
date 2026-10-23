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

    if not is_admin and not active_sub:
        locked_text = (
            "🔒 <b>MockLife Web Platformasi — VIP Plus</b>\n\n"
            "Katta ekranda to'liq IELTS imtihon simulyatori (Mock Arena), Reading/Listening split-screen va Writing Studio'dan foydalanish uchun <b>Haftalik</b> yoki <b>Oylik</b> faol obuna talab qilinadi!\n\n"
            "<b>MockLife VIP Plus imkoniyatlari:</b>\n"
            "• 🏛 <b>Mock Arena:</b> 4 ta ko'nikma bo'yicha to'liq test va taymer\n"
            "• 📖 Katta ekrandagi ilmiy matnlar va split-view\n"
            "• 🎙 Jonli ovozli Speaking AI suhbat (AI Live Call)\n"
            "• 📊 Shaxsiy diagnostik hisobot va band bashorati\n\n"
            "👇 <b>Obuna Tarifi:</b>\n"
            "• ⭐️ <b>Web saytga to'liq kirish (30 kun):</b> 129 Telegram Stars"
            if locale == "uz"
            else
            "🔒 <b>MockLife Web Platform Access</b>\n\n"
            "Full Computer-Delivered Mock Arena, Reading/Listening split-screen and Writing Studio require an active subscription!\n\n"
            "<b>MockLife VIP Features:</b>\n"
            "• 🏛 <b>Mock Arena:</b> Full 4-skill mock tests with real timers\n"
            "• 📖 Split-screen reading and instant grading\n"
            "• 🎙 Real-time voice AI Examiner (Live Call)\n"
            "• 📊 Performance analytics and predicted band score\n\n"
            "👇 <b>Subscription Plan:</b>\n"
            "• ⭐️ <b>Web Platform Access (30 days):</b> 129 Telegram Stars"
        )
        locked_keyboard = InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(
                    text="⭐️ Web saytga kirish (129 Stars)" if locale == "uz" else "⭐️ Web Platform Access (129 Stars)",
                    callback_data="sub:checkout:monthly",
                )],
            ]
        )
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
        return

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

    if locale == "en":
        text = (
            "🌐 <b>IELTIX Web Platform (Desktop & Mini App)</b>\n\n"
            "Experience the full IELTS test environment on your PC, laptop, or phone:\n\n"
            "• 🏛 <b>Mock Arena:</b> Full 4-skill mock tests with official timers\n"
            "• 📖 <b>Reading Hub:</b> Academic texts, split view, T/F/NG and instant auto-grading\n"
            "• 🎧 <b>Listening Player:</b> Audio tracks, auto playback, and instant band scoring\n"
            "• ✍️ <b>Writing Studio:</b> Live word counter and AI band descriptor feedback\n"
            "• 🎙 <b>Speaking Studio:</b> Real-time voice examiner simulation\n"
            "• 📊 <b>Performance Analytics:</b> Detailed score reports and study plan recommendations\n\n"
            "<i>No password needed — your profile is permanently linked!</i>\n\n"
            "👇 Tap the button below to launch the Web Platform:"
        )
    else:
        text = (
            "🌐 <b>IELTIX Web Platformasida Tayyorlanish</b>\n\n"
            "Kompyuter, noutbuk yoki telefon brauzerida to'liq IELTS imtihon simulyatsiyasi:\n\n"
            "• 🏛 <b>Mock Arena:</b> 4 ta ko'nikma bo'yicha to'liq test va real vaqt taymeri\n"
            "• 📖 <b>Reading Moduli:</b> Katta ekranda ilmiy matnlar, T/F/NG va avtomatik tekshiruv\n"
            "• 🎧 <b>Listening Pleyeri:</b> Audio treklar va savollarga avtomatik ball hisobi\n"
            "• ✍️ <b>Writing Studio:</b> So'zlar hisoblagichi va AI orqali band baholash\n"
            "• 🎙 <b>Speaking Studio:</b> Jonli ovozli imtihonchi simulyatsiyasi\n"
            "• 📊 <b>Batafsil Tahlil:</b> Shaxsiy taraqqiyot grafikasi va tavsiyalar\n\n"
            "<i>Login va parol talab qilinmaydi — profilingiz avtomatik ulangan!</i>\n\n"
            "👇 Web platformani ochish uchun quyidagi tugmani bosing:"
        )

    await message.answer(
        text,
        reply_markup=webapp_keyboard(launch_url, locale),
        parse_mode="HTML",
    )
    # Also update bottom keyboard to the unified 4-button menu
    await message.answer(
        "💡 <i>Pastdagi bosh menyu ham 4 ta asosiy bo'lim bilan faol holatda.</i>"
        if locale == "uz"
        else "💡 <i>Your bottom menu is ready with the 4 primary actions.</i>",
        reply_markup=main_menu(locale, web_url, user, profile, has_plus=bool(active_sub)),
        parse_mode="HTML",
    )
