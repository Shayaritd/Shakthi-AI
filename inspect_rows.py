import asyncio
from sqlalchemy import text
from app.database import engine

async def inspect():
    try:
        async with engine.connect() as conn:
            print("--- Profiles ---")
            res = await conn.execute(text("SELECT p.id, u.email, p.role, p.full_name, p.verified FROM profiles p JOIN users u ON p.id = u.id LIMIT 10;"))
            for row in res:
                print(f"ID: {row[0]}, Email: {row[1]}, Role: {row[2]}, Name: {row[3]}, Verified: {row[4]}")
            
            print("\n--- Athlete Profiles ---")
            res = await conn.execute(text("SELECT id, user_id, sport, level, profile_completion FROM athlete_profiles LIMIT 10;"))
            for row in res:
                print(f"ID: {row[0]}, UserID: {row[1]}, Sport: {row[2]}, Level: {row[3]}, Completion: {row[4]}")
                
            print("\n--- Notifications ---")
            res = await conn.execute(text("SELECT id, user_id, type, title, message FROM notifications LIMIT 5;"))
            for row in res:
                print(f"ID: {row[0]}, UserID: {row[1]}, Type: {row[2]}, Title: {row[3]}, Msg: {row[4]}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == '__main__':
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(inspect())
