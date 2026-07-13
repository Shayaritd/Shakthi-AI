"""
Seed Data Script
Create initial data for testing and development
"""
import asyncio
import sys
from datetime import date, timedelta

sys.path.insert(0, '.')

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import async_session_factory
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.athlete import AthleteProfile, AchievementLevel
from app.models.mentor import MentorProfile
from app.models.scholarship import Scholarship
from app.models.college import College
from app.models.opportunity import Opportunity, OpportunityType
from app.models.training_resource import TrainingResource, TrainingCategory
from app.models.sponsor import SponsorProgram, SponsorType, SponsorStatus


async def create_seed_data(db: AsyncSession):
    """Create seed data for development"""

    print("Creating seed data...")

    # Create Users
    users = [
        # Athletes
        User(
            full_name="Priya Sharma",
            email="priya@email.com",
            phone_number="9876543210",
            password_hash=get_password_hash("password123"),
            role=UserRole.ATHLETE,
            verified=True,
            is_active=True
        ),
        User(
            full_name="Kavita Patel",
            email="kavita@email.com",
            phone_number="9876543211",
            password_hash=get_password_hash("password123"),
            role=UserRole.ATHLETE,
            verified=True,
            is_active=True
        ),
        # Mentors
        User(
            full_name="Coach Sunil Kumar",
            email="sunil@email.com",
            phone_number="9876543212",
            password_hash=get_password_hash("password123"),
            role=UserRole.MENTOR,
            verified=True,
            is_active=True
        ),
        User(
            full_name="Dr. Anjali Rao",
            email="anjali@email.com",
            phone_number="9876543213",
            password_hash=get_password_hash("password123"),
            role=UserRole.MENTOR,
            verified=True,
            is_active=True
        ),
        # Admin
        User(
            full_name="Admin User",
            email="admin@shakthi.app",
            phone_number="9876543200",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            verified=True,
            is_active=True
        ),
        # Safety Officer
        User(
            full_name="Safety Officer",
            email="safety@shakthi.app",
            phone_number="9876543201",
            password_hash=get_password_hash("safety123"),
            role=UserRole.SAFETY_OFFICER,
            verified=True,
            is_active=True
        ),
    ]

    db.add_all(users)
    await db.flush()

    # Create Athlete Profiles
    athlete_profiles = [
        AthleteProfile(
            user_id=users[0].id,
            sport="Kabaddi",
            district="Rohtak",
            state="Haryana",
            level=AchievementLevel.DISTRICT,
            bio="Aspiring Kabaddi player aiming for national level",
            goals="Represent India at Asian Games",
            guardian_name="Rajesh Sharma",
            guardian_phone="9988776655",
            profile_completion=75
        ),
        AthleteProfile(
            user_id=users[1].id,
            sport="Athletics",
            district="Pune",
            state="Maharashtra",
            level=AchievementLevel.STATE,
            bio="State level 400m runner",
            goals="Win medal at National Championships",
            guardian_name="Suresh Patel",
            guardian_phone="9988776656",
            profile_completion=80
        ),
    ]

    db.add_all(athlete_profiles)
    await db.flush()

    # Create Mentor Profiles
    mentor_profiles = [
        MentorProfile(
            user_id=users[2].id,
            expertise="Kabaddi",
            experience_years=10,
            verified=True,
            certifications={"level": "National", "certifications": ["NIS", "SAI"]},
            languages=["Hindi", "English"],
            trust_score=4.8,
            availability="Full-time",
            training_philosophy="Discipline and dedication lead to success",
            bio="Former national-level Kabaddi champion with 10 years of coaching experience. Specializes in rural athlete development.",
            district="Pune",
            state="Maharashtra",
            code_of_conduct_accepted=True,
            total_reviews=25,
            average_rating=4.8
        ),
        MentorProfile(
            user_id=users[3].id,
            expertise="Athletics, Sports Psychology",
            experience_years=8,
            verified=True,
            certifications={"level": "International", "certifications": ["PhD Sports Science"]},
            languages=["English", "Hindi", "Kannada"],
            trust_score=4.9,
            availability="Part-time",
            training_philosophy="Mental strength complements physical ability",
            bio="SAI certified coach with 8 years coaching national-level sprinters and long-distance runners.",
            district="Bengaluru Rural",
            state="Karnataka",
            code_of_conduct_accepted=True,
            total_reviews=42,
            average_rating=4.9
        ),
    ]

    db.add_all(mentor_profiles)
    await db.flush()

    # Create Scholarships
    scholarships = [
        Scholarship(
            name="Khelo India Scholarship",
            provider="Ministry of Youth Affairs and Sports",
            amount="₹5,00,000/year",
            eligibility="State/National level athletes",
            deadline=date.today() + timedelta(days=90),
            state=None,
            sport=None,
            girls_only=True,
            hostel_support=True,
            application_mode="Online via Khelo India portal",
            description="Full scholarship for talented female athletes"
        ),
        Scholarship(
            name="Haryana Sports Talent Search",
            provider="Haryana Sports Department",
            amount="₹2,00,000/year",
            eligibility="Haryana residents, District level and above",
            deadline=date.today() + timedelta(days=60),
            state="Haryana",
            sport=None,
            girls_only=False,
            hostel_support=True,
            application_mode="District Sports Office"
        ),
        Scholarship(
            name="Maharashtra Rural Sports Foundation",
            provider="Maharashtra Rural Sports Foundation",
            amount="₹1,50,000/year",
            eligibility="Rural athletes, income below 5 lakhs",
            deadline=date.today() + timedelta(days=45),
            state="Maharashtra",
            sport=None,
            girls_only=True,
            hostel_support=False,
            application_mode="Online"
        ),
    ]

    db.add_all(scholarships)
    await db.flush()

    # Create Colleges
    colleges = [
        College(
            name="Delhi University",
            location="Delhi",
            state="Delhi",
            sports_quota=True,
            fee_concession="50% for national level",
            hostel=True,
            supported_sports={"sports": ["Athletics", "Kabaddi", "Basketball", "Volleyball"]},
            last_date=date.today() + timedelta(days=120)
        ),
        College(
            name="Pune University",
            location="Pune, Maharashtra",
            state="Maharashtra",
            sports_quota=True,
            fee_concession="Full fee waiver for national medalists",
            hostel=True,
            supported_sports={"sports": ["Athletics", "Football", "Hockey", "Swimming"]},
            last_date=date.today() + timedelta(days=90)
        ),
        College(
            name="Panjab University",
            location="Chandigarh",
            state="Chandigarh",
            sports_quota=True,
            fee_concession="40% for state level",
            hostel=True,
            supported_sports={"sports": ["Athletics", "Kabaddi", "Wrestling", "Boxing"]},
            last_date=date.today() + timedelta(days=75)
        ),
    ]

    db.add_all(colleges)
    await db.flush()

    # Create Opportunities
    opportunities = [
        Opportunity(
            title="State Kabaddi Championship 2024",
            type=OpportunityType.TOURNAMENT,
            organization="Haryana Kabaddi Association",
            location="Rohtak, Haryana",
            state="Haryana",
            deadline=date.today() + timedelta(days=30),
            sport="Kabaddi",
            women_focused=True,
            contact_email="hka@example.com"
        ),
        Opportunity(
            title="National Athletics Federation Cup",
            type=OpportunityType.TOURNAMENT,
            organization="Athletics Federation of India",
            location="New Delhi",
            state="Delhi",
            deadline=date.today() + timedelta(days=45),
            sport="Athletics",
            women_focused=False,
            contact_email="afi@example.com"
        ),
        Opportunity(
            title="Sports Authority of India Selection Camp",
            type=OpportunityType.CAMP,
            organization="Sports Authority of India",
            location="Bangalore",
            state="Karnataka",
            deadline=date.today() + timedelta(days=60),
            sport=None,
            women_focused=True,
            contact_email="sai@example.com"
        ),
    ]

    db.add_all(opportunities)
    await db.flush()

    # Create Training Resources
    training_resources = [
        TrainingResource(
            title="Kabaddi Basic Skills and Drills",
            category=TrainingCategory.SKILLS_DRILLS,
            content="Learn fundamental Kabaddi skills including raid techniques, defense formations, and bonus point strategies.",
            duration="45 minutes",
            sport="Kabaddi",
            difficulty_level="Beginner",
            created_by=users[2].id
        ),
        TrainingResource(
            title="Nutrition Guide for Female Athletes",
            category=TrainingCategory.NUTRITION,
            content="Comprehensive nutrition guide covering iron requirements, protein needs, and meal planning for female athletes.",
            duration="30 minutes",
            sport=None,
            difficulty_level="All Levels",
            created_by=users[3].id
        ),
        TrainingResource(
            title="Mental Preparation for Competitions",
            category=TrainingCategory.MENTAL_WELLNESS,
            content="Techniques for mental preparation, visualization, and handling competition pressure.",
            duration="20 minutes",
            sport=None,
            difficulty_level="Intermediate",
            created_by=users[3].id
        ),
        TrainingResource(
            title="Understanding Menstrual Health in Sports",
            category=TrainingCategory.MENSTRUAL_HEALTH,
            content="Training around your cycle, managing period pain, and optimizing performance throughout the month.",
            duration="25 minutes",
            sport=None,
            difficulty_level="All Levels",
            created_by=users[3].id
        ),
    ]

    db.add_all(training_resources)
    await db.flush()

    # Create Sponsor Programs
    sponsor_programs = [
        SponsorProgram(
            name="Sports Equipment Support",
            sponsor_name="Sports India Foundation",
            type=SponsorType.EQUIPMENT,
            amount="Up to ₹50,000",
            eligibility="District level and above",
            status=SponsorStatus.OPEN,
            sport=None,
            women_focused=True
        ),
        SponsorProgram(
            name="Travel Assistance for Nationals",
            sponsor_name="Athletic Dreams Trust",
            type=SponsorType.TRAVEL,
            amount="Full travel support",
            eligibility="National level participants",
            status=SponsorStatus.OPEN,
            sport=None,
            women_focused=True
        ),
    ]

    db.add_all(sponsor_programs)

    await db.commit()

    print("Seed data created successfully!")
    print("\nTest accounts created:")
    print("Athlete: priya@email.com / password123")
    print("Athlete: kavita@email.com / password123")
    print("Mentor: sunil@email.com / password123")
    print("Mentor: anjali@email.com / password123")
    print("Admin: admin@shakthi.app / admin123")
    print("Safety: safety@shakthi.app / safety123")


async def main():
    """Run seed data creation"""
    async with async_session_factory() as db:
        await create_seed_data(db)


if __name__ == "__main__":
    asyncio.run(main())
