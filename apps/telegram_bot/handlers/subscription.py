from pathlib import Path

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.types import (
    CallbackQuery,
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    LabeledPrice,
    Message,
    PreCheckoutQuery,
)

VIP_BANNER_PATH = Path(__file__).resolve().parent.parent / "assets" / "vip_stars_banner.jpg"

from apps.telegram_bot.keyboards.main import main_menu
from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import (
    SqlAlchemyProfileRepository,
    SqlAlchemySubscriptionRepository,
    SqlAlchemyUserRepository,
)
from packages.ieltix_core.application.subscriptions import (
    DuplicateChargeError,
    InvalidPayloadError,
    SubscriptionService,
)
from packages.ieltix_core.config import get_settings

router = Router(name="subscription")


def subscription_menu_text(locale: str) -> str:
    if locale == "en":
        return (
            "⭐️ <b>MockLife Web Platform Access</b>\n\n"
            "Unlock all premium tools for your IELTS preparation:\n"
            "• 🌐 <b>Web App Platform:</b> Full 4-skill Computer-Delivered Mock Arena\n"
            "• 🎯 <b>Full Mock Practice:</b> Reading, Listening, Writing & Speaking tests\n"
            "• 🎙 <b>Unlimited Live AI Speaking Calls:</b> Real-time examiner simulations (Part 1, 2, 3)\n"
            "• ✍️ <b>Writing Studio:</b> AI band descriptor evaluations & corrections\n"
            "• 📊 <b>Progress Analytics:</b> Skill breakdown & band prediction\n\n"
            "👇 <b>Subscription Plan:</b>\n"
            "• ⭐️ <b>Web Platform Access (30 days):</b> 129 Telegram Stars"
        )
    return (
        "⭐️ <b>MockLife Web Platformasiga Kirish</b>\n\n"
        "MockLife premium imkoniyatlarini to'liq oching:\n"
        "• 🌐 <b>Web App Platforma:</b> Katta ekranda to'liq 4 ko'nikmali Mock Arena va Split-view\n"
        "• 🎯 <b>To'liq Mock Mashqlari:</b> Reading, Listening, Writing va Speaking testlari\n"
        "• 🎙 <b>Cheksiz AI Live Speaking Call:</b> Jonli ovozli IELTS Examiner suhbatlari (Part 1, 2, 3)\n"
        "• ✍️ <b>Writing Studio:</b> Insho tahlili va band baholash\n"
        "• 📊 <b>Shaxsiy Tahlil:</b> Kuchli/zaif tomonlar va progress monitoringi\n\n"
        "👇 <b>Obuna Tarifi:</b>\n"
        "• ⭐️ <b>Web saytga to'liq kirish (30 kun):</b> 129 Telegram Stars"
    )


def invoice_title_and_description(locale: str, plan_type: str = "monthly") -> tuple[str, str]:
    if locale == "en":
        return "MockLife Web Platform (129 Stars)", "30-day full access to Web Platform, Practice & AI Examiner"
    return "MockLife Web Platformasi (129 Stars)", "Web Platforma, Mashqlar va AI Examiner ga 30 kunlik to'liq kirish"



def payment_success_message(locale: str, plan_name: str = "plus_monthly") -> str:
    duration_str = "1 oyga (30 kunga)"
    duration_en = "30 days"

    if locale == "en":
        return (
            "🎉 <b>Congratulations!</b>\n\n"
            f"Your <b>MockLife Web Platform</b> subscription has been successfully activated for {duration_en}.\n"
            "All locks on Practice Mock Tests, AI Live Call and Web App Platform have been unlocked!"
        )
    return (
        "🎉 <b>Tabriklaymiz!</b>\n\n"
        f"<b>MockLife Web Platforma</b> obunangiz {duration_str} muvaffaqiyatli faollashtirildi.\n"
        "Barcha Mock mashqlar, AI Live Call va Web Platformadagi barcha qulflar ochildi!"
    )


def subscription_keyboard(locale: str) -> InlineKeyboardMarkup:
    if locale == "en":
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="⭐️ Web Platform Access (129 Stars)", callback_data="sub:checkout:monthly")],
            ]
        )
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="⭐️ Web saytga kirish (129 Stars)", callback_data="sub:checkout:monthly")],
        ]
    )


@router.message(Command("subscribe"))
@router.message(F.text.in_({"Obuna", "Subscription", "⭐️ Obuna", "⭐️ Subscription"}))
async def show_subscription_menu(message: Message, database: Database) -> None:
    telegram_id = message.from_user.id if message.from_user else 0
    locale = "uz"

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale

    text = subscription_menu_text(locale)
    markup = subscription_keyboard(locale)

    if VIP_BANNER_PATH.exists():
        try:
            await message.answer_photo(
                photo=FSInputFile(VIP_BANNER_PATH),
                caption=text,
                reply_markup=markup,
                parse_mode="HTML",
            )
            return
        except Exception:
            pass

    await message.answer(text, reply_markup=markup, parse_mode="HTML")


@router.callback_query(F.data.in_({"sub:checkout", "sub:checkout:weekly", "sub:checkout:monthly"}))
async def checkout_stars(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    settings = get_settings()

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if not user:
            await callback.answer("User profile not found", show_alert=True)
            return
        locale = user.locale
        user_id = user.id

    if callback.data == "sub:checkout":
        # If clicked from a generic lock button, present the plans keyboard
        text = subscription_menu_text(locale)
        kb = subscription_keyboard(locale)
        await callback.message.answer(text, reply_markup=kb, parse_mode="HTML")
        await callback.answer()
        return

    is_weekly = callback.data == "sub:checkout:weekly"
    plan_name = "plus_weekly" if is_weekly else "plus_monthly"
    price = settings.telegram_stars_weekly_price if is_weekly else settings.telegram_stars_price

    service = SubscriptionService(database, secret="sub-secret-key-32-chars-at-least")
    payload = service.create_invoice_payload(user_id, plan=plan_name)
    title, description = invoice_title_and_description(locale, plan_type="weekly" if is_weekly else "monthly")

    prices = [LabeledPrice(label=title, amount=price)]
    await callback.message.answer_invoice(
        title=title,
        description=description,
        payload=payload,
        currency="XTR",
        prices=prices,
        provider_token="",
    )
    await callback.answer()


@router.callback_query(F.data == "sub:card_pay")
async def show_card_payment_info(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    locale = "uz"
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user:
            locale = user.locale

    if locale == "en":
        text = (
            "💳 <b>Payment via Card (Click / Payme / Uzcard)</b>\n\n"
            "• <b>Price:</b> 59,000 UZS / month (30 days)\n"
            "⏳ <b>Status:</b> Currently being set up (Coming soon!).\n\n"
            "<i>For now, you can activate your subscription instantly using <b>Telegram Stars (49 ⭐️ weekly / 249 ⭐️ monthly)</b>.</i>\n\n"
            "For inquiries or manual card activation:\n"
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

    await callback.answer()
    await callback.message.answer(text, parse_mode="HTML")



@router.pre_checkout_query()
async def process_pre_checkout(pre_checkout_query: PreCheckoutQuery, database: Database) -> None:
    service = SubscriptionService(database, secret="sub-secret-key-32-chars-at-least")
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
    user = None
    profile = None
    locale = "uz"

    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if not user:
            return
        locale = user.locale
        user_id = user.id
        profile = await SqlAlchemyProfileRepository(session).get_by_user_id(user.id)

    service = SubscriptionService(database, secret="sub-secret-key-32-chars-at-least")
    try:
        await service.complete_payment(
            user_id=user_id,
            telegram_charge_id=payment.telegram_payment_charge_id,
            payload=payment.invoice_payload,
            amount=payment.total_amount,
            currency=payment.currency,
            provider_charge_id=payment.provider_payment_charge_id,
        )
    except DuplicateChargeError:
        pass  # Idempotently ignore already processed payment

    settings = get_settings()
    web_url = settings.effective_web_app_url

    try:
        from apps.telegram_bot.handlers.admin import notify_admins
        plan_desc = "1 haftalik (49 ⭐️)" if payment.total_amount == 49 else f"1 oylik ({payment.total_amount} ⭐️)"
        admin_text = (
            f"⭐️ <b>Yangi Xarid ({plan_desc})!</b>\n\n"
            f"• 👤 <b>Foydalanuvchi:</b> {user.full_name}\n"
            f"• 🆔 <b>Telegram ID:</b> <code>{user.telegram_id}</code>\n"
            f"• 🏷 <b>Username:</b> @{user.username or 'yo`q'}\n"
            f"• 💰 <b>Summa:</b> {payment.total_amount} {payment.currency}\n"
            f"• 📅 <b>Sana:</b> {datetime.now(UTC).strftime('%d.%m.%Y %H:%M')}"
        )
        await notify_admins(message.bot, database, admin_text)
    except Exception:
        pass

    await message.answer(
        payment_success_message(locale, plan_name=payment.invoice_payload),
        reply_markup=main_menu(locale, web_url, user, profile, has_plus=True),
        parse_mode="HTML",
    )

