import asyncio
from sqlalchemy import text
from app.database import engine

async def cleanup():
    async with engine.begin() as conn:
        print("Updating users with empty phone_number to NULL...")
        res1 = await conn.execute(text("""
            UPDATE public.users 
            SET phone_number = NULL 
            WHERE phone_number = '';
        """))
        print(f"Updated {res1.rowcount} rows in public.users.")

        print("Updating profiles with empty phone to NULL...")
        res2 = await conn.execute(text("""
            UPDATE public.profiles 
            SET phone = NULL 
            WHERE phone = '';
        """))
        print(f"Updated {res2.rowcount} rows in public.profiles.")

if __name__ == '__main__':
    asyncio.run(cleanup())
