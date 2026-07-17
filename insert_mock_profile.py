import asyncio
import uuid
from sqlalchemy import text
from app.database import engine

async def run_insert():
    uid = str(uuid.uuid4())
    async with engine.begin() as conn:
        print(f"Trying to insert profile with id: {uid}")
        try:
            await conn.execute(text(f"""
                INSERT INTO public.profiles (id, full_name, phone, role) 
                VALUES ('{uid}', 'Test User', NULL, 'ATHLETE');
            """))
            print("Insert succeeded!")
        except Exception as e:
            print("Insert failed with error:")
            print(e)

if __name__ == '__main__':
    asyncio.run(run_insert())
