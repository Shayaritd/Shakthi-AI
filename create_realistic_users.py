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
from datetime import datetime

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
    
    # Check if user already exists in auth.users database
    async with engine.connect() as conn:
        try:
            res = await conn.execute(text("SELECT id FROM auth.users WHERE email = :email"), {"email": email.lower()})
            row = res.fetchone()
            if row:
                print(f"User {email} already exists in Auth with ID: {row[0]}")
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
                res = await conn.execute(text("SELECT id FROM auth.users WHERE email = :email"), {"email": email.lower()})
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

    # User lists definitions
    guardians = [
        {"name": "Rajesh Kumari", "email": "rajesh.kumari@shakthi.org", "password": "Guardian@123", "phone": "+919800000101", "relation": "MOTHER", "occupation": "Home Maker", "address": "Delhi"},
        {"name": "Prakash Reddy", "email": "prakash.reddy@shakthi.org", "password": "Guardian@123", "phone": "+919800000102", "relation": "FATHER", "occupation": "Businessperson", "address": "Hyderabad"},
        {"name": "Vikram Singh", "email": "vikram.singh@shakthi.org", "password": "Guardian@123", "phone": "+919800000103", "relation": "FATHER", "occupation": "Teacher", "address": "Varanasi"},
        {"name": "Meena Sharma", "email": "meena.sharma@shakthi.org", "password": "Guardian@123", "phone": "+919800000104", "relation": "GUARDIAN", "occupation": "Engineer", "address": "Rohtak"},
        {"name": "Savita Patel", "email": "savita.patel@shakthi.org", "password": "Guardian@123", "phone": "+919800000105", "relation": "MOTHER", "occupation": "Doctor", "address": "Ahmedabad"}
    ]

    athletes = [
        {"name": "Priya Kumari", "email": "priya.kumari@shakthi.org", "password": "Athlete@123", "phone": "+919000000201", "sport": "Athletics", "level": "SCHOOL", "dob": "2012-05-14", "guardian_email": "rajesh.kumari@shakthi.org", "state": "Delhi", "district": "South Delhi"},
        {"name": "Sneha Reddy", "email": "sneha.reddy@shakthi.org", "password": "Athlete@123", "phone": "+919000000202", "sport": "Badminton", "level": "DISTRICT", "dob": "2010-08-20", "guardian_email": "prakash.reddy@shakthi.org", "state": "Telangana", "district": "Hyderabad"},
        {"name": "Anjali Singh", "email": "anjali.singh@shakthi.org", "password": "Athlete@123", "phone": "+919000000203", "sport": "Kabaddi", "level": "SCHOOL", "dob": "2011-03-15", "guardian_email": "vikram.singh@shakthi.org", "state": "Uttar Pradesh", "district": "Varanasi"},
        {"name": "Kavita Patel", "email": "kavita.patel@shakthi.org", "password": "Athlete@123", "phone": "+919000000204", "sport": "Cricket", "level": "STATE", "dob": "2006-02-10", "guardian_email": "savita.patel@shakthi.org", "state": "Gujarat", "district": "Ahmedabad"},
        {"name": "Megha Sharma", "email": "megha.sharma@shakthi.org", "password": "Athlete@123", "phone": "+919000000205", "sport": "Athletics", "level": "STATE", "dob": "2007-11-05", "guardian_email": "meena.sharma@shakthi.org", "state": "Haryana", "district": "Rohtak"}
    ]

    mentors = [
        {"name": "Coach Sunil Kumar", "email": "sunil.kumar@shakthi.org", "password": "Mentor@123", "phone": "+919000000301", "expertise": ["Athletics", "Sprinting"], "experience": 12, "availability": "Weekdays 6-9 PM", "state": "Tamil Nadu", "district": "Chennai"},
        {"name": "Coach Priya Sharma", "email": "priya.sharma@shakthi.org", "password": "Mentor@123", "phone": "+919000000302", "expertise": ["Badminton", "Table Tennis"], "experience": 8, "availability": "Weekends 8 AM-12 PM", "state": "Maharashtra", "district": "Mumbai"},
        {"name": "Coach Rajesh Reddy", "email": "rajesh.reddy@shakthi.org", "password": "Mentor@123", "phone": "+919000000303", "expertise": ["Kabaddi", "Kho-Kho"], "experience": 15, "availability": "Weekdays 7-10 PM", "state": "Telangana", "district": "Hyderabad"},
        {"name": "Coach Ananya Singh", "email": "ananya.singh@shakthi.org", "password": "Mentor@123", "phone": "+919000000304", "expertise": ["Cricket", "Hockey"], "experience": 10, "availability": "Weekends 6-10 AM", "state": "Uttar Pradesh", "district": "Lucknow"},
        {"name": "Coach Vikram Patel", "email": "vikram.patel@shakthi.org", "password": "Mentor@123", "phone": "+919000000305", "expertise": ["Wrestling", "Boxing"], "experience": 14, "availability": "Weekdays 5-8 PM", "state": "Haryana", "district": "Rohtak"},
        {"name": "Coach Meera Iyer", "email": "meera.iyer@shakthi.org", "password": "Mentor@123", "phone": "+919000000306", "expertise": ["Swimming", "Triathlon"], "experience": 6, "availability": "Weekends 7-9 AM", "state": "Karnataka", "district": "Bangalore"},
        {"name": "Coach Arjun Nair", "email": "arjun.nair@shakthi.org", "password": "Mentor@123", "phone": "+919000000307", "expertise": ["Football", "Basketball"], "experience": 11, "availability": "Weekdays 6-9 PM", "state": "Kerala", "district": "Kochi"},
        {"name": "Coach Deepa Rao", "email": "deepa.rao@shakthi.org", "password": "Mentor@123", "phone": "+919000000308", "expertise": ["Yoga", "Gymnastics"], "experience": 9, "availability": "Weekends 8-10 AM", "state": "Andhra Pradesh", "district": "Vijayawada"}
    ]

    sponsors = [
        {"name": "Ravi Kumar", "email": "ravi.kumar@shakthi.org", "password": "Sponsor@123", "phone": "+919000000401", "org": "Sports India Foundation", "interest": ["Rural Athletes"]},
        {"name": "Neha Gupta", "email": "neha.gupta@shakthi.org", "password": "Sponsor@123", "phone": "+919000000402", "org": "Women in Sports NGO", "interest": ["Girl Athletes"]},
        {"name": "Suresh Reddy", "email": "suresh.reddy@shakthi.org", "password": "Sponsor@123", "phone": "+919000000403", "org": "Corporate Sports Fund", "interest": ["Talent Development"]},
        {"name": "Anita Desai", "email": "anita.desai@shakthi.org", "password": "Sponsor@123", "phone": "+919000000404", "org": "State Sports Board", "interest": ["State-Level Athletes"]},
        {"name": "Manoj Shah", "email": "manoj.shah@shakthi.org", "password": "Sponsor@123", "phone": "+919000000405", "org": "Sports Equipment Co", "interest": ["Equipment Sponsorship"]}
    ]

    async with httpx.AsyncClient() as client:
        # 1. Create Guardians first
        guardian_id_map = {}
        for g in guardians:
            uid = await create_supabase_user(client, g["email"], g["password"], g["name"], "GUARDIAN", g["phone"])
            if uid:
                guardian_id_map[g["email"]] = uid

        # 2. Create Athletes
        athlete_id_map = {}
        for a in athletes:
            uid = await create_supabase_user(client, a["email"], a["password"], a["name"], "ATHLETE", a["phone"])
            if uid:
                athlete_id_map[a["email"]] = uid

        # 3. Create Mentors
        mentor_id_map = {}
        for m in mentors:
            uid = await create_supabase_user(client, m["email"], m["password"], m["name"], "MENTOR", m["phone"])
            if uid:
                mentor_id_map[m["email"]] = uid

        # 4. Create Sponsors
        sponsor_id_map = {}
        for s in sponsors:
            uid = await create_supabase_user(client, s["email"], s["password"], s["name"], "SPONSOR", s["phone"])
            if uid:
                sponsor_id_map[s["email"]] = uid

        # Build guardian_email -> athlete_user_id map
        guardian_to_athlete_id = {}
        for a in athletes:
            g_email = a["guardian_email"]
            if g_email:
                guardian_to_athlete_id[g_email] = athlete_id_map.get(a["email"])

        # Now update DB tables using separate transactions for each user to avoid connection timeout/dropout
        
        # 1. Update general profiles for Athletes & insert into athlete_profiles FIRST
        for a in athletes:
            uid = athlete_id_map.get(a["email"])
            if not uid:
                continue
            hashed = get_password_hash(a["password"])
            
            # Retrieve linked guardian info
            guardian_uid = None
            g_name = None
            g_phone = None
            g_email = a["guardian_email"]
            if g_email:
                guardian_uid = guardian_id_map.get(g_email)
                # Find matching guardian in the list
                for g in guardians:
                    if g["email"] == g_email:
                        g_name = g["name"]
                        g_phone = g["phone"]
                        break

            async with engine.begin() as conn:
                # Update users and profiles
                await conn.execute(
                    text("UPDATE public.users SET email = :email, password_hash = :hash, role = 'ATHLETE', phone_number = :phone, verified = true WHERE id = :id"),
                    {"email": a["email"], "hash": hashed, "phone": a["phone"], "id": uid}
                )
                await conn.execute(
                    text("UPDATE public.profiles SET role = 'ATHLETE', phone = :phone, verified = true, state = :state, district = :district WHERE id = :id"),
                    {"phone": a["phone"], "state": a["state"], "district": a["district"], "id": uid}
                )
                
                 # Insert into athlete_profiles
                await conn.execute(text("""
                    INSERT INTO public.athlete_profiles (
                        id, user_id, sport, level, date_of_birth, state, district,
                        guardian_name, guardian_phone, guardian_email, guardian_user_id, profile_completion
                    ) VALUES (
                        :id, :user_id, :sport, :level, :date_of_birth, :state, :district,
                        :guardian_name, :guardian_phone, :guardian_email, :guardian_user_id, 100
                    ) ON CONFLICT (user_id) DO UPDATE SET
                        sport = :sport,
                        level = :level,
                        date_of_birth = :date_of_birth,
                        state = :state,
                        district = :district,
                        guardian_name = :guardian_name,
                        guardian_phone = :guardian_phone,
                        guardian_email = :guardian_email,
                        guardian_user_id = :guardian_user_id,
                        profile_completion = 100
                """), {
                    "id": uuid.uuid4(),
                    "user_id": uid,
                    "sport": a["sport"],
                    "level": a["level"],
                    "date_of_birth": datetime.strptime(a["dob"], "%Y-%m-%d").date(),
                    "state": a["state"],
                    "district": a["district"],
                    "guardian_name": g_name,
                    "guardian_phone": g_phone,
                    "guardian_email": g_email,
                    "guardian_user_id": guardian_uid
                })
            print(f"Configured athlete profile for {a['name']}")

        # 2. Update general profiles for Guardians & insert into guardian_profiles SECOND
        for g in guardians:
            uid = guardian_id_map.get(g["email"])
            if not uid:
                continue
            hashed = get_password_hash(g["password"])
            
            # Lookup linked athlete ID
            athlete_uid = guardian_to_athlete_id.get(g["email"])
            if not athlete_uid:
                print(f"Warning: No athlete linked to guardian {g['name']}")
                continue

            async with engine.begin() as conn:
                # Update users and profiles
                await conn.execute(
                    text("UPDATE public.users SET email = :email, password_hash = :hash, role = 'GUARDIAN', phone_number = :phone, verified = true WHERE id = :id"),
                    {"email": g["email"], "hash": hashed, "phone": g["phone"], "id": uid}
                )
                await conn.execute(
                    text("UPDATE public.profiles SET role = 'GUARDIAN', phone = :phone, verified = true, state = :state WHERE id = :id"),
                    {"phone": g["phone"], "state": g["address"], "id": uid}
                )
                # Insert into guardian_profiles
                await conn.execute(text("""
                    INSERT INTO public.guardian_profiles (id, user_id, athlete_id, relation, occupation, address, verified)
                    VALUES (:id, :user_id, :athlete_id, :relation, :occupation, :address, true)
                    ON CONFLICT (user_id) DO UPDATE SET
                        athlete_id = :athlete_id,
                        relation = :relation,
                        occupation = :occupation,
                        address = :address,
                        verified = true
                """), {"id": uuid.uuid4(), "user_id": uid, "athlete_id": athlete_uid, "relation": g["relation"], "occupation": g["occupation"], "address": g["address"]})
            print(f"Configured guardian profile for {g['name']}")

        # 3. Update general profiles for Mentors & insert into mentor_profiles
        for m in mentors:
            uid = mentor_id_map.get(m["email"])
            if not uid:
                continue
            hashed = get_password_hash(m["password"])
            
            async with engine.begin() as conn:
                # Update users and profiles
                await conn.execute(
                    text("UPDATE public.users SET email = :email, password_hash = :hash, role = 'MENTOR', phone_number = :phone, verified = true WHERE id = :id"),
                    {"email": m["email"], "hash": hashed, "phone": m["phone"], "id": uid}
                )
                await conn.execute(
                    text("UPDATE public.profiles SET role = 'MENTOR', phone = :phone, verified = true, state = :state, district = :district WHERE id = :id"),
                    {"phone": m["phone"], "state": m["state"], "district": m["district"], "id": uid}
                )
                                # Insert into mentor_profiles
                await conn.execute(text("""
                    INSERT INTO public.mentor_profiles (id, user_id, expertise, experience_years, verified, availability, state, district)
                    VALUES (:id, :user_id, :expertise, :experience_years, true, :availability, :state, :district)
                    ON CONFLICT (user_id) DO UPDATE SET
                        expertise = :expertise,
                        experience_years = :experience_years,
                        verified = true,
                        availability = :availability,
                        state = :state,
                        district = :district
                """), {
                    "id": uuid.uuid4(),
                    "user_id": uid,
                    "expertise": ", ".join(m["expertise"]) if isinstance(m["expertise"], list) else m["expertise"],
                    "experience_years": m["experience"],
                    "availability": m["availability"],
                    "state": m["state"],
                    "district": m["district"]
                })
            print(f"Configured mentor profile for {m['name']}")

        # 4. Update general profiles for Sponsors & insert into sponsor_profiles
        for s in sponsors:
            uid = sponsor_id_map.get(s["email"])
            if not uid:
                continue
            hashed = get_password_hash(s["password"])
            
            async with engine.begin() as conn:
                # Update users and profiles
                await conn.execute(
                    text("UPDATE public.users SET email = :email, password_hash = :hash, role = 'SPONSOR', phone_number = :phone, verified = true WHERE id = :id"),
                    {"email": s["email"], "hash": hashed, "phone": s["phone"], "id": uid}
                )
                await conn.execute(
                    text("UPDATE public.profiles SET role = 'SPONSOR', phone = :phone, verified = true WHERE id = :id"),
                    {"phone": s["phone"], "id": uid}
                )
            print(f"Configured sponsor profile for {s['name']}")

        print("All realistic test users created and configured successfully!")

if __name__ == "__main__":
    asyncio.run(main())
