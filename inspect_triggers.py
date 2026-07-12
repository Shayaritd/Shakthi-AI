import asyncio
from sqlalchemy import text
from app.database import engine

async def inspect():
    try:
        async with engine.connect() as conn:
            print("--- Triggers ---")
            res = await conn.execute(text("""
                SELECT  event_object_table AS table_name, trigger_name, event_manipulation AS event, action_statement AS action
                FROM information_schema.triggers
                ORDER BY table_name, trigger_name;
            """))
            for row in res:
                print(f"Table: {row[0]}, Name: {row[1]}, Event: {row[2]}")
                print(f"Action: {row[3]}")
                print("-" * 20)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(inspect())
