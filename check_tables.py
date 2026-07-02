import asyncio
from sqlalchemy import text
from app.database import engine

async def check_tables():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            )
            tables = [row[0] for row in result]
            print(f"✅ Found {len(tables)} tables:")
            for table in sorted(tables):
                print(f"   - {table}")
            
            if len(tables) >= 15:
                print("\n✅ All 15 tables exist! Migration is complete.")
            else:
                print(f"\n⚠️ Expected 15 tables, found {len(tables)}. Run migration again.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_tables())