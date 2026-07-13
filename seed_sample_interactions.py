import sys
sys.path.insert(0, '.')

import asyncio
from datetime import datetime
from sqlalchemy import text
from app.database import engine
import uuid

async def main():
    async with engine.connect() as conn:
        # Find user IDs
        emails = [
            "rajesh.kumari@shakthi.org",
            "prakash.reddy@shakthi.org",
            "vikram.singh@shakthi.org",
            "priya.kumari@shakthi.org",
            "sneha.reddy@shakthi.org",
            "anjali.singh@shakthi.org",
            "kavita.patel@shakthi.org",
            "sunil.kumar@shakthi.org",
            "priya.sharma@shakthi.org",
            "ananya.singh@shakthi.org"
        ]
        
        user_ids = {}
        for email in emails:
            res_user = await conn.execute(text("SELECT id FROM public.users WHERE email = :email"), {"email": email})
            row = res_user.fetchone()
            if row:
                user_ids[email] = row[0]
            else:
                print(f"Could not find user: {email}")

    # Now execute inside a transaction
    async with engine.begin() as conn:
        # Clear existing sample requests/chats to prevent duplicates
        await conn.execute(text("DELETE FROM chat_messages"))
        await conn.execute(text("DELETE FROM chat_threads"))
        await conn.execute(text("DELETE FROM mentorship_requests"))
        print("Cleaned existing interactions tables.")

        # ----------------------------------------------------
        # Interaction 1: Pending Guardian Approval
        # Priya Kumari (Minor) requesting Coach Sunil Kumar
        # ----------------------------------------------------
        priya_kumari_id = user_ids.get("priya.kumari@shakthi.org")
        sunil_kumar_id = user_ids.get("sunil.kumar@shakthi.org")
        rajesh_kumari_id = user_ids.get("rajesh.kumari@shakthi.org")
        
        if priya_kumari_id and sunil_kumar_id and rajesh_kumari_id:
            req1_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO mentorship_requests (
                    id, athlete_id, mentor_id, guardian_id, status, goal, mode, message, guardian_approved, created_at, updated_at
                ) VALUES (
                    :id, :athlete_id, :mentor_id, :guardian_id, 'PENDING_GUARDIAN', 'Sprinting guidance', 'ONLINE', 
                    'Hello coach, I am looking for sprinting coaching for school zonal tournaments.', false, now(), now()
                )
            """), {
                "id": req1_id,
                "athlete_id": priya_kumari_id,
                "mentor_id": sunil_kumar_id,
                "guardian_id": rajesh_kumari_id
            })
            print("Seeded Interaction 1: Priya Kumari -> Coach Sunil Kumar (Pending Guardian)")

        # ----------------------------------------------------
        # Interaction 2: Approved, Active, with Chat
        # Sneha Reddy (Minor) -> Coach Priya Sharma
        # Approved by guardian Prakash Reddy & accepted by coach
        # ----------------------------------------------------
        sneha_reddy_id = user_ids.get("sneha.reddy@shakthi.org")
        priya_sharma_id = user_ids.get("priya.sharma@shakthi.org")
        prakash_reddy_id = user_ids.get("prakash.reddy@shakthi.org")

        if sneha_reddy_id and priya_sharma_id and prakash_reddy_id:
            req2_id = uuid.uuid4()
            # Seed request
            await conn.execute(text("""
                INSERT INTO mentorship_requests (
                    id, athlete_id, mentor_id, guardian_id, status, goal, mode, message, guardian_approved, guardian_approval_date, created_at, updated_at
                ) VALUES (
                    :id, :athlete_id, :mentor_id, :guardian_id, 'APPROVED', 'Badminton practice details', 'ONLINE', 
                    'Hi coach, looking for help with my backhand strokes.', true, now(), now(), now()
                )
            """), {
                "id": req2_id,
                "athlete_id": sneha_reddy_id,
                "mentor_id": priya_sharma_id,
                "guardian_id": prakash_reddy_id
            })

            # Seed chat thread
            thread_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO chat_threads (
                    id, athlete_id, mentor_id, mentorship_request_id, is_active, is_blocked, last_message_at, created_at, updated_at
                ) VALUES (
                    :id, :athlete_id, :mentor_id, :req_id, true, false, now(), now(), now()
                )
            """), {
                "id": thread_id,
                "athlete_id": sneha_reddy_id,
                "mentor_id": priya_sharma_id,
                "req_id": req2_id
            })

            # Seed chat messages
            messages = [
                (sneha_reddy_id, "Hello Coach Priya, I am excited to start our badminton training under your mentorship!"),
                (priya_sharma_id, "Hello Sneha, I'm glad to have you! Let's start with basic footwork drills this weekend."),
                (sneha_reddy_id, "Sure coach, looking forward to it!")
            ]

            for sender_id, msg_content in messages:
                msg_id = uuid.uuid4()
                await conn.execute(text("""
                    INSERT INTO chat_messages (
                        id, thread_id, sender_id, content, read, guardian_visible, is_system_message, moderation_flag, created_at
                    ) VALUES (
                        :id, :thread_id, :sender_id, :content, false, true, false, false, now()
                    )
                """), {
                    "id": msg_id,
                    "thread_id": thread_id,
                    "sender_id": sender_id,
                    "content": msg_content
                })
            print("Seeded Interaction 2: Sneha Reddy -> Coach Priya Sharma (Approved & Active Chat Thread)")

        # ----------------------------------------------------
        # Interaction 3: Adult Direct Connection
        # Kavita Patel (Adult) -> Coach Ananya Singh
        # ----------------------------------------------------
        kavita_patel_id = user_ids.get("kavita.patel@shakthi.org")
        ananya_singh_id = user_ids.get("ananya.singh@shakthi.org")

        if kavita_patel_id and ananya_singh_id:
            req3_id = uuid.uuid4()
            # Seed request
            await conn.execute(text("""
                INSERT INTO mentorship_requests (
                    id, athlete_id, mentor_id, status, goal, mode, message, guardian_approved, created_at, updated_at
                ) VALUES (
                    :id, :athlete_id, :mentor_id, 'APPROVED', 'Cricket trial prep', 'ONLINE', 
                    'Coach, I need net practice and batting suggestions.', true, now(), now()
                )
            """), {
                "id": req3_id,
                "athlete_id": kavita_patel_id,
                "mentor_id": ananya_singh_id
            })

            # Seed chat thread
            thread_id = uuid.uuid4()
            await conn.execute(text("""
                INSERT INTO chat_threads (
                    id, athlete_id, mentor_id, mentorship_request_id, is_active, is_blocked, last_message_at, created_at, updated_at
                ) VALUES (
                    :id, :athlete_id, :mentor_id, :req_id, true, false, now(), now(), now()
                )
            """), {
                "id": thread_id,
                "athlete_id": kavita_patel_id,
                "mentor_id": ananya_singh_id,
                "req_id": req3_id
            })

            # Seed chat messages
            messages = [
                (kavita_patel_id, "Coach Ananya, I want to prepare for the upcoming state cricket trials."),
                (ananya_singh_id, "Absolutely Kavita, we will focus on batting technique and nets practice.")
            ]

            for sender_id, msg_content in messages:
                msg_id = uuid.uuid4()
                await conn.execute(text("""
                    INSERT INTO chat_messages (
                        id, thread_id, sender_id, content, read, guardian_visible, is_system_message, moderation_flag, created_at
                    ) VALUES (
                        :id, :thread_id, :sender_id, :content, false, true, false, false, now()
                    )
                """), {
                    "id": msg_id,
                    "thread_id": thread_id,
                    "sender_id": sender_id,
                    "content": msg_content
                })
            print("Seeded Interaction 3: Kavita Patel -> Coach Ananya Singh (Approved & Active Chat Thread)")

if __name__ == "__main__":
    asyncio.run(main())
