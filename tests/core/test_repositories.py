import tempfile
import unittest
from pathlib import Path

from packages.ieltix_core.adapters.database import Database
from packages.ieltix_core.adapters.repositories import SqlAlchemyUserRepository
from packages.ieltix_core.domain.models import User


class UserRepositoryTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "ieltix-test.db"
        self.database = Database(f"sqlite+aiosqlite:///{db_path.as_posix()}")
        await self.database.create_schema()

    async def asyncTearDown(self) -> None:
        await self.database.dispose()
        self.temp_dir.cleanup()

    async def test_saved_telegram_user_survives_a_new_session(self) -> None:
        async with self.database.session() as session:
            repository = SqlAlchemyUserRepository(session)
            saved = await repository.save(
                User(telegram_id=445566, full_name="Aziza Karimova", locale="uz")
            )
            self.assertIsNotNone(saved.id)

        async with self.database.session() as session:
            repository = SqlAlchemyUserRepository(session)
            loaded = await repository.get_by_telegram_id(445566)

        self.assertIsNotNone(loaded)
        self.assertEqual(loaded.full_name, "Aziza Karimova")
        self.assertEqual(loaded.locale, "uz")
