"""
Validators
Custom validation functions for request data
"""
import re
from typing import Optional, List
from datetime import date


def validate_password_strength(password: str) -> tuple:
    """
    Validate password strength.
    Returns (is_valid, list of errors)
    """
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters")

    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")

    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")

    if not re.search(r'\d', password):
        errors.append("Password must contain at least one digit")

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")

    return len(errors) == 0, errors


def validate_sport(sport: str) -> bool:
    """Validate sport name"""
    valid_sports = [
        "athletics", "archery", "badminton", "basketball", "boxing",
        "cricket", "cycling", "football", "gymnastics", "hockey",
        "judo", "kabaddi", "kho kho", "shooting", "swimming",
        "table tennis", "tennis", "volleyball", "weightlifting", "wrestling",
        "weightlifting", "fencing", "rowing", "sailing", "diving"
    ]
    return sport.lower() in valid_sports


def validate_achievement_level(level: str) -> bool:
    """Validate achievement level"""
    valid_levels = ["SCHOOL", "DISTRICT", "STATE", "NATIONAL", "INTERNATIONAL"]
    return level.upper() in valid_levels


def validate_future_date(d: date) -> bool:
    """Check if date is in the future"""
    return d > date.today()


def validate_past_date(d: date) -> bool:
    """Check if date is in the past"""
    return d < date.today()


def validate_indian_state(state: str) -> bool:
    """Validate Indian state/UT name"""
    valid_states = [
        "andhra pradesh", "arunachal pradesh", "assam", "bihar",
        "chhattisgarh", "goa", "gujarat", "haryana", "himachal pradesh",
        "jharkhand", "karnataka", "kerala", "madhya pradesh", "maharashtra",
        "manipur", "meghalaya", "mizoram", "nagaland", "odisha",
        "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana",
        "tripura", "uttar pradesh", "uttarakhand", "west bengal",
        "andaman and nicobar islands", "chandigarh", "dadra and nagar haveli",
        "daman and diu", "delhi", "jammu and kashmir", "ladakh",
        "lakshadweep", "puducherry"
    ]
    return state.lower() in valid_states


def validate_rating(rating: int) -> bool:
    """Validate rating is between 1 and 5"""
    return 1 <= rating <= 5


def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number"""
    # Remove spaces and dashes
    cleaned = re.sub(r'[\s\-]', '', phone)
    # Check if it's a valid Indian mobile number
    return bool(re.match(r'^[6-9]\d{9}$', cleaned))


def validate_pincode(pincode: str) -> bool:
    """Validate Indian PIN code"""
    return bool(re.match(r'^[1-9]\d{5}$', pincode))


def validate_age_range(age_range: str) -> bool:
    """Validate age range format (e.g., '14-18')"""
    pattern = r'^(\d{1,2})-(\d{1,2})$'
    match = re.match(pattern, age_range)
    if not match:
        return False
    min_age, max_age = int(match.group(1)), int(match.group(2))
    return 0 < min_age < max_age <= 100


def sanitize_html(content: str) -> str:
    """Remove HTML tags from content"""
    return re.sub(r'<[^>]+>', '', content)


def validate_url(url: str) -> bool:
    """Validate URL format"""
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url))


def validate_youtube_url(url: str) -> bool:
    """Validate YouTube URL"""
    patterns = [
        r'(youtube\.com/watch\?v=)',
        r'(youtu\.be/)',
        r'(youtube\.com/embed/)'
    ]
    return any(re.search(p, url) for p in patterns)
