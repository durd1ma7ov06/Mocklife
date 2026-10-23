import io
import logging
from pathlib import Path
from typing import Any
from uuid import uuid4

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    BufferedInputFile,
    CallbackQuery,
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    LabeledPrice,
    Message,
    ReplyKeyboardMarkup,
    WebAppInfo,
)

from apps.telegram_bot.keyboards.main import main_menu
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.remote_voice import EdgeTextToSpeech, RemoteGroqSpeechToText
from packages.ieltix_core.adapters.repositories import (
    SqlAlchemyLiveCallRepository,
    SqlAlchemyProfileRepository,
    SqlAlchemySubscriptionRepository,
    SqlAlchemyUserRepository,
)
from packages.ieltix_core.application.ai_tutor import AITutorService
from packages.ieltix_core.application.examiner import SpeakingSession
from packages.ieltix_core.application.subscriptions import SubscriptionService
from packages.ieltix_core.config import Settings, get_settings
from packages.ieltix_core.security.tokens import CallTokenService

logger = logging.getLogger(__name__)

LIVE_CALL_BANNER_PATH = Path(__file__).resolve().parent.parent / "assets" / "live_speaking_banner.jpg"

router = Router(name="bot_live_call")


class AILiveCallState(StatesGroup):
    chatting = State()


def live_chat_reply_keyboard(locale: str = "uz") -> ReplyKeyboardMarkup:
    exit_btn = "🚪 Suhbatni yakunlash" if locale == "uz" else "🚪 End Conversation"
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text=exit_btn)]],
        resize_keyboard=True,
    )


def live_chat_inline_keyboard(locale: str = "uz", web_url: str | None = None) -> InlineKeyboardMarkup:
    rows = [
        [
            InlineKeyboardButton(
                text="🎙 IELTS Part 1 Savoli" if locale == "uz" else "🎙 Part 1 Question",
                callback_data="live:part1",
            ),
            InlineKeyboardButton(
                text="📝 Part 2 Cue Card" if locale == "uz" else "📝 Part 2 Cue Card",
                callback_data="live:part2",
            ),
        ],
        [
            InlineKeyboardButton(
                text="⚖️ Grammatika / Q&A" if locale == "uz" else "⚖️ Grammar Q&A",
                callback_data="live:grammar",
            ),
            InlineKeyboardButton(
                text="🚪 Yakunlash" if locale == "uz" else "🚪 Exit",
                callback_data="live:exit",
            ),
        ],
    ]
    if web_url and web_url.startswith("https://") and "ngrok" not in web_url:
        rows.append([InlineKeyboardButton(text="🌐 Web Platformani ochish", web_app=WebAppInfo(url=web_url))])
    return InlineKeyboardMarkup(inline_keyboard=rows)


@router.message(Command("call"))
@router.message(F.text.regexp(r"(?i)(ai\s*live|live\s*call|live\s*tayyorlanish|jonli\s*suhbat)"))
@router.message(
    F.text.in_({
        "🎙 AI live tayyorlanish",
        "🎙 AI live tayyorlanish 🔒",
        "AI live tayyorlanish",
        "Ai live tayyorlanish",
        "🎙 AI Live Practice",
        "🎙 AI Live Practice 🔒",
        "AI Live Practice",
        "AI bilan jonli suhbat",
        "Live AI Call",
        "🎙 AI bilan jonli suhbat",
        "🎙 Live AI Call",
    })
)
async def open_live_call(message: Message, state: FSMContext, database: Database) -> None:
    telegram_id = message.from_user.id if message.from_user else 0
    settings = get_settings()

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if not user:
            await message.answer("Iltimos, avval /start ni bosing.")
            return

        sub_repo = SqlAlchemySubscriptionRepository(session)
        active_sub = await sub_repo.get_active(user.id)
        is_admin = telegram_id in settings.admin_ids or telegram_id == 6956456422 or getattr(user, "is_admin", False)

        if not is_admin and not active_sub:
            locked_text = (
                "🔒 <b>MockLife AI Live Speaking Call — VIP Plus</b>\n\n"
                "Jonli ovozli IELTS Examiner suhbatlari (Part 1, 2, 3) dan foydalanish uchun <b>Haftalik</b> yoki <b>Oylik</b> faol obuna talab qilinadi!\n\n"
                "<b>VIP Plus imkoniyatlari:</b>\n"
                "• 🎙 <b>Real-vaqtli AI Examiner:</b> Jonli ovozli suhbat (Part 1, 2, 3)\n"
                "• 🎧 Shovqin filtrlash va nutq to'xtashini aniqlash (Barge-in)\n"
                "• 📊 Fluency, Lexical, Grammar, Pronunciation tahlili\n"
                "• 🌐 Web Platforma (Mock Arena) ga to'liq kirish\n\n"
                "👇 <b>O'zingizga qulay tarifni tanlang:</b>\n"
                "• ⭐️ <b>1 haftalik Plus (7 kun):</b> 49 Telegram Stars\n"
                "• ⭐️ <b>1 oylik VIP Plus (30 kun):</b> 249 Telegram Stars\n"
                "• 💳 <b>Karta orqali:</b> 59,000 so'm / oy (Tez kunda)"
                if user.locale == "uz"
                else
                "🔒 <b>MockLife AI Live Speaking Call — VIP Plus</b>\n\n"
                "Real-time voice IELTS Examiner calls require an active <b>Weekly</b> or <b>Monthly</b> Plus subscription!\n\n"
                "<b>VIP Plus Features:</b>\n"
                "• 🎙 <b>Real-time AI Examiner:</b> Live voice interview (Part 1, 2, 3)\n"
                "• 🎧 Background noise filtering and voice activity detection\n"
                "• 📊 Detailed report across all 4 IELTS band criteria\n"
                "• 🌐 Full access to the Web Platform (Mock Arena)\n\n"
                "👇 <b>Choose your subscription plan:</b>\n"
                "• ⭐️ <b>1 Week Plus (7 days):</b> 49 Telegram Stars\n"
                "• ⭐️ <b>1 Month VIP Plus (30 days):</b> 249 Telegram Stars\n"
                "• 💳 <b>Card Payment:</b> 59,000 UZS / month (Coming soon)"
            )
            locked_keyboard = InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(
                        text="⭐️ 1 haftalik Plus (49 Stars)" if user.locale == "uz" else "⭐️ 1 Week Plus (49 Stars)",
                        callback_data="sub:checkout:weekly",
                    )],
                    [InlineKeyboardButton(
                        text="⭐️ 1 oylik VIP Plus (249 Stars)" if user.locale == "uz" else "⭐️ 1 Month VIP Plus (249 Stars)",
                        callback_data="sub:checkout:monthly",
                    )],
                    [InlineKeyboardButton(
                        text="💳 Karta orqali to'lov (Tez kunda)" if user.locale == "uz" else "💳 Pay via Card (Coming soon)",
                        callback_data="sub:card_pay",
                    )],
                ]
            )
            if LIVE_CALL_BANNER_PATH.exists():
                try:
                    await message.answer_photo(
                        photo=FSInputFile(LIVE_CALL_BANNER_PATH),
                        caption=locked_text,
                        reply_markup=locked_keyboard,
                        parse_mode="HTML",
                    )
                    return
                except Exception:
                    pass
            await message.answer(locked_text, reply_markup=locked_keyboard, parse_mode="HTML")
            return

        session_id = f"call-{uuid4().hex}"
        call = SpeakingSession(id=session_id, user_id=user.id, locale=user.locale)
        await SqlAlchemyLiveCallRepository(session).create(call)

    # Start Interactive Live Session in Telegram!
    await state.set_state(AILiveCallState.chatting)
    await state.update_data(history=[], session_id=session_id)

    welcome_text = (
        "🎙 <b>IELTIX AI Jonli Suhbatdoshi va Murabbiyiga xush kelibsiz!</b>\n\n"
        "Men sizning shaxsiy IELTS Speaking Examiner (imtihonchingiz) va ingliz tili repetitoringizman.\n\n"
        "🗣 <b>Qanday ishlaydi?</b>\n"
        "• <b>Ovozli xabar yuboring:</b> Mikrofonni bosib ushlab inglizcha gapiring — men sizga <b>ovozli audio xabar</b> qilib javob qaytaraman va nutqingizni tahlil qilaman!\n"
        "• 💬 <b>Matnli xabar yuboring:</b> Ingliz tili qoidalari, grammatika, IELTS savollari bo'yicha istalgan savolingizni o'zbekcha yoki inglizcha yozing, to'liq tushuntirib beraman.\n\n"
        "👇 <i>Quyidagi tezkor mavzulardan birini bosing yoki darhol mikrofonni bosib gapiring:</i>"
        if user.locale == "uz"
        else
        "🎙 <b>Welcome to IELTIX AI Live Speaking Practice & Tutor!</b>\n\n"
        "I am your official IELTS Speaking Examiner and language coach.\n\n"
        "🗣 <b>How to practice?</b>\n"
        "• <b>Send voice notes:</b> Hold the microphone and speak in English. I will reply with voice audio and real-time Band feedback!\n"
        "• 💬 <b>Send text questions:</b> Ask any grammar, vocabulary, or exam strategy questions in English or Uzbek.\n\n"
        "👇 <i>Choose a topic below or hold the mic and start speaking:</i>"
    )

    await message.answer(
        welcome_text,
        reply_markup=live_chat_reply_keyboard(user.locale),
        parse_mode="HTML",
    )

    # Initial spoken greeting
    try:
        await message.bot.send_chat_action(chat_id=message.chat.id, action="record_voice")
        tts = EdgeTextToSpeech(settings.tts_voice_uz, settings.tts_voice_en)
        if user.locale == "uz":
            uz_intro = "Assalomu alaykum! IELTIX jonli speaking imtihoniga xush kelibsiz. Men sizning imtihon oluvchingizman."
            en_q = "Hello! Welcome to your IELTS Speaking test. Let's begin with Part 1. Could you tell me a little bit about yourself and where you are from?"
            audio = await tts.synthesize_bilingual(uz_text=uz_intro, en_text=en_q)
            caption_text = (
                "🎙 <b>AI Examiner:</b>\n"
                "<i>Assalomu alaykum! IELTIX jonli speaking imtihoniga xush kelibsiz.</i>\n\n"
                f"«{en_q}»"
            )
            hist_content = f"{uz_intro} {en_q}"
        else:
            greeting = (
                "Hello! Welcome to your IELTS Speaking session. I am your examiner today. "
                "Let's begin with Part 1. Could you tell me a little bit about yourself and where you are from?"
            )
            audio = await tts.synthesize(greeting, language="en")
            caption_text = f"🎙 <b>AI Examiner:</b>\n«{greeting}»"
            hist_content = greeting

        if audio.content:
            await message.answer_voice(
                BufferedInputFile(audio.content, filename="examiner.ogg"),
                caption=caption_text,
                reply_markup=live_chat_inline_keyboard(user.locale),
                parse_mode="HTML",
            )
            # Record first turn in history
            data = await state.get_data()
            hist = data.get("history", [])
            hist.append({"role": "assistant", "content": hist_content})
            await state.update_data(history=hist, current_question="Could you tell me a little bit about yourself and where you are from?")
            return
    except Exception as e:
        logger.warning("Could not send initial voice greeting: %s", e)

    await message.answer(
        "🎙 <i>AI Examiner tayyor. Mikrofonni bosib birinchi savolga javob bering:</i>\n\n"
        "<b>«Could you tell me a little bit about yourself and where you are from?»</b>",
        reply_markup=live_chat_inline_keyboard(user.locale),
        parse_mode="HTML",
    )


@router.message(AILiveCallState.chatting, F.text.regexp(r"(?i)(yakunlash|exit|stop|tamom|bosh\s*menyu)"))
async def exit_live_call_text(message: Message, state: FSMContext, database: Database) -> None:
    await state.clear()
    telegram_id = message.from_user.id if message.from_user else 0
    locale = "uz"
    user = None
    profile = None
    settings = get_settings()

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale
            profile = await SqlAlchemyProfileRepository(session).get_by_user_id(user.id)

    exit_msg = (
        "✅ <b>Jonli AI suhbat yakunlandi.</b>\n"
        "Bosh menyuga qaytdingiz. Istalgan vaqt yana davom ettirishingiz mumkin!"
        if locale == "uz"
        else
        "✅ <b>Live AI session completed.</b>\n"
        "Returned to main menu. You can start again anytime!"
    )
    await message.answer(
        exit_msg,
        reply_markup=main_menu(locale, settings.effective_web_app_url, user, profile, has_plus=True),
        parse_mode="HTML",
    )


@router.callback_query(F.data == "live:exit")
async def exit_live_call_callback(callback: CallbackQuery, state: FSMContext, database: Database) -> None:
    await state.clear()
    telegram_id = callback.from_user.id
    locale = "uz"
    user = None
    profile = None
    settings = get_settings()

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale
            profile = await SqlAlchemyProfileRepository(session).get_by_user_id(user.id)

    exit_msg = (
        "✅ <b>Jonli AI suhbat yakunlandi.</b> Bosh menyuga qaytdingiz."
        if locale == "uz"
        else "✅ <b>Live AI session completed.</b> Returned to main menu."
    )
    if callback.message:
        await callback.message.answer(
            exit_msg,
            reply_markup=main_menu(locale, settings.effective_web_app_url, user, profile, has_plus=True),
            parse_mode="HTML",
        )
    await callback.answer()


@router.callback_query(AILiveCallState.chatting, F.data.in_({"live:part1", "live:part2", "live:grammar"}))
async def live_topic_trigger(callback: CallbackQuery, state: FSMContext) -> None:
    topic_map = {
        "live:part1": "Let's practice IELTS Speaking Part 1. Please ask me a typical Part 1 question.",
        "live:part2": "Let's practice IELTS Speaking Part 2. Give me a Cue Card topic with bullet points, and let me prepare to speak.",
        "live:grammar": "I have a question about English grammar and IELTS vocabulary. Please explain how to use complex sentences.",
    }
    prompt = topic_map.get(callback.data or "", "Let's practice Speaking.")
    settings = get_settings()
    data = await state.get_data()
    history = data.get("history", [])

    await callback.bot.send_chat_action(chat_id=callback.message.chat.id, action="typing")
    tutor = AITutorService(groq_api_key=settings.groq_api_key, gemini_api_key=settings.gemini_api_key)
    res = await tutor.chat(prompt, conversation_history=history)

    ai_text = res["text"]
    speech_text = res["speech_text"]
    history.append({"role": "user", "content": prompt})
    history.append({"role": "assistant", "content": ai_text})
    await state.update_data(history=history)

    # Synthesize audio
    tts = EdgeTextToSpeech(settings.tts_voice_uz, settings.tts_voice_en)
    audio = await tts.synthesize(speech_text, language=res["language"])

    if audio.content and callback.message:
        await callback.message.answer_voice(
            BufferedInputFile(audio.content, filename="examiner.ogg"),
            caption=f"🎙 <b>AI Examiner:</b>\n\n{ai_text}",
            reply_markup=live_chat_inline_keyboard("uz"),
            parse_mode="HTML",
        )
    elif callback.message:
        await callback.message.answer(
            f"🎙 <b>AI Examiner:</b>\n\n{ai_text}",
            reply_markup=live_chat_inline_keyboard("uz"),
            parse_mode="HTML",
        )
    await callback.answer()


@router.message(AILiveCallState.chatting, F.voice | F.audio)
async def handle_live_voice(message: Message, state: FSMContext, database: Database) -> None:
    settings = get_settings()
    telegram_id = message.from_user.id if message.from_user else 0
    locale = "uz"

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale

    await message.bot.send_chat_action(chat_id=message.chat.id, action="typing")
    processing = await message.answer(
        "🎧 <i>Nutqingiz tinglanmoqda va AI tahlil qilmoqda...</i>"
        if locale == "uz"
        else "🎧 <i>Listening and analyzing with AI Examiner...</i>",
        parse_mode="HTML",
    )

    try:
        file_id = message.voice.file_id if message.voice else message.audio.file_id
        file_info = await message.bot.get_file(file_id)
        buf = io.BytesIO()
        await message.bot.download_file(file_info.file_path, destination=buf)
        audio_bytes = buf.getvalue()

        stt = RemoteGroqSpeechToText(api_key=settings.groq_api_key)
        transcript_res = await stt.transcribe(audio_bytes, mime_type="audio/ogg")
        transcript = transcript_res.text.strip()
    except Exception as exc:
        logger.error("Live call STT error: %s", exc)
        await processing.edit_text(f"⚠️ Ovozni aniqlashda xatolik: {exc}. Qaytadan urinib ko'ring yoki yozing.")
        return

    if not transcript:
        await processing.edit_text("⚠️ Ovoz aniqlanmadi. Iltimos, mikrofonga yaqinroq gapiring.")
        return

    data = await state.get_data()
    history = data.get("history", [])
    last_question = data.get("current_question", "Describe your hobby or talk about your daily life.")

    await message.bot.send_chat_action(chat_id=message.chat.id, action="record_voice")
    tutor = AITutorService(groq_api_key=settings.groq_api_key, gemini_api_key=settings.gemini_api_key)
    res = await tutor.analyze_speaking(transcript, question=last_question)

    ai_text = res["text"]
    speech_uz = res.get("speech_uz") or res.get("speech_text", "")
    speech_en = res.get("speech_en", "")

    history.append({"role": "user", "content": transcript})
    history.append({"role": "assistant", "content": ai_text})
    update_data: dict[str, Any] = {"history": history}
    if speech_en:
        update_data["current_question"] = speech_en
    await state.update_data(**update_data)

    await processing.delete()

    tts = EdgeTextToSpeech(settings.tts_voice_uz, settings.tts_voice_en)
    audio = await tts.synthesize_bilingual(uz_text=speech_uz, en_text=speech_en)

    if audio.content:
        await message.answer_voice(
            BufferedInputFile(audio.content, filename="examiner.ogg"),
            caption="🎙 <b>AI Examiner: Ovozli tahlil va maslahat</b>\n<i>(O'zbekcha tahlil + British Examiner savoli)</i>",
            parse_mode="HTML",
        )

    full_report = (
        f"🗣 <b>Sizning nutqingiz (Groq Whisper):</b>\n<blockquote>«{transcript}»</blockquote>\n\n"
        f"{ai_text}"
    )

    # Telegram messages max length is 4096
    if len(full_report) > 4000:
        chunks = [full_report[i : i + 3900] for i in range(0, len(full_report), 3900)]
        for idx, chunk in enumerate(chunks):
            kb = live_chat_inline_keyboard(locale) if idx == len(chunks) - 1 else None
            await message.answer(chunk, reply_markup=kb, parse_mode="HTML")
    else:
        await message.answer(
            full_report,
            reply_markup=live_chat_inline_keyboard(locale),
            parse_mode="HTML",
        )


@router.message(AILiveCallState.chatting, F.text)
async def handle_live_text(message: Message, state: FSMContext, database: Database) -> None:
    user_text = message.text.strip()
    settings = get_settings()
    telegram_id = message.from_user.id if message.from_user else 0
    locale = "uz"

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale

    data = await state.get_data()
    history = data.get("history", [])

    await message.bot.send_chat_action(chat_id=message.chat.id, action="typing")
    tutor = AITutorService(groq_api_key=settings.groq_api_key, gemini_api_key=settings.gemini_api_key)
    res = await tutor.chat(user_text, conversation_history=history)

    ai_text = res["text"]
    speech_text = res["speech_text"]

    history.append({"role": "user", "content": user_text})
    history.append({"role": "assistant", "content": ai_text})
    await state.update_data(history=history)

    # Synthesize audio response
    await message.bot.send_chat_action(chat_id=message.chat.id, action="record_voice")
    tts = EdgeTextToSpeech(settings.tts_voice_uz, settings.tts_voice_en)
    audio = await tts.synthesize(speech_text, language=res["language"])

    if audio.content:
        await message.answer_voice(
            BufferedInputFile(audio.content, filename="examiner.ogg"),
            caption=f"🎙 <b>AI Murabbiy:</b>\n\n{ai_text}"[:1020],
            reply_markup=live_chat_inline_keyboard(locale),
            parse_mode="HTML",
        )
    else:
        await message.answer(
            f"🎙 <b>AI Murabbiy:</b>\n\n{ai_text}",
            reply_markup=live_chat_inline_keyboard(locale),
            parse_mode="HTML",
        )
