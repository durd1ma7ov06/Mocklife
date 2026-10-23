from aiogram import F, Router
from aiogram.types import CallbackQuery, Message

from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import SqlAlchemyAttemptRepository, SqlAlchemyUserRepository
from packages.ieltix_core.application.evaluation import EvaluationService
from packages.ieltix_core.application.practice import PracticeService

router = Router(name="progress")


def render_progress_text(summary, locale: str = "uz") -> str:
    if locale == "en":
        skills = "\n".join(f"• {skill.title()}: {band:.1f}" for skill, band in summary.by_skill.items())
        return (
            f"📊 <b>Your IELTS Progress:</b>\n\n"
            f"• <b>Completed Exercises:</b> {summary.completed}\n"
            f"• <b>Overall Average Band:</b> {summary.average_band:.1f}\n\n"
            f"<b>By Skill:</b>\n{skills or 'No practice attempts recorded yet.'}"
        )
    skills = "\n".join(f"• {skill.title()}: {band:.1f}" for skill, band in summary.by_skill.items())
    return (
        f"📊 <b>Sizning IELTS Natijalaringiz:</b>\n\n"
        f"• <b>Bajarilgan mock testlar:</b> {summary.completed} ta\n"
        f"• <b>Umumiy o'rtacha ball:</b> {summary.average_band:.1f}\n\n"
        f"<b>Ko'nikmalar bo'yicha:</b>\n{skills or 'Hozircha testlar bajarilmagan.'}"
    )


@router.message(F.text.in_({"Natijalarim", "My progress", "📊 Natijalarim", "📊 My progress"}))
async def show_progress(message: Message, database: Database) -> None:
    telegram_id = message.from_user.id if message.from_user else 0
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user is None or user.id is None:
            await message.answer("Avval /start ni bosing / Please use /start first")
            return
        locale = user.locale
        summary = await PracticeService(
            SqlAlchemyAttemptRepository(session), EvaluationService()
        ).progress(user.id)

    await message.answer(render_progress_text(summary, locale), parse_mode="HTML")


@router.callback_query(F.data == "show:progress")
async def show_progress_callback(callback: CallbackQuery, database: Database) -> None:
    telegram_id = callback.from_user.id
    async with database.session() as session:
        user = await SqlAlchemyUserRepository(session).get_by_telegram_id(telegram_id)
        if user is None or user.id is None:
            await callback.answer("Avval /start ni bosing", show_alert=True)
            return
        locale = user.locale
        summary = await PracticeService(
            SqlAlchemyAttemptRepository(session), EvaluationService()
        ).progress(user.id)

    await callback.answer()
    await callback.message.answer(render_progress_text(summary, locale), parse_mode="HTML")
