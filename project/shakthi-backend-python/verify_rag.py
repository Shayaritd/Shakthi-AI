import asyncio
import httpx
import sys
import os
from sqlalchemy import text
from app.database import engine

# Config
BASE_URL = "http://127.0.0.1:8001"
TEST_FILE_PATH = "safety_test_protocol.txt"
TEST_FILE_CONTENT = """SHAKTHI Safety Protocol Document 2026.
Platform safety rules require all mentors to meet athletes only in public, designated sporting venues.
If an athlete feels uncomfortable, they must immediately report the issue using the red Shield button or call the direct support hotline at +91-98765-43210.
Platform admins will review flagged messages within 2 hours. (Document Reference ID: SAF-2026-V1, Page 1)"""

async def db_query(sql, params=None):
    async with engine.connect() as conn:
        res = await conn.execute(text(sql), params or {})
        return res.all()

async def verify_rag_flow():
    print("=== RAG End-to-End Verification Pipeline ===")
    
    # 0. Write temporary test file
    print("\n[Step 1] Creating temporary sample document...")
    with open(TEST_FILE_PATH, "w", encoding="utf-8") as f:
        f.write(TEST_FILE_CONTENT)
    print(f"Created: {TEST_FILE_PATH}")
    
    # 1. Login or Create temporary user to get token
    print("\n[Step 2] Authenticating with backend...")
    token = None
    email = "admin@shakthi.app"
    password = "admin123"
    
    async with httpx.AsyncClient() as client:
        # Try login first
        try:
            login_res = await client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": email, "password": password}
            )
            if login_res.status_code == 200:
                token = login_res.json()["data"]["access_token"]
                print("Login successful.")
            else:
                print(f"Login failed ({login_res.status_code}): {login_res.text}")
        except Exception as e:
            print("Login exception:", str(e))
            
        if not token:
            print("Trying to login with temp user...")
            try:
                login_res = await client.post(
                    f"{BASE_URL}/api/v1/auth/login",
                    json={"email": "rag_verifier@shakthi.app", "password": "VerifierPass@123"}
                )
                if login_res.status_code == 200:
                    token = login_res.json()["data"]["access_token"]
                    print("Temp user login successful.")
            except Exception as e:
                print("Temp user login exception:", str(e))
                
        if not token:
            print("Trying to signup a new temp user...")
            try:
                signup_res = await client.post(
                    f"{BASE_URL}/api/v1/auth/signup",
                    json={
                        "full_name": "RAG Verifier",
                        "email": "rag_verifier@shakthi.app",
                        "phone_number": "9999999999",
                        "password": "VerifierPass@123",
                        "role": "ADMIN"
                    }
                )
                if signup_res.status_code in [200, 201]:
                    print("Signup successful. Logging in...")
                    login_res = await client.post(
                        f"{BASE_URL}/api/v1/auth/login",
                        json={"email": "rag_verifier@shakthi.app", "password": "VerifierPass@123"}
                    )
                    token = login_res.json()["data"]["access_token"]
                else:
                    print(f"Signup failed ({signup_res.status_code}): {signup_res.text}")
            except Exception as e:
                print("Signup exception:", str(e))
                
        if not token:
            print("CRITICAL ERROR: Failed to obtain JWT authentication token from backend.")
            return False

        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Ingest Document
        print("\n[Step 3] Uploading and ingesting document...")
        doc_id = None
        try:
            with open(TEST_FILE_PATH, 'rb') as f:
                files = {'file': (TEST_FILE_PATH, f, 'text/plain')}
                data = {
                    'collection_name': 'safety',
                    'uploader_role': 'ADMIN',
                    'tags': 'test,safety,protocol'
                }
                ingest_res = await client.post(
                    f"{BASE_URL}/api/v1/ai/ingest",
                    headers=headers,
                    data=data,
                    files=files
                )

            if ingest_res.status_code in [200, 202]:
                resp_json = ingest_res.json()
                doc_id = resp_json["data"]["document_id"]
                print(f"Ingestion job scheduled. Document ID: {doc_id}")
            else:
                print(f"Ingestion API call failed ({ingest_res.status_code}): {ingest_res.text}")
                return False
        except Exception as e:
            import traceback
            traceback.print_exc()
            print("Ingestion API exception:", repr(e))
            return False

            
        # 3. Poll Ingestion Status
        print("\n[Step 4] Polling ingestion status...")
        status = "PENDING"
        for attempt in range(1, 15):
            await asyncio.sleep(2)
            try:
                status_res = await client.get(
                    f"{BASE_URL}/api/v1/ai/ingest/status/{doc_id}",
                    headers=headers
                )
                if status_res.status_code == 200:
                    status = status_res.json()["data"]["status"]
                    total_chunks = status_res.json()["data"]["total_chunks"]
                    print(f"Attempt {attempt}: Status = {status}, Chunks = {total_chunks}")
                    if status in ["COMPLETED", "FAILED"]:
                        break
                else:
                    print(f"Status check failed ({status_res.status_code}): {status_res.text}")
            except Exception as e:
                print("Status check exception:", str(e))
                
        if status != "COMPLETED":
            print(f"CRITICAL ERROR: Ingestion did not complete. Final status: {status}")
            return False

        # 4. Check DB Records directly
        print("\n[Step 5] Checking database records directly...")
        try:
            doc_rows = await db_query("SELECT id, title, file_name, status, error_message FROM public.documents WHERE id = :id", {"id": doc_id})
            if doc_rows:
                print("Database document row:", dict(doc_rows[0]._mapping))
            else:
                print("ERROR: Document not found in public.documents table.")
                
            chunk_rows = await db_query("SELECT id, chunk_index, content, length(embedding::text) as emb_len FROM public.document_chunks WHERE document_id = :id", {"id": doc_id})
            print(f"Number of chunks stored: {len(chunk_rows)}")
            for chunk in chunk_rows:
                c_dict = dict(chunk._mapping)
                print(f"   - Chunk {c_dict['chunk_index']}: content length = {len(c_dict['content'])}, embedding text length = {c_dict['emb_len']}")
        except Exception as e:
            print("Database query check failed:", str(e))

        # 5. Grounded RAG query
        print("\n[Step 6] Running grounded RAG query...")
        try:
            query_res = await client.post(
                f"{BASE_URL}/api/v1/ai/query",
                headers=headers,
                json={
                    "question": "What is the safety support hotline number and what button should athletes use?",
                    "assistant_type": "safety"
                }
            )
            if query_res.status_code == 200:
                resp = query_res.json()["data"]
                print("Answer generated:")
                print("----------------------------------------")
                print(resp["answer"])
                print("----------------------------------------")
                print("Citations returned:")
                for cit in resp.get("citations", []):
                    print(f"   - Document: {cit['document_title']} | Page: {cit.get('page_number')} | Snippet: {cit['snippet']}")
                print(f"Provider used: {resp.get('provider_used')}")
            else:
                print(f"RAG query failed ({query_res.status_code}): {query_res.text}")
        except Exception as e:
            print("RAG query exception:", str(e))

        # 6. Negative RAG query
        print("\n[Step 7] Running negative (unrelated) query...")
        try:
            neg_res = await client.post(
                f"{BASE_URL}/api/v1/ai/query",
                headers=headers,
                json={
                    "question": "Who scored the winning run in the 2011 ICC Cricket World Cup final?",
                    "assistant_type": "safety"
                }
            )
            if neg_res.status_code == 200:
                resp = neg_res.json()["data"]
                print("Answer generated:")
                print("----------------------------------------")
                print(resp["answer"])
                print("----------------------------------------")
                print("Citations count:", len(resp.get("citations", [])))
            else:
                print(f"Negative query failed ({neg_res.status_code}): {neg_res.text}")
        except Exception as e:
            print("Negative query exception:", str(e))

    # Clean up test file
    if os.path.exists(TEST_FILE_PATH):
        os.remove(TEST_FILE_PATH)
        print("\nCleaned up test file.")
        
    return True

if __name__ == "__main__":
    asyncio.run(verify_rag_flow())
