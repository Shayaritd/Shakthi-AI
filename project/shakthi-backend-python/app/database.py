"""
Database Configuration
SQLAlchemy async engine and session management
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from app.config import settings

# Naming convention for constraints
convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

metadata = MetaData(naming_convention=convention)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models"""
    metadata = metadata


import ssl
from loguru import logger

# Create secure SSL context for asyncpg database connection
ssl_context = None
try:
    import certifi
    ssl_context = ssl.create_default_context(cafile=certifi.where())
    ssl_context.check_hostname = True
    ssl_context.verify_mode = ssl.CERT_REQUIRED
    logger.info("Database SSL: Secure context initialized using certifi CAs.")
except Exception as e:
    logger.warning(f"Database SSL: Failed to initialize certifi secure context: {e}")

if not ssl_context:
    try:
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = True
        ssl_context.verify_mode = ssl.CERT_REQUIRED
        logger.info("Database SSL: Secure context initialized using default system CAs.")
    except Exception as e:
        logger.warning(f"Database SSL: Failed to initialize default secure context: {e}")

# Apply secure context or development-only fallback depending on environment.
# Local development on Windows sometimes lacks root CAs in python 3.11 environment,
# so we permit a warning-logged fallback with check_hostname=False in development mode.
if settings.ENVIRONMENT == "development":
    logger.warning("Database SSL: Local development environment detected. Initializing fallback SSL context with hostname verification disabled.")
    fallback_context = ssl.create_default_context()
    fallback_context.check_hostname = False
    fallback_context.verify_mode = ssl.CERT_NONE
    connect_args = {"ssl": fallback_context}
else:
    connect_args = {"ssl": ssl_context} if ssl_context else {}


# Create async engine
engine = create_async_engine(
    settings.async_database_url,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
    future=True,
    connect_args=connect_args,
)

# Create async session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session"""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database - create all tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Close database connections"""
    await engine.dispose()
