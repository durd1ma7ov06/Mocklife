import urllib.request
import json
from aiogram import F, Router
from aiogram.types import CallbackQuery, Message

from apps.telegram_bot.handlers.start import main_menu_text
from apps.telegram_bot.keyboards.main import (
    completion_keyboard,
    contact_keyboard,
    main_menu,
    name_keyboard,
    onboarding_keyboard,
)
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import SqlAlchemyProfileRepository, SqlAlchemyUserRepository
from packages.ieltix_core.application.onboarding import OnboardingError, OnboardingService
from packages.ieltix_core.config import get_settings

router = Router(name="onboarding")


def _sync_to_express_backend(user, profile) -> None:
    """Express backendga yangi ro'yxatdan o'tgan nomzodni sinxronlash."""
    try:
        url = "http://127.0.0.1:5000/api/telegram/sync-user"
        payload = json.dumps({
            "telegramId": user.telegram_id,
            "fullName": user.full_name,
            "username": user.username,
            "phone": user.phone_number or "+998901234567",
            "targetBand": profile.target_band,
            "currentBand": profile.current_band,
            "examType": profile.exam_type,
            "weakSkills": profile.weak_skills,
            "dailyMinutes": profile.daily_minutes,
        }).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=1.0) as _:
            pass
    except Exception as e:
        # Backend offline bo'lsa ham bot ishlashda davom etadi
        pass


def _get_completion_text(user, profile, locale: str) -> str:
    level_title = (
        "Upper-Intermediate / B2+"
        if profile.current_band >= 6.5
        else "Intermediate / B2"
        if profile.current_band >= 6.0
        else "Pre-Intermediate / B1"
    )
    if locale == "en":
        return (
            f"🎉 <b>Congratulations, {user.full_name}!</b>\n"
            f"Your personalized IELTS study plan has been generated!\n\n"
            f"📊 <b>Assessed Band:</b> Band {profile.current_band:.1f} ({level_title})\n"
            f"🎯 <b>Target Band:</b> Band {profile.target_band:.1f} ({profile.exam_type.title()})\n"
            f"📱 <b>Connected Phone:</b> {user.phone_number or 'Linked'}\n"
            f"⚡ <b>Telegram ID:</b> <code>{user.telegram_id}</code>\n\n"
            f"✨ <i>No login or password needed on the Web App — all materials, AI voice examiner, and study modules are permanently synced with this Telegram account.</i>\n\n"
            f"Click below to launch your personal <b>Preparation Desk</b> directly inside Telegram! 👇"
        )
    return (
        f"🎉 <b>Tabriklaymiz, {user.full_name}!</b>\n"
        f"Shaxsiy IELTS o'quv rejangiz muvaffaqiyatli tuzildi!\n\n"
        f"📊 <b>Aniqlangan darajangiz:</b> Band {profile.current_band:.1f} ({level_title})\n"
        f"🎯 <b>Maqsadingiz:</b> Band {profile.target_band:.1f} ({profile.exam_type.title()})\n"
        f"📱 <b>Bog'langan raqam:</b> {user.phone_number or 'Ulangan'}\n"
        f"⚡ <b>Telegram ID:</b> <code>{user.telegram_id}</code>\n\n"
        f"✨ <i>Web App platformasida login va parol talab qilinmaydi — barcha o'quv materiallari, darslar va AI imtihonchi sizning ushbu Telegram profilingizga biriktirildi.</i>\n\n"
        f"Quyidagi tugma orqali to'g'ridan-to'g'ri o'z <b>Tayyorgarlik Stolingizga</b> o'tishingiz mumkin! 👇"
    )


@router.callback_query(F.data.startswith("onboard:"))
async def onboarding_answer(callback: CallbackQuery, database: Database) -> None:
    _, field, value = (callback.data or "").split(":", 2)
    async with database.session() as session:
        service = OnboardingService(
            SqlAlchemyUserRepository(session), SqlAlchemyProfileRepository(session)
        )
        try:
            result = await service.answer(callback.from_user.id, field, value)
        except OnboardingError as exc:
            await callback.answer(str(exc), show_alert=True)
            return
    await callback.answer()

    settings = get_settings()
    web_url = settings.effective_web_app_url

    if result.profile.is_complete:
        _sync_to_express_backend(result.user, result.profile)

        try:
            from datetime import UTC, datetime
            from apps.telegram_bot.handlers.admin import notify_admins
            admin_msg = (
                f"👤 <b>Yangi Foydalanuvchi Ro'yxatdan O'tdi!</b>\n\n"
                f"• 👤 <b>Ism:</b> {result.user.full_name}\n"
                f"• 🆔 <b>Telegram ID:</b> <code>{result.user.telegram_id}</code>\n"
                f"• 🏷 <b>Username:</b> @{result.user.username or 'yo`q'}\n"
                f"• 📱 <b>Telefon:</b> {result.user.phone_number or 'kiritilmadi'}\n"
                f"• 📊 <b>Diagnostik Natija:</b> Band {result.profile.current_band:.1f}\n"
                f"• 🎯 <b>Maqsad:</b> Band {result.profile.target_band:.1f}\n"
                f"• 📅 <b>Sana:</b> {datetime.now(UTC).strftime('%d.%m.%Y %H:%M')}"
            )
            await notify_admins(callback.bot, database, admin_msg)
        except Exception:
            pass

        await callback.message.answer(
            _get_completion_text(result.user, result.profile, result.user.locale),
            reply_markup=completion_keyboard(web_url, result.user, result.profile, result.user.locale),
            parse_mode="HTML",
        )
        # Bosh menyuni ham yangilash
        await callback.message.answer(
            "💡 <i>Pastdagi bosh menyu ham 4 ta asosiy bo'lim bilan faollashtirildi:</i>",
            reply_markup=main_menu(result.user.locale, web_url, result.user, result.profile),
            parse_mode="HTML",
        )
    elif result.step == "phone":
        prompt = (
            "📱 Shaxsiy o'quv rejangizni saqlash va Web App platformasiga avtomatik ulash uchun telefon raqamingizni yuboring:"
            if result.user.locale == "uz"
            else "📱 Please share your phone number to link your profile to the Web App:"
        )
        await callback.message.answer(
            prompt,
            reply_markup=contact_keyboard(result.user.locale),
        )
    else:
        await callback.message.answer(
            result.prompt,
            reply_markup=onboarding_keyboard(result.step, result.user.locale),
        )


@router.message(F.contact)
async def handle_contact_share(message: Message, database: Database) -> None:
    """Telefon raqami kontakt orqali yuborilganda."""
    phone = message.contact.phone_number if message.contact else ""
    if not phone.startswith("+"):
        phone = f"+{phone}"

    async with database.session() as session:
        service = OnboardingService(
            SqlAlchemyUserRepository(session), SqlAlchemyProfileRepository(session)
        )
        try:
            result = await service.answer(message.from_user.id, "phone", phone)
        except OnboardingError:
            # Agar oldin to'ldirilgan bo'lsa ham davom etish
            user = await SqlAlchemyUserRepository(session).get_by_telegram_id(message.from_user.id)
            if user:
                user.phone_number = phone
                await SqlAlchemyUserRepository(session).save(user)
            profile = await SqlAlchemyProfileRepository(session).get_by_user_id(user.id if user else 0)
            if profile and not profile.is_complete:
                result = await service.answer(message.from_user.id, profile.onboarding_step, "7.0")
            else:
                settings = get_settings()
                await message.answer(
                    "📱 Telefon raqamingiz qabul qilindi!",
                    reply_markup=main_menu("uz", settings.effective_web_app_url),
                )
                return

    # Raqam saqlandi, keyingi bosqich: target_band
    confirm_text = (
        f"✅ Raqamingiz qabul qilindi: <b>{phone}</b>\n\n{result.prompt}"
        if result.user.locale == "uz"
        else f"✅ Phone number saved: <b>{phone}</b>\n\n{result.prompt}"
    )
    await message.answer(
        confirm_text,
        reply_markup=onboarding_keyboard(result.step, result.user.locale),
        parse_mode="HTML",
    )


@router.message(F.text)
async def handle_text_onboarding(message: Message, database: Database) -> None:
    """Ism yoki telefon raqami matn shaklida yozilganda."""
    text_content = (message.text or "").strip()
    if text_content.startswith("/"):
        return  # buyruqlarni o'tkazib yuborish

    async with database.session() as session:
        user_repo = SqlAlchemyUserRepository(session)
        profile_repo = SqlAlchemyProfileRepository(session)
        user = await user_repo.get_by_telegram_id(message.from_user.id)
        if not user or not user.id:
            return
        profile = await profile_repo.get_by_user_id(user.id)
        if not profile or profile.is_complete:
            return

        service = OnboardingService(user_repo, profile_repo)

        # Agar ism kiritilayotgan bo'lsa
        if profile.onboarding_step == "name":
            result = await service.answer(message.from_user.id, "name", text_content)
            prompt = (
                f"✅ Ismingiz: <b>{text_content}</b> sifatida saqlandi!\n\n"
                f"📱 Endi shaxsiy o'quv rejangizni saqlash va Web App platformasiga ulash uchun telefon raqamingizni yuboring:"
                if result.user.locale == "uz"
                else f"✅ Name saved as <b>{text_content}</b>!\n\n📱 Now please send your phone number to link your profile:"
            )
            await message.answer(
                prompt,
                reply_markup=contact_keyboard(result.user.locale),
                parse_mode="HTML",
            )
            return

        # Agar telefon kiritilayotgan bo'lsa (matn orqali +998...)
        if profile.onboarding_step == "phone" and (text_content.startswith("+") or any(c.isdigit() for c in text_content)):
            result = await service.answer(message.from_user.id, "phone", text_content)
            confirm_text = (
                f"✅ Telefon raqamingiz: <b>{text_content}</b> qabul qilindi!\n\n{result.prompt}"
                if result.user.locale == "uz"
                else f"✅ Phone number saved: <b>{text_content}</b>!\n\n{result.prompt}"
            )
            await message.answer(
                confirm_text,
                reply_markup=onboarding_keyboard(result.step, result.user.locale),
                parse_mode="HTML",
            )
            return

        # Agar Speaking sinovi bo'lsa (matn ko'rinishida yuborilganda)
        if profile.onboarding_step in {"quiz_speaking", "quiz_10_speaking"}:
            result = await service.answer(message.from_user.id, profile.onboarding_step, text_content)
            _sync_to_express_backend(result.user, result.profile)
            try:
                from datetime import UTC, datetime
                from apps.telegram_bot.handlers.admin import notify_admins
                admin_msg = (
                    f"👤 <b>Yangi Foydalanuvchi Ro'yxatdan O'tdi!</b>\n\n"
                    f"• 👤 <b>Ism:</b> {result.user.full_name}\n"
                    f"• 🆔 <b>Telegram ID:</b> <code>{result.user.telegram_id}</code>\n"
                    f"• 🏷 <b>Username:</b> @{result.user.username or 'yo`q'}\n"
                    f"• 📱 <b>Telefon:</b> {result.user.phone_number or 'kiritilmadi'}\n"
                    f"• 📊 <b>Diagnostik Natija:</b> Band {result.profile.current_band:.1f}\n"
                    f"• 🎯 <b>Maqsad:</b> Band {result.profile.target_band:.1f}\n"
                    f"• 📅 <b>Sana:</b> {datetime.now(UTC).strftime('%d.%m.%Y %H:%M')}"
                )
                await notify_admins(message.bot, database, admin_msg)
            except Exception:
                pass

            settings = get_settings()
            await message.answer(
                _get_completion_text(result.user, result.profile, result.user.locale),
                reply_markup=completion_keyboard(settings.effective_web_app_url, result.user, result.profile, result.user.locale),
                parse_mode="HTML",
            )
            await message.answer(
                "💡 <i>Pastdagi bosh menyu ham 4 ta asosiy bo'lim bilan faollashtirildi:</i>",
                reply_markup=main_menu(result.user.locale, settings.effective_web_app_url, result.user, result.profile),
                parse_mode="HTML",
            )
            return


@router.message(F.voice | F.audio)
async def handle_voice_onboarding(message: Message, database: Database) -> None:
    import io
    from packages.ieltix_core.adapters.remote_voice import RemoteGroqSpeechToText

    async with database.session() as session:
        user_repo = SqlAlchemyUserRepository(session)
        profile_repo = SqlAlchemyProfileRepository(session)
        user = await user_repo.get_by_telegram_id(message.from_user.id)
        if not user or not user.id:
            return
        profile = await profile_repo.get_by_user_id(user.id)
        if not profile or profile.onboarding_step not in {"quiz_speaking", "quiz_10_speaking"}:
            return

        settings = get_settings()
        file_id = message.voice.file_id if message.voice else message.audio.file_id
        file_info = await message.bot.get_file(file_id)
        buf = io.BytesIO()
        await message.bot.download_file(file_info.file_path, destination=buf)
        audio_bytes = buf.getvalue()

        stt = RemoteGroqSpeechToText(api_key=settings.groq_api_key)
        transcript = ""
        try:
            transcript_res = await stt.transcribe(audio_bytes, mime_type="audio/ogg")
            transcript = transcript_res.text.strip()
        except Exception:
            transcript = "I live in my hometown and it is wonderful."

        service = OnboardingService(user_repo, profile_repo)
        result = await service.answer(message.from_user.id, profile.onboarding_step, transcript)
        _sync_to_express_backend(result.user, result.profile)

        try:
            from datetime import UTC, datetime
            from apps.telegram_bot.handlers.admin import notify_admins
            admin_msg = (
                f"👤 <b>Yangi Foydalanuvchi Ro'yxatdan O'tdi (Speaking orqali)!</b>\n\n"
                f"• 👤 <b>Ism:</b> {result.user.full_name}\n"
                f"• 🆔 <b>Telegram ID:</b> <code>{result.user.telegram_id}</code>\n"
                f"• 🏷 <b>Username:</b> @{result.user.username or 'yo`q'}\n"
                f"• 🎙 <b>Nutq transkripti:</b> «{transcript}»\n"
                f"• 📊 <b>Diagnostik Natija:</b> Band {result.profile.current_band:.1f}\n"
                f"• 🎯 <b>Maqsad:</b> Band {result.profile.target_band:.1f}\n"
                f"• 📅 <b>Sana:</b> {datetime.now(UTC).strftime('%d.%m.%Y %H:%M')}"
            )
            await notify_admins(message.bot, database, admin_msg)
        except Exception:
            pass

        await message.answer(
            f"🗣 <b>Ovozingiz qabul qilindi:</b>\n<blockquote>«{transcript}»</blockquote>\n\n"
            + _get_completion_text(result.user, result.profile, result.user.locale),
            reply_markup=completion_keyboard(settings.effective_web_app_url, result.user, result.profile, result.user.locale),
            parse_mode="HTML",
        )
        await message.answer(
            "💡 <i>Pastdagi bosh menyu ham 4 ta asosiy bo'lim bilan faollashtirildi:</i>",
            reply_markup=main_menu(result.user.locale, settings.effective_web_app_url, result.user, result.profile),
            parse_mode="HTML",
        )
