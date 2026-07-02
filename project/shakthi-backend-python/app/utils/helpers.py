"""
Helper Utilities
General purpose utility functions
"""
import re
from datetime import datetime, date
from typing import Optional, Any, Dict
from uuid import UUID


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """Validate Indian phone number (10 digits)"""
    # Remove spaces and dashes
    cleaned = re.sub(r'[\s\-]', '', phone)
    # Check if it's a valid Indian number
    return bool(re.match(r'^[6-9]\d{9}$', cleaned))


def sanitize_string(s: str, max_length: int = 255) -> str:
    """Sanitize and truncate string"""
    if not s:
        return ""
    # Remove HTML tags
    s = re.sub(r'<[^>]+>', '', s)
    # Trim whitespace
    s = s.strip()
    # Truncate
    return s[:max_length]


def generate_ticket_id(prefix: str = "SAF") -> str:
    """Generate unique ticket ID"""
    import random
    import string
    random_part = ''.join(random.choices(string.digits, k=8))
    return f"{prefix}-{random_part}"


def format_date(d: date) -> str:
    """Format date as ISO string"""
    return d.isoformat() if d else ""


def format_datetime(dt: datetime) -> str:
    """Format datetime as ISO string"""
    return dt.isoformat() if dt else ""


def parse_date(s: str) -> Optional[date]:
    """Parse ISO date string"""
    try:
        return date.fromisoformat(s)
    except (ValueError, TypeError):
        return None


def parse_datetime(s: str) -> Optional[datetime]:
    """Parse ISO datetime string"""
    try:
        return datetime.fromisoformat(s.replace('Z', '+00:00'))
    except (ValueError, TypeError):
        return None


def uuid_to_str(uuid: UUID) -> str:
    """Convert UUID to string"""
    return str(uuid)


def str_to_uuid(s: str) -> Optional[UUID]:
    """Convert string to UUID"""
    try:
        return UUID(s)
    except (ValueError, AttributeError):
        return None


def calculate_age(birth_date: date) -> int:
    """Calculate age from birth date"""
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def mask_email(email: str) -> str:
    """Mask email for privacy (e.g., a***@example.com)"""
    if not email or '@' not in email:
        return email

    local, domain = email.split('@', 1)
    if len(local) <= 2:
        masked = local[0] + '***'
    else:
        masked = local[0] + '***' + local[-1]

    return f"{masked}@{domain}"


def mask_phone(phone: str) -> str:
    """Mask phone number (e.g., 98***4567)"""
    if not phone or len(phone) < 4:
        return phone

    return phone[:2] + '***' + phone[-4:]


def dict_to_query_string(d: Dict[str, Any]) -> str:
    """Convert dict to URL query string"""
    from urllib.parse import urlencode
    return urlencode({k: v for k, v in d.items() if v is not None})


def clean_dict(d: Dict[str, Any]) -> Dict[str, Any]:
    """Remove None values from dict"""
    return {k: v for k, v in d.items() if v is not None}


def split_name(full_name: str) -> tuple:
    """Split full name into first and last name"""
    parts = full_name.strip().split()
    if len(parts) == 0:
        return "", ""
    elif len(parts) == 1:
        return parts[0], ""
    else:
        return parts[0], " ".join(parts[1:])


def format_currency(amount: float, currency: str = "INR") -> str:
    """Format currency with symbol"""
    symbols = {
        "INR": "₹",
        "USD": "$",
        "EUR": "€"
    }
    symbol = symbols.get(currency, currency)
    return f"{symbol}{amount:,.2f}"


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text with suffix"""
    if not text or len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix
