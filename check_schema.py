import asyncio
from sqlalchemy import text
from app.database import engine

async def check_schema():
    try:
        async with engine.connect() as conn:
            # Check mentorship_requests columns
            result = await conn.execute(
                text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mentorship_requests'")
            )
            print("✅ mentorship_requests columns:")
            for row in result:
                print(f"   - {row[0]}: {row[1]}")

            # Check foreign keys
            result = await conn.execute(
                text("""
                    SELECT
                        tc.constraint_name,
                        tc.table_name,
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_name = 'mentorship_requests'
                """)
            )
            print("\n✅ Foreign keys on mentorship_requests:")
            for row in result:
                print(f"   - {row[0]}: {row[1]}.{row[2]} -> {row[3]}.{row[4]}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_schema())