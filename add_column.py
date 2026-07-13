import asyncio
from sqlalchemy import text
from app.database import engine

async def alter():
    async with engine.begin() as conn:
        print("Adding guardian_user_id column to athlete_profiles...")
        # Check if column exists first
        res = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'athlete_profiles' AND column_name = 'guardian_user_id'
        """))
        if not res.fetchone():
            await conn.execute(text("""
                ALTER TABLE public.athlete_profiles 
                ADD COLUMN guardian_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
            """))
            print("Successfully added guardian_user_id to athlete_profiles.")
        else:
            print("Column guardian_user_id already exists.")

if __name__ == '__main__':
    asyncio.run(alter())
