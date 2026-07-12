import asyncio
from sqlalchemy import text
from app.database import engine

async def inspect_rls():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT tablename, policyname, cmd, roles, qual, with_check 
                FROM pg_policies 
                WHERE schemaname = 'public'
                ORDER BY tablename, cmd;
            """))
            print("--- RLS Policies ---")
            for row in result:
                print(f"Table: {row[0]}")
                print(f"  Policy: {row[1]}")
                print(f"  Cmd: {row[2]}")
                print(f"  Roles: {row[3]}")
                print(f"  Qual: {row[4]}")
                print(f"  With Check: {row[5]}")
                print("-" * 20)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(inspect_rls())


