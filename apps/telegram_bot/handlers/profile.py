from datetime import UTC, datetime
from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    LabeledPrice,
    Message,
    PreCheckoutQuery,
)

from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import (
    SqlAlchemyAttemptRepository,
    SqlAlchemyProfileRepository,
    SqlAlchemySubscriptionRepository,
    SqlAlchemyUserRepository,
)
from packages.ieltix_core.application.evaluation import EvaluationService
from packages.ieltix_core.application.practice import PracticeService
from packages.ieltix_core.application.subscriptions import (
    DuplicateChargeError,
    InvalidPayloadError,
    SubscriptionService,
)
from packages.ieltix_core.config import get_settings

router = Router(name="profile")

SUBSCRIPTION_SECRET = "sub-secret-key-32-chars-at-least"


def render_profile_card(user, profile, summary, active_sub, locale: str = "uz") -> str:
    sub_status = ""
    now = datetime.now(UTC)
    if active_sub and active_sub.valid_until:
        vu = (
            active_sub.valid_until
            if active_sub.valid_until.tzinfo is not None
            else active_sub.valid_until.replace(tzinfo=UTC)
        )
        if vu > now:
            days_left = max(1, (vu - now).days)
            date_str = vu.strftime("%d.%m.%Y")
            sub_status = (
                f"🟢 <b>VIP Faol</b> (Muddati: {date_str} gacha, {days_left} kun qoldi)"
                if locale == "uz"
                else f"🟢 <b>VIP Active</b> (Valid until: {date_str}, {days_left} days left)"
            )

    if not sub_status:
        sub_status = (
            "⚪️ <b>Bepul (Free) hisob</b>"
            if locale == "uz"
            else "⚪️ <b>Free Account</b>"
        )

    target_band = getattr(profile, "target_band", 7.0) if profile else 7.0
    current_band = getattr(profile, "current_band", 5.5) if profile else 5.5
    exam_type = (getattr(profile, "exam_type", "academic") if profile else "academic").title()
    phone = getattr(user, "phone_number", None) or ("Kiritilmagan" if locale == "uz" else "Not provided")
    tg_id = getattr(user, "telegram_id", 0)
    full_name = getattr(user, "full_name", "Nomzod")

    if locale == "en":
        skills = "\n".join(
            f"   • {skill.title()}: Band {band:.1f}"
            for skill, band in summary.by_skill.items()
        ) or "   • No test attempts yet."

        return (
            f"👤 <b>Candidate Profile — MockLife</b>\n\n"
            f"📋 <b>Personal Information:</b>\n"
            f"• <b>Full Name:</b> {full_name}\n"
            f"• <b>Telegram ID:</b> <code>{tg_id}</code>\n"
            f"• <b>Phone Number:</b> {phone}\n"
            f"• <b>Exam Format:</b> {exam_type}\n"
            f"• <b>Current Assessed Band:</b> Band {current_band:.1f}\n"
            f"• <b>Target Band:</b> Band {target_band:.1f}\n\n"
            f"📊 <b>Practice & Test Progress:</b>\n"
            f"• <b>Completed Tests:</b> {summary.completed}\n"
            f"• <b>Overall Average Band:</b> {summary.average_band:.1f}\n"
            f"<b>Skill Breakdown:</b>\n{skills}\n\n"
            f"⭐️ <b>Subscription Status:</b>\n{sub_status}\n\n"
            f"<i>Select an action below to manage your subscription or goals:</i>"
        )

    skills = "\n".join(
        f"   • {skill.title()}: Band {band:.1f}"
        for skill, band in summary.by_skill.items()
    ) or "   • Hozircha mashqlar bajarilmagan."

    return (
        f"👤 <b>MockLife Nomzod Profili</b>\n\n"
        f"📋 <b>Shaxsiy ma'lumotlar:</b>\n"
        f"• <b>Ism-sharif:</b> {full_name}\n"
        f"• <b>Telegram ID:</b> <code>{tg_id}</code>\n"
        f"• <b>Bog'langan raqam:</b> {phone}\n"
        f"• <b>Imtihon turi:</b> {exam_type}\n"
        f"• <b>Hozirgi baholangan daraja:</b> Band {current_band:.1f}\n"
        f"• <b>Maqsadli ball:</b> Band {target_band:.1f}\n\n"
        f"📊 <b>Mashq va Test Natijalari:</b>\n"
        f"• <b>Bajarilgan testlar:</b> {summary.completed} ta\n"
        f"• <b>O'rtacha umumiy ball:</b> {summary.average_band:.1f}\n"
        f"<b>Ko'nikmalar bo'yicha:</b>\n{skills}\n\n"
        f"⭐️ <b>Obuna holati:</b>\n{sub_status}\n\n"
        f"<i>Obuna tanlash yoki profilingizni sozlash uchun quyidagi tugmalardan foydalaning:</i>"
    )


def profile_inline_keyboard(locale: str) -> InlineKeyboardMarkup:
    if locale == "en":
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="⭐️ Choose VIP Subscription", callback_data="profile:sub_plans")],
                [
                    InlineKeyboardButton(text="🎯 Change Target Band", callback_data="profile:change_target"),
                    InlineKeyboardButton(text="🔄 Refresh", callback_data="profile:refresh"),
                ],
            ]
        )
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⭐️ VIP Obuna tanlash (Tariflar)", callback_data="profile:sub_plans")],
            [
                InlineKeyboardButton(text="🎯 Maqsadni o'zgartirish", callback_data="profile:change_target"),
                InlineKeyboardButton(text="🔄 Yangilash", callback_data="profile:refresh"),
            ],
        ]
    )


def subscription_plans_keyboard(locale: str) -> InlineKeyboardMarkup:
    if locale == "en":
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="⭐️ 1 Week Plus (49 Stars)", callback_data="sub:checkout:weekly")],
                [InlineKeyboardButton(text="⭐️ 1 Month VIP Plus (249 Stars)", callback_data="sub:checkout:monthly")],
                [InlineKeyboardButton(text="💳 Pay via Card (59,000 UZS - Coming soon)", callback_data="sub:card_pay")],
                [InlineKeyboardButton(text="⬅️ Back to Profile", callback_data="profile:show")],
            ]
        )
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⭐️ 1 haftalik Plus (49 Stars)", callback_data="sub:checkout:weekly")],
            [InlineKeyboardButton(text="⭐️ 1 oylik VIP Plus (249 Stars)", callback_data="sub:checkout:monthly")],
            [InlineKeyboardButton(text="💳 Karta orqali to'lov (59,000 so'm - Tez kunda)", callback_data="sub:card_pay")],
            [InlineKeyboardButton(text="⬅️ Profilga qaytish", callback_data="profile:show")],
        ]
    )



def change_target_keyboard(locale: str) -> InlineKeyboardMarkup:
    bands = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0]
    rows = []
    current_row = []
    for b in bands:
        current_row.append(InlineKeyboardButton(text=f"🎯 {b}", callback_data=f"profile:set_target:{b}"))
        if len(current_row) == 3:
            rows.append(current_row)
            current_row = []
    if current_row:
        rows.append(current_row)
    back_text = "⬅️ Bekor qilish / Orqaga" if locale == "uz" else "⬅️ Cancel / Back"
    rows.append([InlineKeyboardButton(text=back_text, callback_data="profile:show")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


async def _fetch_profile_data(telegram_id: int, database: Database):
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if not user:
            return None, None, None, None
        profile = await SqlAlchemyProfileRepository(session).get_by_user_id(user.id)
        summary = await PracticeService(
            SqlAlchemyAttemptRepository(session), EvaluationService()
        ).progress(user.id)
        active_sub = await SqlAlchemySubscriptionRepository(session).get_active(user.id)
        return user, profile, summary, active_sub


@router.message(Command("profile"))
@router.message(Command("me"))
@router.message(Command("subscribe"))
@router.message(Command("progress"))
@router.message(F.text.regexp(r"(?i)(profil|profile|natija|obuna)"))
@router.message(
    F.text.in_({
        "👤 Profil",
        "Profil",
        "Profile",
        "👤 Profile",
        "Natijalarim",
        "My progress",
        "📊 Natijalarim",
        "Obuna",
        "Subscription",
        "⭐️ Obuna",
    })
)
async def show_profile_message(message: Message, database: Database) -> None:
    telegram_id = message.from_user.id if message.from_user else 0
    user, profile, summary, active_sub = await _fetch_profile_data(telegram_id, database)
    if not user:
        await message.answer("Iltimos, avval /start ni bosing.")
        return

    text = render_profile_card(user, profile, summary, active_sub, user.locale)
    await message.answer(text, reply_markup=profile_inline_keyboard(user.locale), parse_mode="HTML")


@router.callback_query(F.data.in_({"profile:show", "profile:refresh"}))
async def show_profile_callback(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    user, profile, summary, active_sub = await _fetch_profile_data(telegram_id, database)
    if not user:
        await callback.answer("Foydalanuvchi topilmadi. /start ni bosing.", show_alert=True)
        return

    text = render_profile_card(user, profile, summary, active_sub, user.locale)
    if callback.message:
        try:
            await callback.message.edit_text(
                text,
                reply_markup=profile_inline_keyboard(user.locale),
                parse_mode="HTML",
            )
        except Exception:
            pass
    await callback.answer("Profil yangilandi! ✅" if user.locale == "uz" else "Profile refreshed! ✅")


@router.callback_query(F.data == "profile:sub_plans")
async def show_subscription_plans(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    user, _, _, _ = await _fetch_profile_data(telegram_id, database)
    locale = user.locale if user else "uz"

    if locale == "en":
        text = (
            "⭐️ <b>MockLife VIP Subscription Plans</b>\n\n"
            "Unlock 100% of the AI IELTS Platform:\n"
            "• 🎙 <b>Unlimited Live AI Speaking:</b> Real-time Examiner voice calls\n"
            "• ✍️ <b>Detailed Writing Evaluation:</b> Task 1 & 2 band descriptor feedback\n"
            "• 📖 <b>Cambridge Mock Tests:</b> Complete Reading & Listening sets\n"
            "• 📊 <b>Band Predictor:</b> Personalized strategy and progress tracking\n\n"
            "👇 <b>Available Plans:</b>\n"
            "• ⭐️ <b>1 Week Plus (7 days):</b> 49 Telegram Stars\n"
            "• ⭐️ <b>1 Month VIP Plus (30 days):</b> 249 Telegram Stars\n"
            "• 💳 <b>Card Payment:</b> 59,000 UZS / month <i>(⏳ Coming soon)</i>\n\n"
            "<b>Choose a plan below:</b>"
        )
    else:
        text = (
            "⭐️ <b>MockLife VIP Obuna Tariflari</b>\n\n"
            "Sun'iy intellekt murabbiyining barcha imkoniyatlarini oching:\n"
            "• 🎙 <b>Cheksiz AI Jonli Speaking:</b> Examiner bilan jonli ovozli suhbat\n"
            "• ✍️ <b>To'liq Writing Tekshiruvi:</b> Task 1 va 2 bo'yicha mezonli tahlil\n"
            "• 📖 <b>Rasmiy Cambridge Testlari:</b> Reading va Listening to'liq bazasi\n"
            "• 📊 <b>Shaxsiy Band Bashorati:</b> Kuchli va zaif tomonlar tahlili\n\n"
            "👇 <b>Mavjud Tariflar:</b>\n"
            "• ⭐️ <b>1 haftalik Plus (7 kun):</b> 49 Telegram Stars\n"
            "• ⭐️ <b>1 oylik VIP Plus (30 kun):</b> 249 Telegram Stars\n"
            "• 💳 <b>Karta orqali:</b> 59,000 so'm / oy <i>(⏳ Hozircha yo'lga qo'yilmagan / Tez kunda)</i>\n\n"
            "<b>O'zingizga qulay tarifni tanlang:</b>"
        )

    if callback.message:
        await callback.message.edit_text(
            text,
            reply_markup=subscription_plans_keyboard(locale),
            parse_mode="HTML",
        )
    await callback.answer()


@router.callback_query(F.data == "sub:card_pay")
async def show_card_payment_info(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    user, _, _, _ = await _fetch_profile_data(telegram_id, database)
    locale = user.locale if user else "uz"

    if locale == "en":
        text = (
            "💳 <b>Payment via Card / Click / Payme</b>\n\n"
            "• <b>Price:</b> 59,000 UZS / month (30 days)\n"
            "⏳ <b>Status:</b> Currently being configured (Coming very soon!).\n\n"
            "<i>For now, you can activate your subscription instantly using <b>Telegram Stars (49 ⭐️ weekly / 249 ⭐️ monthly)</b>.</i>\n\n"
            "For inquiries or manual assistance, please contact:\n"
            "👉 @IELTIX_Support"
        )
    else:
        text = (
            "💳 <b>Karta orqali to'lov (Click / Payme / Uzcard)</b>\n\n"
            "• <b>Narxi:</b> 59,000 so'm / 1 oy (30 kun)\n"
            "⏳ <b>Holati:</b> Hozircha yo'lga qo'yilmagan (Tez kunda ishga tushadi).\n\n"
            "<i>Hozirda obunani <b>Telegram Stars (49 ⭐️ haftalik / 249 ⭐️ oylik)</b> orqali bir zumda xavfsiz faollashtirishingiz mumkin!</i>\n\n"
            "Savollar yoki qo'lda ulash uchun admin bilan bog'laning:\n"
            "👉 @IELTIX_Support"
        )

    back_kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⬅️ Tariflarga qaytish" if locale == "uz" else "⬅️ Back to Plans", callback_data="profile:sub_plans")]
        ]
    )
    if callback.message:
        await callback.message.edit_text(text, reply_markup=back_kb, parse_mode="HTML")
    await callback.answer()


@router.callback_query(F.data.startswith("sub:checkout:"))
async def checkout_stars_plan(callback: CallbackQuery, database: Database) -> None:
    plan_code = callback.data.split(":", 2)[2]  # "weekly" or "monthly"
    telegram_id = callback.from_user.id
    user, _, _, _ = await _fetch_profile_data(telegram_id, database)
    if not user:
        await callback.answer("User profile not found", show_alert=True)
        return

    locale = user.locale
    service = SubscriptionService(database, secret=SUBSCRIPTION_SECRET)

    if plan_code in ("weekly", "1w", "week"):
        stars_amount = 49
        plan_name = "plus_weekly"
        title = "IELTIX Plus (1 Haftalik)" if locale == "uz" else "IELTIX Plus (1 Week)"
        desc = "1 haftalik (7 kun) AI IELTS murabbiyiga cheksiz kirish" if locale == "uz" else "1 week unlimited access to AI IELTS preparation"
    else:
        stars_amount = 249
        plan_name = "plus_monthly"
        title = "IELTIX VIP Plus (1 Oylik)" if locale == "uz" else "IELTIX VIP Plus (1 Month)"
        desc = "1 oylik (30 kun) AI IELTS murabbiyiga cheksiz kirish" if locale == "uz" else "1 month unlimited access to AI IELTS preparation"

    payload = service.create_invoice_payload(user.id, plan=plan_name)
    prices = [LabeledPrice(label=title, amount=stars_amount)]

    await callback.message.answer_invoice(
        title=title,
        description=desc,
        payload=payload,
        currency="XTR",
        prices=prices,
    )
    await callback.answer()



@router.callback_query(F.data == "profile:change_target")
async def show_change_target_menu(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    user, _, _, _ = await _fetch_profile_data(telegram_id, database)
    locale = user.locale if user else "uz"

    text = (
        "🎯 <b>Yangi maqsadli ballingizni tanlang:</b>"
        if locale == "uz"
        else "🎯 <b>Select your new target IELTS band:</b>"
    )

    if callback.message:
        await callback.message.edit_text(
            text,
            reply_markup=change_target_keyboard(locale),
            parse_mode="HTML",
        )
    await callback.answer()


@router.callback_query(F.data.startswith("profile:set_target:"))
async def save_new_target(callback: CallbackQuery, database: Database) -> None:
    new_band_str = callback.data.split(":", 2)[2]
    new_band = float(new_band_str)
    telegram_id = callback.from_user.id

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            profile_repo = SqlAlchemyProfileRepository(session)
            profile = await profile_repo.get_by_user_id(user.id)
            if profile:
                profile.target_band = new_band
                await session.commit()

    await callback.answer(
        f"🎯 Yangi maqsad: Band {new_band:.1f} o'rnatildi!"
        if (user and user.locale == "uz")
        else f"🎯 Target band updated to {new_band:.1f}!"
    )

    # Return to profile
    user, profile, summary, active_sub = await _fetch_profile_data(telegram_id, database)
    if user and callback.message:
        text = render_profile_card(user, profile, summary, active_sub, user.locale)
        await callback.message.edit_text(
            text,
            reply_markup=profile_inline_keyboard(user.locale),
            parse_mode="HTML",
        )


@router.pre_checkout_query()
async def process_pre_checkout(pre_checkout_query: PreCheckoutQuery, database: Database) -> None:
    service = SubscriptionService(database, secret=SUBSCRIPTION_SECRET)
    try:
        service.validate_payload(pre_checkout_query.invoice_payload)
        await pre_checkout_query.answer(ok=True)
    except InvalidPayloadError:
        await pre_checkout_query.answer(
            ok=False,
            error_message="To'lov ma'lumotlari yaroqsiz / Invalid payment invoice",
        )


@router.message(F.successful_payment)
async def process_successful_payment(message: Message, database: Database) -> None:
    payment = message.successful_payment
    if not payment:
        return

    telegram_id = message.from_user.id if message.from_user else 0
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if not user:
            return
        locale = user.locale
        user_id = user.id

    service = SubscriptionService(database, secret=SUBSCRIPTION_SECRET)
    try:
        days = 90 if "3months" in (payment.invoice_payload or "") else 30
        parsed = service.validate_payload(payment.invoice_payload)
        async with database.session() as session:
            repo = SqlAlchemySubscriptionRepository(session)
            existing = await repo.get_payment_by_charge_id(payment.telegram_payment_charge_id)
            if existing is None:
                await repo.record_payment(
                    user_id=user_id,
                    telegram_charge_id=payment.telegram_payment_charge_id,
                    payload=payment.invoice_payload,
                    amount=payment.total_amount,
                    currency=payment.currency,
                    provider_charge_id=payment.provider_payment_charge_id,
                )
                await repo.activate_or_extend(user_id=user_id, plan=parsed.get("plan", "premium_monthly"), duration_days=days)
    except DuplicateChargeError:
        pass
    except Exception:
        pass

    success_text = (
        f"🎉 <b>Tabriklaymiz! VIP Obunangiz muvaffaqiyatli faollashtirildi!</b>\n\n"
        f"Endi siz cheksiz AI Live Speaking, barcha Cambridge testlari va chuqur Writing tahlilidan foydalanishingiz mumkin."
        if locale == "uz"
        else f"🎉 <b>Congratulations! VIP Subscription Activated!</b>\n\n"
        f"You now have unlimited access to Live AI Speaking, full Cambridge tests, and comprehensive Writing evaluation."
    )
    await message.answer(success_text, parse_mode="HTML")
