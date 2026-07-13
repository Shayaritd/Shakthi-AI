import sys
sys.path.insert(0, '.')

import asyncio
import os
import httpx
from dotenv import load_dotenv
from sqlalchemy import text
from app.database import engine
from app.core.security import get_password_hash
import uuid

load_dotenv()
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

async def create_supabase_user(client: httpx.AsyncClient, email: str, password: str, full_name: str, role: str, phone: str):
    url = f"{supabase_url}/auth/v1/admin/users"
    headers = {
        "Authorization": f"Bearer {supabase_service_key}",
        "apikey": supabase_service_key,
        "Content-Type": "application/json"
    }
    
    # Check if user already exists in public.users database
    async with engine.connect() as conn:
        try:
            res = await conn.execute(text("SELECT id FROM public.users WHERE email = :email"), {"email": email.lower()})
            row = res.fetchone()
            if row:
                print(f"User {email} already exists in database with ID: {row[0]}")
                return row[0]
        except Exception as e:
            print(f"Checking existing user {email} got error: {e}. Attempting creation.")

    payload = {
        "email": email.lower(),
        "password": password,
        "email_confirm": True,
        "phone": phone,
        "user_metadata": {
            "full_name": full_name,
            "role": role,
            "phone": phone
        }
    }
    
    print(f"Creating Auth user {email} ({role})...")
    response = await client.post(url, json=payload, headers=headers)
    if response.status_code in (200, 201):
        data = response.json()
        user_id = data.get("id")
        print(f"Successfully created user {email} in auth with ID: {user_id}")
        return user_id
    else:
        print(f"Failed to create user {email}: {response.status_code} - {response.text}")
        async with engine.connect() as conn:
            try:
                res = await conn.execute(text("SELECT id FROM public.users WHERE email = :email"), {"email": email.lower()})
                row = res.fetchone()
                if row:
                    return row[0]
            except Exception:
                pass
        return None

async def main():
    if not supabase_url or not supabase_service_key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in env.")
        return

    async with httpx.AsyncClient() as client:
        # Create users in order: Guardian first, so we can link the minor to the guardian
        guardian_id = await create_supabase_user(client, "suresh@test.com", "Guardian@123", "Suresh Sharma", "GUARDIAN", "+919876543210")
        athlete_minor_id = await create_supabase_user(client, "athlete_minor@test.com", "Athlete@123", "Priya Sharma (Minor)", "ATHLETE", "+919000000001")
        athlete_adult_id = await create_supabase_user(client, "athlete_adult@test.com", "Athlete@123", "Ananya Reddy", "ATHLETE", "+919000000002")
        mentor_id = await create_supabase_user(client, "mentor_demo@test.com", "Mentor@123", "Coach Rajesh Kumar", "MENTOR", "+919000000003")
        admin_id = await create_supabase_user(client, "admin_demo@test.com", "Admin@123", "Admin User", "ADMIN", "+919000000004")
        
        users_to_update = [
            ("suresh@test.com", "Guardian@123", "GUARDIAN", "+919876543210"),
            ("athlete_minor@test.com", "Athlete@123", "ATHLETE", "+919000000001"),
            ("athlete_adult@test.com", "Athlete@123", "ATHLETE", "+919000000002"),
            ("mentor_demo@test.com", "Mentor@123", "MENTOR", "+919000000003"),
            ("admin_demo@test.com", "Admin@123", "ADMIN", "+919000000004")
        ]
        
        async with engine.begin() as conn:
            for email, pswd, role, phone in users_to_update:
                hashed = get_password_hash(pswd)
                
                check_user = await conn.execute(text("SELECT id FROM public.users WHERE email = :email"), {"email": email.lower()})
                user_row = check_user.fetchone()
                if user_row:
                    await conn.execute(
                        text("UPDATE public.users SET password_hash = :hash, role = :role, phone_number = :phone, verified = true WHERE id = :id"),
                        {"hash": hashed, "role": role, "phone": phone, "id": user_row[0]}
                    )
                    await conn.execute(
                        text("UPDATE public.profiles SET role = :role, phone = :phone, verified = true WHERE id = :id"),
                        {"role": role, "phone": phone, "id": user_row[0]}
                    )
            
            # Setup athlete_profiles and mentor_profiles
            if athlete_minor_id:
                await conn.execute(text("""
                    INSERT INTO public.athlete_profiles (user_id, sport, level, date_of_birth, guardian_name, guardian_phone, guardian_email, guardian_user_id, profile_completion)
                    VALUES (:user_id, 'Athletics', 'SCHOOL', '2010-07-12', 'Suresh Sharma', '+91 9876543210', 'suresh@test.com', :guardian_user_id, 100)
                    ON CONFLICT (user_id) DO UPDATE SET 
                        sport = 'Athletics',
                        level = 'SCHOOL',
                        date_of_birth = '2010-07-12',
                        guardian_name = 'Suresh Sharma',
                        guardian_phone = '+91 9876543210',
                        guardian_email = 'suresh@test.com',
                        guardian_user_id = :guardian_user_id,
                        profile_completion = 100
                """), {"user_id": athlete_minor_id, "guardian_user_id": guardian_id})
                print("Configured minor athlete profile.")
                
            if athlete_adult_id:
                await conn.execute(text("""
                    INSERT INTO public.athlete_profiles (user_id, sport, level, date_of_birth, profile_completion)
                    VALUES (:user_id, 'Badminton', 'STATE', '2006-01-01', 100)
                    ON CONFLICT (user_id) DO UPDATE SET 
                        sport = 'Badminton',
                        level = 'STATE',
                        date_of_birth = '2006-01-01',
                        profile_completion = 100
                """), {"user_id": athlete_adult_id})
                print("Configured adult athlete profile.")
                
            if mentor_id:
                await conn.execute(text("""
                    INSERT INTO public.mentor_profiles (user_id, expertise, experience_years, verified)
                    VALUES (:user_id, ARRAY['Athletics', 'Kabaddi'], 10, true)
                    ON CONFLICT (user_id) DO UPDATE SET 
                        expertise = ARRAY['Athletics', 'Kabaddi'],
                        experience_years = 10,
                        verified = true
                """), {"user_id": mentor_id})
                await conn.execute(text("UPDATE public.profiles SET verified = true WHERE id = :id"), {"id": mentor_id})
                await conn.execute(text("UPDATE public.users SET verified = true WHERE id = :id"), {"id": mentor_id})
                print("Configured mentor profile.")
                
        print("Demo users and profiles setup successfully!")

if __name__ == "__main__":
    asyncio.run(main())
