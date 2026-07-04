import asyncio
import asyncpg
import sys

async def main():
    # Use direct IPv6 IP address
    url = "postgresql://postgres:Shayarigowda%401346@[2406:da18:167b:f902:2a23:4274:dd3a:e6df]:5432/postgres"
    print("Testing connection to IPv6 URL:", url)
    try:
        conn = await asyncpg.connect(url)
        print("SUCCESS: Connected to database!")
        await conn.close()
    except Exception as e:
        print("FAILED: Connection failed:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
