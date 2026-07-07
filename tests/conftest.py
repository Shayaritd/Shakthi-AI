"""
Test Configuration
Pytest configuration and fixtures
"""
import asyncio
import pytest
from typing import AsyncGenerator
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.database import Base
from app.config import settings


# Test database URL & engine configuration using schema-based isolation
TEST_DATABASE_URL = settings.async_database_url
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"server_settings": {"search_path": "shakthi_test,public"}},
    echo=False
)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Create database session for tests within a dedicated schema"""
    schema_name = "shakthi_test"
    
    # Clean up and recreate test schema
    async with test_engine.begin() as conn:
        await conn.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))
        await conn.execute(text(f"CREATE SCHEMA {schema_name}"))
        
        # Import all models to register them on Base.metadata
        import app.models
        
        # Create all tables in the clean schema
        await conn.run_sync(lambda sync_conn: Base.metadata.create_all(sync_conn, checkfirst=False))

    async with TestSessionLocal() as session:
        yield session

    # Drop schema cascade to clean up all test tables and preserve public schema
    async with test_engine.begin() as conn:
        await conn.execute(text(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE"))


@pytest.fixture
def test_settings():
    """Get test settings"""
    return settings


@pytest.fixture(autouse=True)
def override_database_dependency():
    """Override FastAPI get_db dependency to use the test database session factory"""
    from app.main import app
    from app.database import get_db

    async def _get_test_db() -> AsyncGenerator[AsyncSession, None]:
        async with TestSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.pop(get_db, None)


