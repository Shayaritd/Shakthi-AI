import asyncio
from sqlalchemy import text
from app.database import engine

async def check():
    async with engine.connect() as conn:
        print("=== CHECKING USER IN public.users ===")
        res = await conn.execute(text("""
            SELECT * FROM public.users WHERE id = '375c1f14-849d-4e42-a13b-43ffaaf32983';
        """))
        row = res.fetchone()
        if row:
            print("Found synced user in public.users:")
            print(row)
        else:
            print("User NOT found in public.users!")

if __name__ == '__main__':
    asyncio.run(check())
