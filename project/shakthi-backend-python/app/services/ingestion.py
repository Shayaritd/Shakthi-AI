import io
import os
import uuid
import logging
from typing import List, Dict, Any
from pypdf import PdfReader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter


from app.models.document import Document, DocumentChunk, DocStatus
from app.services.storage import get_storage_service
from app.ai.router import AIProviderRouter

logger = logging.getLogger("shakthi.services.ingestion")

class IngestionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.storage = get_storage_service()
        self.ai_router = AIProviderRouter()
        # Clean splitter setup: chunks of 800 chars with 100 char overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            length_function=len,
            is_separator_regex=False,
        )

    async def process_document(self, document_id: uuid.UUID) -> Document:
        """Runs the document ingestion pipeline asynchronously: parse -> clean -> chunk -> embed -> store"""
        # Fetch document record
        doc = await self.db.get(Document, document_id)
        if not doc:
            logger.error(f"Document with ID {document_id} not found")
            return None

        # Update status to processing
        doc.status = DocStatus.PROCESSING
        await self.db.commit()
        await self.db.refresh(doc)

        try:
            # 1. Retrieve file bytes from storage
            file_bytes = await self.storage.get_file_content(doc.file_path)
            
            # 2. Parse text content based on mime-type
            text_by_page = self._parse_file(file_bytes, doc.mime_type, doc.file_name)
            
            # 3. Clean and Chunk Text
            chunks_data = self._chunk_text(text_by_page)
            
            # 4. Generate Embeddings and Save Chunk Records
            chunk_index = 0
            for chunk_data in chunks_data:
                content = chunk_data["content"]
                page_number = chunk_data.get("page_number")
                
                # Fetch embedding vectors (size 768)
                embedding = await self.ai_router.embed(content)
                
                # Construct metadata payload matching search filters
                chunk_meta = {
                    "document_title": doc.title,
                    "collection_name": doc.collection_name,
                    "page_number": page_number,
                    "uploader_role": doc.uploader_role,
                    "trust_level": doc.trust_level,
                    "tags": doc.tags
                }
                
                # Create Database chunk
                chunk_record = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=chunk_index,
                    content=content,
                    meta=chunk_meta,
                    embedding=embedding
                )
                self.db.add(chunk_record)
                chunk_index += 1

            # Update document to completed
            doc.status = DocStatus.COMPLETED
            await self.db.commit()
            await self.db.refresh(doc)
            logger.info(f"Ingestion job completed successfully for document: {doc.title}")
            return doc

        except Exception as e:
            logger.exception(f"Ingestion job failed for document {document_id}: {e}")
            doc.status = DocStatus.FAILED
            doc.error_message = str(e)
            await self.db.commit()
            await self.db.refresh(doc)
            return doc

    def _parse_file(self, file_bytes: bytes, mime_type: str, file_name: str) -> List[Dict[str, Any]]:
        """Parses file contents. Extensible structure for DOC/DOCX and CSV in Phase 2."""
        text_by_page = []
        
        # Lowercase filename check as fallback
        ext = os.path.splitext(file_name.lower())[1]

        if mime_type == "application/pdf" or ext == ".pdf":
            # PDF text extractor
            pdf_file = io.BytesIO(file_bytes)
            reader = PdfReader(pdf_file)
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                cleaned_text = self._clean_text(page_text)
                if cleaned_text:
                    text_by_page.append({
                        "page_number": page_idx + 1,
                        "text": cleaned_text
                    })
                    
        elif mime_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"] or ext in [".doc", ".docx"]:
            # Extensible stub for docx files (Phase 2 extension)
            # In Phase 2:
            # from docx import Document as DocxReader
            # doc = DocxReader(io.BytesIO(file_bytes))
            # ...
            logger.warning("DOCX parser extension triggered in stub mode")
            raise NotImplementedError("DOCX file formats parsing is scheduled for Phase 2.")
            
        elif mime_type == "text/csv" or ext == ".csv":
            # Extensible stub for CSV (Phase 2 extension)
            raise NotImplementedError("CSV file formats parsing is scheduled for Phase 2.")
            
        else:
            # Plain Text fallback
            try:
                decoded_text = file_bytes.decode("utf-8")
                cleaned_text = self._clean_text(decoded_text)
                text_by_page.append({
                    "page_number": 1,
                    "text": cleaned_text
                })
            except Exception as e:
                raise ValueError(f"Unsupported file format and text decoding failed: {mime_type}")

        return text_by_page

    def _clean_text(self, text: str) -> str:
        """Removes duplicate whitespace, cleans stray characters without logging raw sensitive data"""
        if not text:
            return ""
        lines = text.split("\n")
        cleaned_lines = [line.strip() for line in lines if line.strip()]
        return "\n".join(cleaned_lines)

    def _chunk_text(self, text_by_page: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Slices parsed text into overlapping chunks, maintaining page references"""
        chunks = []
        for page_data in text_by_page:
            page_text = page_data["text"]
            page_num = page_data["page_number"]
            
            # Split page text
            split_texts = self.text_splitter.split_text(page_text)
            for txt in split_texts:
                chunks.append({
                    "page_number": page_num,
                    "content": txt
                })
        return chunks
