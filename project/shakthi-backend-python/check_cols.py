import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    res = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications'")
    for row in res:
        print(f"{row['column_name']}: {row['data_type']}")
    await conn.close()

asyncio.run(main())
