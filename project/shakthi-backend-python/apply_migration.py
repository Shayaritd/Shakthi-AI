import os
import asyncio
import asyncpg
import glob
from dotenv import load_dotenv

async def apply_all_migrations():
    # Load .env file
    load_dotenv()
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not found in environment or .env file.")
        return

    # Convert sync URL to asyncpg format if needed
    if db_url.startswith("postgresql+asyncpg://"):
        db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")

    print(f"Connecting to database via asyncpg: {db_url.split('@')[-1]}")
    
    migrations_dir = "../supabase/migrations"
    if not os.path.exists(migrations_dir):
        print(f"Error: Migrations folder not found at {migrations_dir}")
        return

    # Retrieve all SQL files and sort them chronologically
    sql_files = sorted(glob.glob(os.path.join(migrations_dir, "*.sql")))
    if not sql_files:
        print("No migration files found.")
        return

    print(f"Found {len(sql_files)} migration scripts to apply in order:")
    for path in sql_files:
        print(f"  - {os.path.basename(path)}")

    try:
        conn = await asyncpg.connect(db_url)
        print("\nConnected successfully! Applying migrations...")
        
        for sql_file in sql_files:
            file_name = os.path.basename(sql_file)
            print(f"Applying: {file_name} ...")
            
            with open(sql_file, "r", encoding="utf-8") as f:
                sql_content = f.read()
                
            try:
                # Execute migration
                await conn.execute(sql_content)
                print(f"Success: {file_name} applied.")
            except Exception as fe:
                # If table already exists, log and skip (allows re-running on partially initialized DBs)
                if "already exists" in str(fe):
                    print(f"Skipped / Table already exists in {file_name}")
                else:
                    print(f"Error in {file_name}: {fe}")
                    raise fe
        
        await conn.close()
        print("\nAll migrations executed successfully!")
    except Exception as e:
        print(f"\nMigration execution failed: {e}")
        raise e

if __name__ == "__main__":
    asyncio.run(apply_all_migrations())
