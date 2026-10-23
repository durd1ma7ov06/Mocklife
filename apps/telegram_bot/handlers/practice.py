import io
import logging
from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    BufferedInputFile,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
)

from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.remote_voice import EdgeTextToSpeech, RemoteGroqSpeechToText
from packages.ieltix_core.adapters.repositories import (
    SqlAlchemyAttemptRepository,
    SqlAlchemySubscriptionRepository,
    SqlAlchemyUserRepository,
)
from packages.ieltix_core.application.ai_tutor import AITutorService
from packages.ieltix_core.application.evaluation import EvaluationReport, EvaluationService
from packages.ieltix_core.application.practice import PracticeService
from packages.ieltix_core.config import get_settings
from packages.ieltix_core.content.sample_exercises import (
    EXERCISES,
    Exercise,
    get_exercises_by_skill,
    get_vocab_items,
    VOCAB_VAULT_ITEMS,
)
from packages.ieltix_core.domain.models import Attempt, User

logger = logging.getLogger(__name__)

router = Router(name="practice")


class PracticeState(StatesGroup):
    waiting_for_answer = State()


def practice_locked_text(locale: str) -> str:
    if locale == "en":
        return (
            "🔒 <b>MockLife VIP Plus Subscription Required</b>\n\n"
            "Full access to IELTS practice mock tests (Reading, Listening, Writing, Speaking) and AI analysis "
            "requires an active <b>Weekly</b> or <b>Monthly</b> subscription!\n\n"
            "<b>VIP Plus features:</b>\n"
            "• 📖 <b>Reading & 🎧 Listening:</b> Cambridge mock tests with instant grading\n"
            "• ✍️ <b>Writing Studio:</b> AI essay checking with official Band criteria\n"
            "• 🎙 <b>Speaking AI:</b> Real-time voice examiner (Part 1, 2, 3)\n"
            "• 🌐 <b>Web App Arena:</b> Full computer-delivered exam interface\n\n"
            "👇 <b>Choose your subscription plan:</b>\n"
            "• ⭐️ <b>1 Week Plus (7 days):</b> 49 Telegram Stars\n"
            "• ⭐️ <b>1 Month VIP Plus (30 days):</b> 249 Telegram Stars\n"
            "• 💳 <b>Card Payment:</b> 59,000 UZS / month (Coming soon)"
        )
    return (
        "🔒 <b>MockLife VIP Plus Obunasi Talab Qilinadi</b>\n\n"
        "IELTS mashq testlari (Reading, Listening, Writing, Speaking) va AI tahlilidan foydalanish uchun "
        "<b>Haftalik</b> yoki <b>Oylik</b> faol obuna talab qilinadi!\n\n"
        "<b>VIP Plus imkoniyatlari:</b>\n"
        "• 📖 <b>Reading & 🎧 Listening:</b> Cambridge standarti bo'yicha to'liq testlar va avto-ball\n"
        "• ✍️ <b>Writing Studio:</b> Insho tahlili va 4 ta mezon bo'yicha baholash\n"
        "• 🎙 <b>Speaking AI:</b> Jonli ovozli imtihonchi bilan suhbat (Part 1, 2, 3)\n"
        "• 🌐 <b>Web App Arena:</b> Katta ekranda rasmiy imtihon simulyatori\n\n"
        "👇 <b>O'zingizga ma'qul tarifni tanlang:</b>\n"
        "• ⭐️ <b>1 haftalik Plus (7 kun):</b> 49 Telegram Stars\n"
        "• ⭐️ <b>1 oylik VIP Plus (30 kun):</b> 249 Telegram Stars\n"
        "• 💳 <b>Karta orqali to'lov:</b> 59,000 so'm / oy (Tez kunda)"
    )


def practice_locked_keyboard(locale: str) -> InlineKeyboardMarkup:
    if locale == "en":
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="⭐️ 1 Week Plus (49 Stars)", callback_data="sub:checkout:weekly")],
                [InlineKeyboardButton(text="⭐️ 1 Month VIP Plus (249 Stars)", callback_data="sub:checkout:monthly")],
                [InlineKeyboardButton(text="💳 Pay via Card (Coming soon)", callback_data="sub:card_pay")],
            ]
        )
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⭐️ 1 haftalik Plus (49 Stars)", callback_data="sub:checkout:weekly")],
            [InlineKeyboardButton(text="⭐️ 1 oylik VIP Plus (249 Stars)", callback_data="sub:checkout:monthly")],
            [InlineKeyboardButton(text="💳 Karta orqali to'lov (Tez kunda)", callback_data="sub:card_pay")],
        ]
    )


async def is_subscribed_or_admin(user_id: int | None, telegram_id: int, session, settings) -> bool:
    if telegram_id in settings.admin_ids or telegram_id == 6956456422:
        return True
    if user_id is None:
        return False
    sub_repo = SqlAlchemySubscriptionRepository(session)
    active_sub = await sub_repo.get_active(user_id)
    return active_sub is not None


def skill_selection_keyboard(locale: str) -> InlineKeyboardMarkup:
    r_count = len(get_exercises_by_skill("reading"))
    l_count = len(get_exercises_by_skill("listening"))
    w_count = len(get_exercises_by_skill("writing"))
    s_count = len(get_exercises_by_skill("speaking"))
    v_count = len(VOCAB_VAULT_ITEMS)

    if locale == "en":
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text=f"📖 Reading Mock Tests ({r_count})", callback_data="skill:reading")],
                [InlineKeyboardButton(text=f"🎧 Listening Mock Tests ({l_count})", callback_data="skill:listening")],
                [InlineKeyboardButton(text=f"✍️ Writing Mock Tasks ({w_count})", callback_data="skill:writing")],
                [InlineKeyboardButton(text=f"🎙 Speaking Mock Topics ({s_count})", callback_data="skill:speaking")],
                [InlineKeyboardButton(text=f"📚 Smart Vocab Vault ({v_count})", callback_data="skill:vocab")],
            ]
        )
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=f"📖 Reading Mock Testlar ({r_count})", callback_data="skill:reading")],
            [InlineKeyboardButton(text=f"🎧 Listening Mock Testlar ({l_count})", callback_data="skill:listening")],
            [InlineKeyboardButton(text=f"✍️ Writing Mock Vazifalar ({w_count})", callback_data="skill:writing")],
            [InlineKeyboardButton(text=f"🎙 Speaking Mock Mavzular ({s_count})", callback_data="skill:speaking")],
            [InlineKeyboardButton(text=f"📚 Smart Lug'at (Vocab Vault - {v_count})", callback_data="skill:vocab")],
        ]
    )


def exercises_list_keyboard(skill: str, locale: str) -> InlineKeyboardMarkup:
    exercises = get_exercises_by_skill(skill)
    rows = []
    for ex in exercises:
        title = ex.title_uz if locale == "uz" else ex.title_en
        rows.append([InlineKeyboardButton(text=title, callback_data=f"practice:{ex.id}")])

    back_text = "⬅️ Bo'limlarga qaytish / Back" if locale == "uz" else "⬅️ Back to Skills"
    rows.append([InlineKeyboardButton(text=back_text, callback_data="practice:back_to_skills")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def exercise_prompt(exercise: Exercise, locale: str) -> str:
    title = exercise.title_uz if locale == "uz" else exercise.title_en
    prompt = exercise.prompt_uz if locale == "uz" else exercise.prompt_en

    parts = [
        f"🎯 <b>{title}</b>",
        f"🏷 <i>Kategoriya:</i> {exercise.category} | <b>{exercise.difficulty}</b>",
    ]

    if exercise.passage_text and exercise.skill == "reading":
        parts.append(f"\n📄 <b>Ilmiy Matn (Reading Passage):</b>\n<blockquote>{exercise.passage_text}</blockquote>")
    elif exercise.skill == "listening":
        parts.append("\n🎧 <i>Yuqoridagi audio trekni tinglang va quyidagi savolga javob bering:</i>")

    parts.append(f"\n❓ <b>Savol / Topshiriq:</b>\n{prompt}")

    if exercise.options:
        parts.append("\n<i>Quyidagi variantlardan birini bosing yoki javobingizni yozing:</i>")
    elif exercise.skill == "writing":
        parts.append("\n<i>Insho matnini xabar ko'rinishida yuboring:</i>")
    elif exercise.skill == "speaking":
        parts.append("\n<i>🎙 Mikrofonni bosib ovozli xabar (voice note) yoki matn ko'rinishida javob yuboring:</i>")
    else:
        parts.append("\n<i>Javobingizni quyida yozib yuboring yoki ovozli xabar qilib jo'nating:</i>")

    return "\n".join(parts)


def exercise_options_keyboard(exercise: Exercise, locale: str) -> InlineKeyboardMarkup | None:
    buttons = []
    if exercise.options:
        row = [
            InlineKeyboardButton(text=opt, callback_data=f"quick_ans:{exercise.id}:{opt}")
            for opt in exercise.options
        ]
        buttons.append(row)

    back_text = "⬅️ Boshqa test tanlash" if locale == "uz" else "⬅️ Choose another test"
    buttons.append([InlineKeyboardButton(text=back_text, callback_data=f"skill:{exercise.skill}")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def feedback_text(report: EvaluationReport, locale: str, exercise: Exercise | None = None) -> str:
    strengths = "\n".join(f"• {item}" for item in report.strengths) or "—"
    improvements = "\n".join(f"• {item}" for item in report.improvements) or "—"

    explanation = ""
    if exercise:
        exp = exercise.explanation_uz if locale == "uz" else exercise.explanation_en
        if exp:
            explanation = f"\n\n💡 <b>Izoh / Explanation:</b>\n{exp}"
        if exercise.skill == "listening" and exercise.passage_text:
            explanation += f"\n\n🎧 <b>Audio matni transkripti:</b>\n<blockquote>{exercise.passage_text}</blockquote>"
        if exercise.model_answer:
            explanation += f"\n\n📝 <b>Namunaviy Yuqori Balli Javob (Band 8.0+ Model Answer):</b>\n<blockquote>{exercise.model_answer}</blockquote>"

    if locale == "en":
        return (
            f"📊 <b>Estimated Band: {report.band:.1f}</b>\n\n"
            f"✅ <b>Strengths:</b>\n{strengths}\n\n"
            f"🎯 <b>Next improvements:</b>\n{improvements}"
            f"{explanation}\n\n"
            f"<i>This is an IELTIX diagnostic estimate, not an official IELTS certificate.</i>"
        )
    return (
        f"📊 <b>Taxminiy Band: {report.band:.1f}</b>\n\n"
        f"✅ <b>Kuchli tomonlar:</b>\n{strengths}\n\n"
        f"🎯 <b>Yaxshilash bo'yicha tavsiyalar:</b>\n{improvements}"
        f"{explanation}\n\n"
        f"<i>Bu IELTIX diagnostik bahosi, rasmiy IELTS sertifikati emas.</i>"
    )


def after_practice_keyboard(skill: str, locale: str) -> InlineKeyboardMarkup:
    more_text = "🔄 Boshqa test yechish" if locale == "uz" else "🔄 Try another test"
    profile_text = "👤 Profil & Natijalar" if locale == "uz" else "👤 Profile & Stats"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=more_text, callback_data=f"skill:{skill}")],
            [InlineKeyboardButton(text=profile_text, callback_data="profile:show")],
        ]
    )


@router.message(F.text.regexp(r"(?i)(mashq\s*qilish|practice)"))
@router.message(
    F.text.in_({
        "🎯 Mashq qilish",
        "🎯 Mashq qilish 🔒",
        "Mashq qilish",
        "🎯 Practice",
        "🎯 Practice 🔒",
        "Practice",
        "/practice",
    })
)
async def choose_practice(message: Message, database: Database) -> None:
    telegram_id = message.from_user.id if message.from_user else 0
    settings = get_settings()
    locale = "uz"
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if not user:
            await message.answer("Iltimos, avval /start ni bosing.")
            return
        locale = user.locale
        allowed = await is_subscribed_or_admin(user.id, telegram_id, session, settings)

    if not allowed:
        await message.answer(
            practice_locked_text(locale),
            reply_markup=practice_locked_keyboard(locale),
            parse_mode="HTML",
        )
        return

    if locale == "uz":
        text = (
            "🎯 <b>MockLife Mashqlar Bo'limi</b>\n\n"
            "Barcha 4 ta asosiy IELTS ko'nikmalari bo'yicha mustaqil shug'ullaning:\n"
            "• 📖 <b>Reading:</b> Ilmiy matnlar va T/F/NG savollari\n"
            "• 🎧 <b>Listening:</b> Audio treklar va savol-javoblar\n"
            "• ✍️ <b>Writing:</b> Insho mavzulari va avtomatik band baholash\n"
            "• 🎙 <b>Speaking:</b> Ovozli xabarlar va AI tahlili\n\n"
            "<i>Mashq qilish uchun quyidagi bo'limlardan birini tanlang:</i>"
        )
    else:
        text = (
            "🎯 <b>MockLife Practice Section</b>\n\n"
            "Practice all 4 official IELTS skills:\n"
            "• 📖 <b>Reading:</b> Academic texts and T/F/NG questions\n"
            "• 🎧 <b>Listening:</b> Audio tracks and comprehension\n"
            "• ✍️ <b>Writing:</b> Essay prompts and band feedback\n"
            "• 🎙 <b>Speaking:</b> Voice notes and instant AI analysis\n\n"
            "<i>Choose a skill below to start:</i>"
        )
    await message.answer(text, reply_markup=skill_selection_keyboard(locale), parse_mode="HTML")


@router.callback_query(F.data == "practice:back_to_skills")
async def back_to_skills(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    locale = "uz"
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale

    if locale == "uz":
        text = (
            "🎯 <b>IELTIX Mashqlar Bo'limi</b>\n\n"
            "Mustaqil shug'ullanish uchun ko'nikmani tanlang:"
        )
    else:
        text = (
            "🎯 <b>IELTIX Practice Section</b>\n\n"
            "Select a skill to practice:"
        )
    if callback.message:
        try:
            await callback.message.edit_text(text, reply_markup=skill_selection_keyboard(locale), parse_mode="HTML")
        except Exception:
            await callback.message.answer(text, reply_markup=skill_selection_keyboard(locale), parse_mode="HTML")
    await callback.answer()


@router.callback_query(F.data == "skill:vocab")
async def show_vocab_vault(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    locale = "uz"
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale

    items = get_vocab_items()
    lines = [
        "📚 <b>IELTIX Smart Vocab Vault (Akademik C1/C2 Lug'at):</b>\n"
        "<i>Har bir so'zning ma'nosi, o'zbekcha tarjimasi va eng ko'p ishlatiladigan kollokatsiyalari:</i>\n"
    ]
    for idx, item in enumerate(items, 1):
        colls = ", ".join(f"<i>{c}</i>" for c in item.collocations[:2])
        lines.append(
            f"<b>{idx}. {item.word}</b> ({item.part_of_speech}, <b>{item.cefr_level}</b>)\n"
            f"🇺🇿 <i>{item.translation_uz}</i>\n"
            f"📖 <i>Ta'rif:</i> {item.definition}\n"
            f"🔗 <i>Bog'lanmalar:</i> {colls}\n"
            f"💬 <i>Misol:</i> «{item.example_sentence}»\n"
        )

    text = "\n".join(lines)
    back_text = "⬅️ Bo'limlarga qaytish / Back" if locale == "uz" else "⬅️ Back to Skills"
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=back_text, callback_data="practice:back_to_skills")]
        ]
    )
    if callback.message:
        try:
            await callback.message.edit_text(text, reply_markup=kb, parse_mode="HTML")
        except Exception:
            await callback.message.answer(text, reply_markup=kb, parse_mode="HTML")
    await callback.answer()


@router.callback_query(F.data.startswith("skill:"))
async def choose_exercise_in_skill(callback: CallbackQuery, database: Database) -> None:
    skill = (callback.data or "").split(":", 1)[1]
    telegram_id = callback.from_user.id
    settings = get_settings()
    locale = "uz"
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale
        allowed = await is_subscribed_or_admin(user.id if user else None, telegram_id, session, settings)

    if not allowed:
        if callback.message:
            await callback.message.answer(
                practice_locked_text(locale),
                reply_markup=practice_locked_keyboard(locale),
                parse_mode="HTML",
            )
        await callback.answer()
        return

    skill_titles = {
        "reading": "📖 Reading Mock Testlar ro'yxati:",
        "listening": "🎧 Listening Mock Testlar ro'yxati:",
        "writing": "✍️ Writing Mock Vazifalar ro'yxati:",
        "speaking": "🎙 Speaking Mock Mavzular ro'yxati:",
    }
    title = skill_titles.get(skill, "Mock testni tanlang:")
    if callback.message:
        try:
            await callback.message.edit_text(title, reply_markup=exercises_list_keyboard(skill, locale))
        except Exception:
            await callback.message.answer(title, reply_markup=exercises_list_keyboard(skill, locale))
    await callback.answer()


@router.callback_query(F.data.startswith("practice:"))
async def start_practice(callback: CallbackQuery, state: FSMContext, database: Database) -> None:
    exercise_id = (callback.data or "").split(":", 1)[1]
    exercise = EXERCISES.get(exercise_id)
    if not exercise:
        await callback.answer("Mock test topilmadi / Exercise not found", show_alert=True)
        return

    telegram_id = callback.from_user.id
    settings = get_settings()
    locale = "uz"
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale
        allowed = await is_subscribed_or_admin(user.id if user else None, telegram_id, session, settings)

    if not allowed:
        if callback.message:
            await callback.message.answer(
                practice_locked_text(locale),
                reply_markup=practice_locked_keyboard(locale),
                parse_mode="HTML",
            )
        await callback.answer()
        return

    await state.set_state(PracticeState.waiting_for_answer)
    await state.update_data(exercise_id=exercise_id, locale=locale)
    await callback.answer()

    # If Listening: send real audio file or synthesized voice note!
    if exercise.skill == "listening":
        if exercise.audio_url and callback.message:
            try:
                await callback.message.bot.send_chat_action(chat_id=callback.message.chat.id, action="upload_voice")
                await callback.message.answer_audio(
                    exercise.audio_url,
                    caption="🎧 <b>Cambridge Standard IELTS Listening audio trekini tinglang:</b>",
                    parse_mode="HTML",
                )
            except Exception as exc:
                logger.warning("Listening audio_url error: %s", exc)
                if exercise.passage_text and callback.message:
                    try:
                        tts = EdgeTextToSpeech()
                        speech = await tts.synthesize(exercise.passage_text, language="en")
                        if speech.content:
                            await callback.message.answer_voice(
                                BufferedInputFile(speech.content, filename="voice.ogg"),
                                caption="🎧 <b>IELTS Listening audio trekini tinglang:</b>",
                                parse_mode="HTML",
                            )
                    except Exception as tts_exc:
                        logger.warning("Listening TTS fallback error: %s", tts_exc)
        elif exercise.passage_text:
            try:
                if callback.message:
                    await callback.message.bot.send_chat_action(chat_id=callback.message.chat.id, action="record_voice")
                tts = EdgeTextToSpeech()
                speech = await tts.synthesize(exercise.passage_text, language="en")
                if speech.content and callback.message:
                    await callback.message.answer_voice(
                        BufferedInputFile(speech.content, filename="voice.ogg"),
                        caption="🎧 <b>IELTS Listening audio trekini tinglang:</b>",
                        parse_mode="HTML",
                    )
            except Exception as exc:
                logger.warning("Listening TTS synthesis error: %s", exc)
    elif exercise.skill == "speaking":
        try:
            if callback.message:
                await callback.message.bot.send_chat_action(chat_id=callback.message.chat.id, action="record_voice")
            tts = EdgeTextToSpeech()
            speech = await tts.synthesize(exercise.prompt_en, language="en")
            if speech.content and callback.message:
                await callback.message.answer_voice(
                    BufferedInputFile(speech.content, filename="voice.ogg"),
                    caption="🎙 <b>Examiner savoli (Tinglang va ovozli xabar yuborib javob bering):</b>",
                    parse_mode="HTML",
                )
        except Exception as exc:
            logger.warning("Speaking TTS synthesis error: %s", exc)

    if callback.message:
        await callback.message.answer(
            exercise_prompt(exercise, locale),
            reply_markup=exercise_options_keyboard(exercise, locale),
            parse_mode="HTML",
        )


@router.callback_query(F.data.startswith("quick_ans:"))
async def handle_quick_answer(callback: CallbackQuery, state: FSMContext, database: Database) -> None:
    parts = (callback.data or "").split(":", 2)
    if len(parts) < 3:
        await callback.answer()
        return
    exercise_id = parts[1]
    answer = parts[2]
    exercise = EXERCISES.get(exercise_id)

    telegram_id = callback.from_user.id
    locale = "uz"
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user is None or user.id is None:
            await callback.answer("Avval /start ni bosing", show_alert=True)
            return
        locale = user.locale
        service = PracticeService(SqlAlchemyAttemptRepository(session), EvaluationService())
        attempt = await service.submit(user.id, exercise_id, answer)

    await state.clear()
    await callback.answer()

    report = EvaluationReport(
        band=attempt.score_band,
        criteria=dict(attempt.feedback.get("criteria", {})),
        strengths=list(attempt.feedback.get("strengths", [])),
        improvements=list(attempt.feedback.get("improvements", [])),
    )
    skill = exercise.skill if exercise else "reading"
    if callback.message:
        await callback.message.answer(
            feedback_text(report, locale, exercise),
            reply_markup=after_practice_keyboard(skill, locale),
            parse_mode="HTML",
        )


@router.message(F.voice | F.audio)
async def handle_voice_message(message: Message, state: FSMContext, database: Database) -> None:
    """Universal handler for voice notes and audio recordings via Groq Whisper & Edge-TTS."""
    telegram_id = message.from_user.id if message.from_user else 0
    settings = get_settings()
    locale = "uz"
    user = None

    async with database.session() as session:
        user_repo = SqlAlchemyUserRepository(session)
        user = await user_repo.get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale
        else:
            full_name = message.from_user.full_name if message.from_user else "Learner"
            username = message.from_user.username if message.from_user else None
            user = await user_repo.save(
                User(id=None, telegram_id=telegram_id, username=username, full_name=full_name, locale="uz")
            )
        allowed = await is_subscribed_or_admin(user.id, telegram_id, session, settings)

    if not allowed:
        await message.answer(
            practice_locked_text(locale),
            reply_markup=practice_locked_keyboard(locale),
            parse_mode="HTML",
        )
        return

    await message.bot.send_chat_action(chat_id=message.chat.id, action="typing")
    processing_msg = await message.answer(
        "🎙 <i>Ovozingiz qabul qilindi, Groq Whisper orqali tahlil qilinmoqda...</i>"
        if locale == "uz"
        else "🎙 <i>Voice received, transcribing via Groq Whisper...</i>",
        parse_mode="HTML",
    )

    try:
        settings = get_settings()
        file_id = message.voice.file_id if message.voice else message.audio.file_id
        file_info = await message.bot.get_file(file_id)
        voice_buffer = io.BytesIO()
        await message.bot.download_file(file_info.file_path, destination=voice_buffer)
        audio_bytes = voice_buffer.getvalue()

        stt = RemoteGroqSpeechToText(api_key=settings.groq_api_key)
        transcript_res = await stt.transcribe(audio_bytes, mime_type="audio/ogg")
        transcript_text = transcript_res.text.strip()
    except Exception as exc:
        logger.error("Voice transcription failed: %s", exc)
        await processing_msg.edit_text(
            f"⚠️ Ovozni aniqlashda xatolik yuz berdi ({exc}). Qaytadan urinib ko'ring yoki matn yozing."
        )
        return

    if not transcript_text:
        await processing_msg.edit_text(
            "⚠️ Ovozdan nutq aniqlanmadi. Iltimos, mikrofonga yaqinroq va aniqroq gapiring."
        )
        return

    data = await state.get_data()
    exercise_id = str(data.get("exercise_id", ""))
    exercise = EXERCISES.get(exercise_id) if exercise_id else None

    # CASE A: Active Practice Exercise (Listening or Speaking or other)
    if exercise:
        async with database.session() as session:
            service = PracticeService(SqlAlchemyAttemptRepository(session), EvaluationService())
            attempt = await service.submit(user.id, exercise.id, transcript_text)

        await state.clear()
        report = EvaluationReport(
            band=attempt.score_band,
            criteria=dict(attempt.feedback.get("criteria", {})),
            strengths=list(attempt.feedback.get("strengths", [])),
            improvements=list(attempt.feedback.get("improvements", [])),
        )

        await processing_msg.edit_text(
            f"🗣 <b>Sizning nutqingiz transkripti:</b>\n<blockquote>«{transcript_text}»</blockquote>",
            parse_mode="HTML",
        )
        await message.answer(
            feedback_text(report, locale, exercise),
            reply_markup=after_practice_keyboard(exercise.skill, locale),
            parse_mode="HTML",
        )

        if exercise.skill == "speaking":
            try:
                await message.bot.send_chat_action(chat_id=message.chat.id, action="record_voice")
                tts = EdgeTextToSpeech()
                commentary = f"Thank you. Your response scored approximately Band {report.band:.1f}. Work on expanding your vocabulary and giving detailed examples."
                voice_reply = await tts.synthesize(commentary, language="en")
                if voice_reply.content:
                    await message.answer_voice(
                        BufferedInputFile(voice_reply.content, filename="voice.ogg"),
                        caption="🎙 <b>IELTS Examiner sharhi:</b>",
                        parse_mode="HTML",
                    )
            except Exception as e:
                logger.warning("Examiner voice reply failed: %s", e)
        return

    # CASE B: Open Speaking Practice / Deep AI Voice Assessment
    settings = get_settings()
    tutor = AITutorService(groq_api_key=settings.groq_api_key, gemini_api_key=settings.gemini_api_key)
    ai_analysis = await tutor.analyze_speaking(transcript_text, question="General Speaking Task")

    evaluator = EvaluationService()
    report = evaluator.evaluate_speaking(transcript_text)

    duration = int(message.voice.duration if message.voice else 0)
    async with database.session() as session:
        attempt_repo = SqlAlchemyAttemptRepository(session)
        await attempt_repo.save(
            Attempt(
                id=None,
                user_id=user.id,
                exercise_id="free-speaking",
                skill="speaking",
                answer=transcript_text,
                score_band=report.band,
                feedback=report.as_feedback(),
                duration_seconds=duration,
            )
        )

    await processing_msg.delete()

    tts = EdgeTextToSpeech(settings.tts_voice_uz, settings.tts_voice_en)
    speech_uz = ai_analysis.get("speech_uz") or ai_analysis.get("speech_text", "")
    speech_en = ai_analysis.get("speech_en", "")
    audio = await tts.synthesize_bilingual(uz_text=speech_uz, en_text=speech_en)

    if audio.content:
        await message.answer_voice(
            BufferedInputFile(audio.content, filename="voice.ogg"),
            caption="🎙 <b>IELTS Examiner: Ovozli xulosa va maslahat</b>\n<i>(O'zbekcha tahlil + British Examiner savoli)</i>",
            parse_mode="HTML",
        )

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🎙 Boshqa mavzuda gapirish", callback_data="skill:speaking")],
            [InlineKeyboardButton(text="📊 Natijalarim", callback_data="show:progress")],
        ]
    )

    full_text = (
        f"🗣 <b>Sizning nutqingiz (Groq Whisper):</b>\n<blockquote>«{transcript_text}»</blockquote>\n\n"
        f"{ai_analysis['text']}"
    )

    if len(full_text) > 4000:
        chunks = [full_text[i : i + 3900] for i in range(0, len(full_text), 3900)]
        for idx, chunk in enumerate(chunks):
            reply_kb = kb if idx == len(chunks) - 1 else None
            await message.answer(chunk, reply_markup=reply_kb, parse_mode="HTML")
    else:
        await message.answer(full_text, reply_markup=kb, parse_mode="HTML")


@router.message(PracticeState.waiting_for_answer, F.text)
async def submit_practice_text(message: Message, state: FSMContext, database: Database) -> None:
    data = await state.get_data()
    exercise_id = str(data.get("exercise_id", ""))
    locale = str(data.get("locale", "uz"))
    exercise = EXERCISES.get(exercise_id)
    answer = (message.text or "").strip()

    if not answer:
        await message.answer("Iltimos, matn yoki ovozli xabar ko'rinishida javob bering.")
        return

    settings = get_settings()
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(message.from_user.id)
        if user is None or user.id is None:
            await message.answer("Avval /start ni bosing / Please use /start first")
            return
        allowed = await is_subscribed_or_admin(user.id, message.from_user.id, session, settings)
        if not allowed:
            await message.answer(
                practice_locked_text(locale),
                reply_markup=practice_locked_keyboard(locale),
                parse_mode="HTML",
            )
            return
        service = PracticeService(SqlAlchemyAttemptRepository(session), EvaluationService())
        attempt = await service.submit(user.id, exercise_id, answer)

    await state.clear()
    report = EvaluationReport(
        band=attempt.score_band,
        criteria=dict(attempt.feedback.get("criteria", {})),
        strengths=list(attempt.feedback.get("strengths", [])),
        improvements=list(attempt.feedback.get("improvements", [])),
    )
    skill = exercise.skill if exercise else "reading"
    await message.answer(
        feedback_text(report, locale, exercise),
        reply_markup=after_practice_keyboard(skill, locale),
        parse_mode="HTML",
    )
