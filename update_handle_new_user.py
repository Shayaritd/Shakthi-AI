import asyncio
from sqlalchemy import text
from app.database import engine

async def update():
    async with engine.begin() as conn:
        print("Updating handle_new_user() function in PostgreSQL...")
        await conn.execute(text("""
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            BEGIN
              INSERT INTO public.profiles (id, full_name, phone, role, verified, is_active, preferred_language)
              VALUES (
                new.id,
                COALESCE(new.raw_user_meta_data->>'full_name', ''),
                NULLIF(COALESCE(new.raw_user_meta_data->>'phone', new.phone), ''),
                COALESCE(new.raw_user_meta_data->>'role', 'ATHLETE'),
                false,
                true,
                'en'
              )
              ON CONFLICT (id) DO NOTHING;
              RETURN new;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        """))
        print("Trigger function handle_new_user() updated successfully!")

if __name__ == '__main__':
    asyncio.run(update())
