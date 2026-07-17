import asyncio
from sqlalchemy import text
from app.database import engine

async def inspect():
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'mentor_profiles'
        """))
        print("Columns in athlete_profiles:")
        for row in res:
            print(f"  - {row[0]} ({row[1]})")

if __name__ == '__main__':
    asyncio.run(inspect())
