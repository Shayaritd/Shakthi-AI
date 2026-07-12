import asyncio
from sqlalchemy import text
from app.database import engine

async def inspect_rls():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT policyname, cmd, roles, qual, with_check 
                FROM pg_policies 
                WHERE tablename = 'athlete_profiles'
                ORDER BY cmd;
            """))
            print("--- athlete_profiles Policies ---")
            for row in result:
                print(f"Policy: {row[0]}")
                print(f"  Cmd: {row[1]}")
                print(f"  Roles: {row[2]}")
                print(f"  Qual: {row[3]}")
                print(f"  With Check: {row[4]}")
                print("-" * 20)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(inspect_rls())
