import asyncio
from sqlalchemy import text
from app.database import engine

async def check():
    async with engine.connect() as conn:
        print("=== CHECKING PROFILE IN public.profiles ===")
        res = await conn.execute(text("""
            SELECT * FROM public.profiles WHERE id = '1f948140-96a3-4675-958d-e09a955839f3';
        """))
        row = res.fetchone()
        if row:
            print("Found profile in public.profiles:")
            print(row)
        else:
            print("Profile NOT found in public.profiles!")

        print("\n=== CHECKING USER IN public.users ===")
        res = await conn.execute(text("""
            SELECT * FROM public.users WHERE id = '1f948140-96a3-4675-958d-e09a955839f3';
        """))
        row = res.fetchone()
        if row:
            print("Found user in public.users:")
            print(row)
        else:
            print("User NOT found in public.users!")

if __name__ == '__main__':
    asyncio.run(check())
