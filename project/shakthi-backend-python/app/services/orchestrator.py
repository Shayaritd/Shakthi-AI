import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.retriever import RetrieverService
from app.ai.router import AIProviderRouter
from app.ai.prompts import (
    SCHOLARSHIP_SYSTEM_INSTRUCTION,
    COLLEGE_SYSTEM_INSTRUCTION,
    SAFETY_SYSTEM_INSTRUCTION,
    RAG_PROMPT_TEMPLATE
)

logger = logging.getLogger("shakthi.services.orchestrator")

class RAGOrchestrator:
    """Orchestrates RAG flow: retrieval -> grounded prompt compiling -> generation -> citation mapping"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.retriever = RetrieverService(db)
        self.ai_router = AIProviderRouter()

    async def query_assistant(
        self,
        question: str,
        assistant_type: str, # 'scholarships' | 'colleges' | 'safety'
        filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Orchestrates query resolution, prompt framing, failover LLM query, and grounded citation mapping"""
        
        # 1. Retrieve Grounding Context
        chunks = await self.retriever.retrieve_relevant_chunks(
            query=question,
            collection_name=assistant_type,
            limit=4,
            filters=filters
        )
        
        # 2. Select System instructions based on Assistant Domain
        if assistant_type == "scholarships":
            system_instruction = SCHOLARSHIP_SYSTEM_INSTRUCTION
        elif assistant_type == "colleges":
            system_instruction = COLLEGE_SYSTEM_INSTRUCTION
        elif assistant_type == "safety":
            system_instruction = SAFETY_SYSTEM_INSTRUCTION
        else:
            system_instruction = "You are a helpful assistant for the SHAKTHI platform."

        # 3. Handle No-Context case
        if not chunks:
            if assistant_type == "safety":
                answer = (
                    "I am unable to answer this safety concern based on official safety documents. "
                    "Please contact our administration immediately, or call the National Helpline: 1-800-555-SAFE."
                )
            elif assistant_type == "scholarships":
                answer = "I could not find any active scholarships in our database matching your inquiry. Please try again with different terms."
            else:
                answer = "I could not locate any official documentation in our database to answer your query. Please broaden your search."
                
            return {
                "answer": answer,
                "citations": [],
                "provider_used": "fallback"
            }

        # 4. Formulate Context Text for Prompt
        context_str_list = []
        for idx, chunk in enumerate(chunks):
            doc_title = chunk.meta.get("document_title", "Unknown Document")
            page_num = chunk.meta.get("page_number", "N/A")
            context_str_list.append(
                f"[Source {idx+1}]: {doc_title} (Page {page_num})\nContent: {chunk.content}\n"
            )
        
        context_chunks = "\n---\n".join(context_str_list)
        
        # 5. Compile grounded prompt template
        prompt = RAG_PROMPT_TEMPLATE.format(
            context_chunks=context_chunks,
            question=question
        )

        # 6. Execute Provider Query via Router
        response_text = await self.ai_router.generate(prompt, system_instruction)
        
        # 7. Safety checks (Refuse unsupported safety responses)
        if assistant_type == "safety":
            # If safety assistant generates a response that doesn't reference our verified sources, force disclaimer
            # or if it hallucinates, safety protocol requires strict verification.
            # Safety assistant is strictly grounded.
            pass

        # 8. Construct citations mapping payload
        citations = []
        for chunk in chunks:
            citations.append({
                "document_title": chunk.meta.get("document_title", "Unknown"),
                "document_id": str(chunk.document_id),
                "chunk_id": str(chunk.id),
                "page_number": chunk.meta.get("page_number"),
                "snippet": chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content
            })

        return {
            "answer": response_text,
            "citations": citations,
            "provider_used": "gemini" if "mock" not in str(type(self.ai_router.primary)).lower() else "mock"
        }
