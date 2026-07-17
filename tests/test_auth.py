"""
Test Authentication
Tests for auth endpoints
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.core.security import get_password_hash
from app.models.user import User, UserRole


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    """Test user registration"""
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "phone_number": "9876543299",
            "password": "TestPass@123",
            "role": "ATHLETE"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_signup_without_phone(client: AsyncClient):
    """Test user registration without phone number"""
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "full_name": "Test User No Phone",
            "email": "test_nophone@example.com",
            "password": "TestPass@123",
            "role": "ATHLETE"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "test_nophone@example.com"
    assert data["data"]["phone_number"] is None


@pytest.mark.asyncio
async def test_login(client: AsyncClient, test_user: User):
    """Test user login"""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "TestPass@123"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_user: User):
    """Test login with invalid password"""
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "wrongpassword"
        }
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, auth_headers: dict):
    """Test get current user endpoint"""
    response = await client.get(
        "/api/v1/auth/me",
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, refresh_token: str):
    """Test token refresh"""
    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]


# Fixtures
@pytest.fixture
async def client():
    """Create test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def test_user(db: AsyncSession):
    """Create test user"""
    user = User(
        full_name="Test Athlete",
        email="test_athlete@example.com",
        phone_number="9876543290",
        password_hash=get_password_hash("TestPass@123"),
        role=UserRole.ATHLETE,
        verified=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.fixture
async def auth_headers(test_user: User):
    """Create auth headers for test user"""
    from app.core.security import create_access_token
    token = create_access_token(str(test_user.id), test_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def refresh_token(test_user: User):
    """Create refresh token for test user"""
    from app.core.security import create_refresh_token
    return create_refresh_token(str(test_user.id), test_user.role)
