import asyncio
from sqlalchemy import text
from app.database import engine

async def create_bucket():
    print("--- Creating Supabase Storage Bucket 'media' ---")
    sql_commands = [
        # Create 'media' bucket
        """
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('media', 'media', true)
        ON CONFLICT (id) DO NOTHING;
        """,
        # Enable RLS on storage.objects
        """
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        """,
        # Drop existing policies if any
        """
        DROP POLICY IF EXISTS "Allow authenticated uploads to media" ON storage.objects;
        """,
        """
        DROP POLICY IF EXISTS "Allow public read from media" ON storage.objects;
        """,
        """
        DROP POLICY IF EXISTS "Allow owners to delete from media" ON storage.objects;
        """,
        # Insert Policy
        """
        CREATE POLICY "Allow authenticated uploads to media"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'media');
        """,
        # Select Policy
        """
        CREATE POLICY "Allow public read from media"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'media');
        """,
        # Delete Policy
        """
        CREATE POLICY "Allow owners to delete from media"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
        """
    ]

    try:
        async with engine.connect() as conn:
            for i, sql in enumerate(sql_commands, 1):
                try:
                    await conn.execute(text(sql))
                    await conn.commit()
                    print(f"Command {i}: SUCCESS")
                except Exception as ex:
                    print(f"Command {i}: FAILED - {str(ex)}")
            print("Storage bucket setup completed successfully!")
    except Exception as e:
        print("Database connection failed:", str(e))

if __name__ == "__main__":
    asyncio.run(create_bucket())
