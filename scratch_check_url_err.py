import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
supabase_url = os.getenv("SUPABASE_URL")
anon_key = os.getenv("SUPABASE_ANON_KEY")

async def check():
    async with httpx.AsyncClient() as client:
        # Construct the exact URL from the console log
        select_str = "*,athlete:profiles!athlete_id(id,full_name,role,athlete_profiles(sport,level,date_of_birth,guardian_name,guardian_user_id)),mentor:profiles!mentor_id(id,full_name,role)"
        url = f"{supabase_url}/rest/v1/mentorship_requests?select={select_str}&order=created_at.desc"
        headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}",
        }
        res = await client.get(url, headers=headers)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")

        # Let's also check the update request that failed with 400
        # URL from console: mentorship_requests?id=eq.609784aa-0752-4f28-ade8-409edc42ba9c
        # (Wait, let's see why it would fail with 400)
        url_up = f"{supabase_url}/rest/v1/mentorship_requests?id=eq.609784aa-0752-4f28-ade8-409edc42ba9c"
        res_up = await client.patch(url_up, headers=headers, json={"guardian_approved": True})
        print(f"\nUpdate Status: {res_up.status_code}")
        print(f"Update Response: {res_up.text}")

if __name__ == '__main__':
    asyncio.run(check())
