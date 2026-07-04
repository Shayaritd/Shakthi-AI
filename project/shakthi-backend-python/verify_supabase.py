import asyncio
from sqlalchemy import text
from app.database import engine

async def verify():
    print("--- Database Verification Report ---")
    try:
        async with engine.connect() as conn:
            print("1. Connection: SUCCESS")
            
            # Check vector extension
            try:
                res = await conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'"))
                ext = res.scalar()
                if ext:
                    print("2. pgvector extension: ENABLED")
                else:
                    print("2. pgvector extension: NOT FOUND")
            except Exception as ee:
                print("2. pgvector extension check failed:", str(ee))

            # Check tables
            try:
                res = await conn.execute(
                    text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                )
                tables = [row[0] for row in res]
                print("3. Existing tables in public schema:")
                for t in sorted(tables):
                    print(f"   - {t}")
                
                required = ["documents", "document_chunks"]
                missing = [r for r in required if r not in tables]
                if not missing:
                    print("4. RAG tables exist: YES")
                else:
                    print("4. RAG tables exist: NO (Missing:", missing, ")")
            except Exception as ee:
                print("3/4. Table checks failed:", str(ee))
                
    except Exception as e:
        print("1. Connection: FAILED:", str(e))

if __name__ == "__main__":
    asyncio.run(verify())
