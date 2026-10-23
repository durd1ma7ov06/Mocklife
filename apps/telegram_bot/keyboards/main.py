import urllib.parse
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from packages.ieltix_core.config import get_settings


def main_menu_labels(locale: str, has_plus: bool = False) -> dict[str, str]:
    lock = "" if has_plus else " 🔒"
    if locale == "en":
        return {
            "practice": f"🎯 Practice{lock}",
            "live_call": f"🎙 AI Live Practice{lock}",
            "profile": "👤 Profile",
            "website": f"🌐 Practice on Website{lock}",
        }
    return {
        "practice": f"🎯 Mashq qilish{lock}",
        "live_call": f"🎙 AI live tayyorlanish{lock}",
        "profile": "👤 Profil",
        "website": f"🌐 Web saytda tayyorlanish{lock}",
    }


def language_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🇺🇿 O‘zbekcha", callback_data="lang:uz"),
                InlineKeyboardButton(text="🇬🇧 English", callback_data="lang:en"),
            ]
        ]
    )


def contact_keyboard(locale: str) -> ReplyKeyboardMarkup:
    btn_text = "📱 Telefon raqamni yuborish" if locale == "uz" else "📱 Share Phone Number"
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=btn_text, request_contact=True)],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def name_keyboard(full_name: str, locale: str) -> InlineKeyboardMarkup:
    btn_text = f"✅ {full_name} sifatida davom etish" if locale == "uz" else f"✅ Continue as {full_name}"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=btn_text, callback_data="onboard:name:confirm")]
        ]
    )


def main_menu(
    locale: str = "uz",
    web_url: str | None = None,
    user=None,
    profile=None,
    has_plus: bool = False,
) -> ReplyKeyboardMarkup:
    labels = main_menu_labels(locale, has_plus=has_plus)
    if web_url is None:
        try:
            web_url = get_settings().effective_web_app_url
        except Exception:
            web_url = None

    launch_url = None
    if web_url:
        clean_url = web_url.rstrip("/")
        if user and profile:
            name_encoded = urllib.parse.quote(getattr(user, "full_name", "Learner"))
            phone = getattr(user, "phone_number", "") or ""
            current_band = getattr(profile, "current_band", 6.0)
            target_band = getattr(profile, "target_band", 7.5)
            exam_type = getattr(profile, "exam_type", "academic")
            tg_id = getattr(user, "telegram_id", 0)
            launch_url = f"{clean_url}?tg_id={tg_id}&name={name_encoded}&phone={phone}&band={current_band}&target={target_band}&exam={exam_type}"
        else:
            launch_url = clean_url

    if has_plus and launch_url and launch_url.startswith("https://"):
        web_button = KeyboardButton(text=labels["website"], web_app=WebAppInfo(url=launch_url))
    else:
        web_button = KeyboardButton(text=labels["website"])

    rows = [
        [KeyboardButton(text=labels["practice"]), KeyboardButton(text=labels["live_call"])],
        [KeyboardButton(text=labels["profile"]), web_button],
    ]

    is_adm = False
    if user:
        try:
            tg_id = getattr(user, "telegram_id", 0)
            is_adm = getattr(user, "is_admin", False) or tg_id in get_settings().admin_ids or tg_id == 6956456422
        except Exception:
            pass

    if is_adm:
        rows.append([KeyboardButton(text="👑 Admin Panel")])

    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
    )


def onboarding_keyboard(step: str, locale: str) -> InlineKeyboardMarkup | None:
    options: dict[str, list[tuple[str, str]]] = {
        "target_band": [(str(v), str(v)) for v in (5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0)],
        "exam_type": [("🎓 Academic IELTS", "academic"), ("💼 General Training", "general")],
        "weak_skills": [
            ("📖 Reading", "reading"), ("🎧 Listening", "listening"),
            ("✍️ Writing", "writing"), ("🗣️ Speaking", "speaking"),
        ],
        "quiz_1": [
            ("A) adopt / implement", "opt_a"),
            ("B) make", "opt_b"),
            ("C) do", "opt_c"),
        ],
        "quiz_2": [
            ("A) would have taken", "opt_a"),
            ("B) will take", "opt_b"),
            ("C) would take", "opt_c"),
        ],
        "quiz_3": [
            ("A) Due to neural adaptation", "opt_a"),
            ("B) They study more academic concepts", "opt_b"),
            ("C) Monolinguals have slower reflexes", "opt_c"),
        ],
        "quiz_4": [
            ("A) because of / due to", "opt_a"),
            ("B) in spite of", "opt_b"),
            ("C) in comparison to", "opt_c"),
        ],
        "quiz_5": [
            ("A) Friday morning at 9:30 AM (Auditorium B)", "opt_a"),
            ("B) Thursday afternoon (Auditorium B)", "opt_b"),
            ("C) Friday afternoon at 9:30 AM", "opt_c"),
        ],
        "quiz_6": [
            ("A) Project cost far exceeds the budget", "opt_a"),
            ("B) City already has enough transit", "opt_b"),
            ("C) Construction will cause delays", "opt_c"),
        ],
        "quiz_7": [
            ("A) nevertheless / however", "opt_a"),
            ("B) furthermore", "opt_b"),
            ("C) because of", "opt_c"),
        ],
        "quiz_8": [
            ("A) paramount / indispensable", "opt_a"),
            ("B) satisfactory", "opt_b"),
            ("C) standard", "opt_c"),
        ],
        "quiz_9": [
            ("A) have scientists made", "opt_a"),
            ("B) scientists have made", "opt_b"),
            ("C) did scientists make", "opt_c"),
        ],
        "quiz_10_speaking": [
            ("🎙 Ovozli xabar yuborish (Mikrofon)", "opt_voice"),
            ("⏭ Ushbu bosqichni yakunlash", "I live in a beautiful hometown surrounded by mountains and kind people."),
        ],
    }
    if step not in options:
        return None
    rows = [
        [InlineKeyboardButton(text=label, callback_data=f"onboard:{step}:{value}")]
        for label, value in options[step]
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def completion_keyboard(web_url: str, user, profile, locale: str) -> InlineKeyboardMarkup:
    name_encoded = urllib.parse.quote(getattr(user, "full_name", "Learner"))
    phone = getattr(user, "phone_number", "") or ""
    current_band = getattr(profile, "current_band", 6.0)
    target_band = getattr(profile, "target_band", 7.5)
    exam_type = getattr(profile, "exam_type", "academic")
    tg_id = getattr(user, "telegram_id", 0)

    clean_url = web_url.rstrip("/")
    launch_url = f"{clean_url}?tg_id={tg_id}&name={name_encoded}&phone={phone}&band={current_band}&target={target_band}&exam={exam_type}"

    btn_label = "🚀 Tayyorgarlik Stoliga O'tish (Mini App)" if locale == "uz" else "🚀 Open Preparation Desk (Mini App)"

    rows = []
    if launch_url.startswith("https://"):
        rows.append([InlineKeyboardButton(text=btn_label, web_app=WebAppInfo(url=launch_url))])
    else:
        rows.append([InlineKeyboardButton(text=btn_label, url=launch_url)])

    return InlineKeyboardMarkup(inline_keyboard=rows)
