import os
import sys
import asyncio
import httpx
import uuid
import json
import traceback
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Setup system paths to allow importing app
sys.path.append(os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from app.config import settings
from app.models.document import Document, DocumentChunk
from app.models.user import User, UserRole

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"

async def run_step(step_num, title, coro):
    print(f"\n==================================================")
    print(f"STEP {step_num}: {title}")
    print(f"==================================================")
    try:
        result = await coro
        print(f"SUCCESS: Step {step_num} completed successfully.")
        return result, None
    except Exception as e:
        print(f"FAILED: Step {step_num} encountered an error: {e}")
        traceback.print_exc()
        return None, e

async def check_backend():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{BACKEND_URL}/health")
        print(f"Backend Status Code: {r.status_code}")
        print(f"Backend Health Response: {r.text}")
        r.raise_for_status()
        return r.json()

async def check_frontend():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(FRONTEND_URL)
        print(f"Frontend Status Code: {r.status_code}")
        print(f"Frontend Response snippet (first 150 chars):\n{r.text[:150]}")
        r.raise_for_status()
        return r.text

async def check_endpoints():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{BACKEND_URL}/openapi.json")
        r.raise_for_status()
        spec = r.json()
        paths = spec.get("paths", {})
        ai_paths = []
        for path, methods in paths.items():
            if path.startswith("/api/v1/ai"):
                for method in methods.keys():
                    ai_paths.append(f"{method.upper()} {path}")
        print("Registered AI/RAG Endpoints:")
        for ap in sorted(ai_paths):
            print(f"  - {ap}")
        return ai_paths

async def login_and_get_token():
    test_email = "rag_test_user@shakthi.app"
    test_password = "Password123!"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        # First, attempt signup to ensure user exists
        signup_payload = {
            "full_name": "RAG Verification User",
            "email": test_email,
            "phone_number": "9876543210",
            "password": test_password,
            "role": "ATHLETE"
        }
        
        print(f"Attempting to register user: {test_email}...")
        signup_r = await client.post(f"{BACKEND_URL}/api/v1/auth/signup", json=signup_payload)
        if signup_r.status_code == 201:
            print("User registered successfully.")
        else:
            print(f"User registration response (likely already exists): {signup_r.status_code} - {signup_r.text}")

        # Now login
        print(f"Logging in user: {test_email}...")
        login_payload = {
            "email": test_email,
            "password": test_password
        }
        login_r = await client.post(f"{BACKEND_URL}/api/v1/auth/login", json=login_payload)
        login_r.raise_for_status()
        token_data = login_r.json()["data"]
        print("Login successful. Access token obtained.")
        return token_data["access_token"]

async def upload_document(token):
    # 1. Create a unique sample text document content
    doc_content = (
        "SHAKTHI-Special-Concession-2026: The state government of Karnataka has approved a special grant of "
        "750,000 INR for female hockey players who have won at the national levels. The application deadline is "
        "December 31, 2026. Recipient selection is based on verified sports merit certificates signed by the sports director."
    )
    
    file_data = {
        "file": ("shakthi_special_concession_2026.txt", doc_content.encode("utf-8"), "text/plain")
    }
    
    form_data = {
        "collection_name": "scholarships",
        "uploader_role": "admin",
        "tags": "hockey, karnataka, concession, test"
    }
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        print("Uploading test document to /api/v1/ai/ingest...")
        r = await client.post(
            f"{BACKEND_URL}/api/v1/ai/ingest",
            files=file_data,
            data=form_data,
            headers=headers
        )
        print(f"Upload status code: {r.status_code}")
        print(f"Upload response body: {r.text}")
        r.raise_for_status()
        res_json = r.json()
        doc_id = res_json["data"]["document_id"]
        return doc_id

async def poll_ingestion_status(token, doc_id):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for i in range(15):
            r = await client.get(f"{BACKEND_URL}/api/v1/ai/ingest/status/{doc_id}", headers=headers)
            r.raise_for_status()
            status_data = r.json()["data"]
            current_status = status_data["status"]
            print(f"Polling status (attempt {i+1}): {current_status}")
            if current_status in ["COMPLETED", "FAILED"]:
                return status_data
            await asyncio.sleep(2)
        raise TimeoutError("Ingestion status polling timed out.")

async def verify_database(doc_id):
    # Setup db engine and query the tables directly
    from app.database import engine, async_session_factory
    
    async with async_session_factory() as session:
        # Get document row
        stmt_doc = select(Document).where(Document.id == uuid.UUID(doc_id))
        res_doc = await session.execute(stmt_doc)
        doc = res_doc.scalar_one_or_none()
        
        if not doc:
            raise ValueError(f"Document with ID {doc_id} was not found in database.")
            
        print("Database Document Row:")
        print(f"  ID: {doc.id}")
        print(f"  Title: {doc.title}")
        print(f"  Status: {doc.status}")
        print(f"  Collection Name: {doc.collection_name}")
        
        # Get chunks
        stmt_chunks = select(DocumentChunk).where(DocumentChunk.document_id == uuid.UUID(doc_id))
        res_chunks = await session.execute(stmt_chunks)
        chunks = res_chunks.scalars().all()
        
        print(f"Number of document chunks created: {len(chunks)}")
        
        embeddings_present = True
        for i, chunk in enumerate(chunks):
            emb_len = len(chunk.embedding) if chunk.embedding is not None else 0
            print(f"  Chunk {i}: size={len(chunk.content)} chars, embedding dimension={emb_len}")
            if chunk.embedding is None or emb_len == 0:
                embeddings_present = False
                
        print(f"Are embeddings present and populated? {embeddings_present}")
        return len(chunks), embeddings_present

async def run_rag_query(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    query_payload = {
        "question": "How much grant is provided for female hockey players under SHAKTHI-Special-Concession-2026?",
        "assistant_type": "scholarships"
    }
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        print("Sending RAG Query...")
        r = await client.post(
            f"{BACKEND_URL}/api/v1/ai/query",
            json=query_payload,
            headers=headers
        )
        print(f"RAG query status code: {r.status_code}")
        r.raise_for_status()
        res_json = r.json()
        return res_json["data"]

async def run_unrelated_query(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # We ask an unrelated question that is not in the uploaded document or safety guidelines
    query_payload = {
        "question": "What is the capital of France?",
        "assistant_type": "scholarships"
    }
    
    async with httpx.AsyncClient(timeout=20.0) as client:
        print("Sending Unrelated Query...")
        r = await client.post(
            f"{BACKEND_URL}/api/v1/ai/query",
            json=query_payload,
            headers=headers
        )
        print(f"Unrelated query status code: {r.status_code}")
        r.raise_for_status()
        res_json = r.json()
        return res_json["data"]

async def main():
    print("==================================================")
    print("STARTING END-TO-END SHAKTHI AI/RAG SYSTEM VERIFICATION")
    print("==================================================")
    
    # Step 1: Confirm backend is running
    res, err = await run_step(1, "Confirm backend is running", check_backend())
    if err: return
    
    # Step 2: Confirm frontend is running
    res, err = await run_step(2, "Confirm frontend is running", check_frontend())
    if err: return
    
    # Step 3: Open /openapi.json and list registered endpoints
    res, err = await run_step(3, "Open /openapi.json and list registered endpoints", check_endpoints())
    if err: return
    
    # Step 3b: Get auth token
    token, err = await run_step("3b", "Login and obtain Bearer Token", login_and_get_token())
    if err: return
    
    # Step 4 & 5: Upload sample document & print document_id
    doc_id, err = await run_step(4, "Upload sample document to /api/v1/ai/ingest", upload_document(token))
    if err: return
    print(f"Document ID: {doc_id}")
    
    # Step 6: Poll status until COMPLETED or FAILED
    status_data, err = await run_step(6, f"Poll status of ingestion {doc_id}", poll_ingestion_status(token, doc_id))
    if err: return
    print(f"Ingestion status response: {json.dumps(status_data, indent=2)}")
    
    # Step 7: Verify database row, chunks, and embeddings
    db_res, err = await run_step(7, f"Verify database entries for document {doc_id}", verify_database(doc_id))
    if err: return
    
    # Step 8 & 9: Run RAG query and print response
    rag_data, err = await run_step(8, "Run grounded RAG query about concession", run_rag_query(token))
    if err: return
    print("\n--- RAG Response Payload ---")
    print(f"Answer: {rag_data.get('answer')}")
    print(f"Citations:")
    for cit in rag_data.get("citations", []):
        print(f"  - Document ID: {cit.get('document_id')}")
        print(f"    Document Title: {cit.get('document_title')}")
        print(f"    Chunk ID: {cit.get('chunk_id')}")
        print(f"    Page Number: {cit.get('page_number')}")
        print(f"    Snippet: {cit.get('snippet')}")
    print(f"Provider Used: {rag_data.get('provider_used')}")
    
    # Step 10: Run unrelated question and verify refuse/fallback
    unrelated_data, err = await run_step(10, "Run unrelated query (What is the capital of France?)", run_unrelated_query(token))
    if err: return
    print("\n--- Unrelated Query Response Payload ---")
    print(f"Answer: {unrelated_data.get('answer')}")
    print(f"Citations: {unrelated_data.get('citations')}")
    print(f"Provider Used: {unrelated_data.get('provider_used')}")
    
    print("\n==================================================")
    print("VERIFICATION COMPLETED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
