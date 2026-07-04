import logging
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import DocumentChunk
from app.ai.router import AIProviderRouter

logger = logging.getLogger("shakthi.services.retriever")

class RetrieverService:
    """Retrieval service that converts queries to vectors and queries pgvector with metadata filtering"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_router = AIProviderRouter()

    async def retrieve_relevant_chunks(
        self,
        query: str,
        collection_name: str, # 'scholarships' | 'colleges' | 'safety'
        limit: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[DocumentChunk]:
        """Translates search string to vector, runs cosine similarity search in database, applies metadata filters"""
        try:
            # 1. Generate Query Vector Embedding
            query_vector = await self.ai_router.embed(query)
            
            # 2. Setup Vector Similarity Distance Formula (Cosine Distance)
            # cosine_distance = 1 - cosine_similarity. So lower distance means higher similarity.
            distance = DocumentChunk.embedding.cosine_distance(query_vector)
            
            # 3. Base SQL Statement
            stmt = select(DocumentChunk).order_by(distance)
            
            # 4. Filter by Collection Namespace
            stmt = stmt.where(DocumentChunk.meta["collection_name"].astext == collection_name)
            
            # 5. Apply Dynamic Metadata Filters (sport, state, eligibility_type, audience_role, etc.)
            if filters:
                for key, val in filters.items():
                    if val is not None:
                        # Query nested JSONB column in PostgreSQL
                        stmt = stmt.where(DocumentChunk.meta[key].astext == str(val))

            # 6. Apply Retrieval Limit
            stmt = stmt.limit(limit)
            
            # 7. Execute Query
            result = await self.db.execute(stmt)
            chunks = result.scalars().all()
            
            # Reranking Abstraction (Reranking Ready)
            # Future extension: add cross-encoder model to re-score matching chunks
            logger.info(f"Retrieved {len(chunks)} relevant chunks from namespace: {collection_name}")
            return chunks

        except Exception as e:
            logger.error(f"Retrieval pipeline failed: {e}", exc_info=True)
            return []
