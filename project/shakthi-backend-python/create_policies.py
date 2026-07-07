import asyncio
from sqlalchemy import text
from app.database import engine

async def run_sql(sql):
    try:
        async with engine.connect() as conn:
            await conn.execute(text(sql))
            await conn.commit()
            print("SUCCESS:", sql.strip())
    except Exception as e:
        # Ignore already exists errors
        err_str = str(e)
        if "already exists" in err_str:
            print("INFO: Policy already exists.")
        else:
            print("FAILED:", sql.strip(), "-", err_str[:150])

async def main():
    print("--- Configuring storage bucket and policies ---")
    await run_sql("INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;")
    await run_sql("CREATE POLICY \"Allow authenticated uploads to media\" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');")
    await run_sql("CREATE POLICY \"Allow public read from media\" ON storage.objects FOR SELECT TO public USING (bucket_id = 'media');")
    await run_sql("CREATE POLICY \"Allow owners to delete from media\" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');")

if __name__ == "__main__":
    asyncio.run(main())
