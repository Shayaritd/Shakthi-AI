import asyncio
from sqlalchemy import text
from app.database import engine

async def inspect():
    try:
        async with engine.connect() as conn:
            print("--- handle_new_user Definition ---")
            res = await conn.execute(text("""
                SELECT prosrc 
                FROM pg_proc 
                WHERE proname = 'handle_new_user';
            """))
            for row in res:
                print(row[0])
                print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(inspect())
