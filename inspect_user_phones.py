import asyncio
from sqlalchemy import text
from app.database import engine

async def check():
    async with engine.connect() as conn:
        print("=== UNIQUE PHONE NUMBERS IN public.users ===")
        res = await conn.execute(text("""
            SELECT id, full_name, email, phone_number 
            FROM public.users;
        """))
        for row in res:
            print(f"  - User: {row[1]} ({row[2]}), phone: {repr(row[3])}")

        print("\n=== UNIQUE PHONES IN public.profiles ===")
        res = await conn.execute(text("""
            SELECT id, full_name, phone 
            FROM public.profiles;
        """))
        for row in res:
            print(f"  - Profile: {row[1]}, phone: {repr(row[2])}")

if __name__ == '__main__':
    asyncio.run(check())
