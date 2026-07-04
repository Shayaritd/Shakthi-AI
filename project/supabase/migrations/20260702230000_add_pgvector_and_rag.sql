-- Enable vector extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- Document ingestion job status tracking enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doc_status') THEN
        CREATE TYPE doc_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
    END IF;
END$$;

-- Document metadata and root references table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    collection_name VARCHAR(100) NOT NULL, -- 'scholarships', 'colleges', or 'safety'
    
    -- Metadata
    source_type VARCHAR(100) DEFAULT 'upload',
    uploader_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    uploader_role VARCHAR(50) NOT NULL,
    trust_level VARCHAR(50) DEFAULT 'verified',
    tags TEXT[] DEFAULT '{}',
    
    -- Processing fields
    status doc_status DEFAULT 'PENDING',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Document chunks and vector embeddings table (768-dimensions for Gemini embeddings)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(768) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast cosine distance similarity queries using HNSW
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- Enable RLS for documents and chunks
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
DROP POLICY IF EXISTS "Admins can manage documents" ON public.documents;
CREATE POLICY "Admins can manage documents"
ON public.documents
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'ADMIN'
    )
);

DROP POLICY IF EXISTS "Authenticated users can read documents" ON public.documents;
CREATE POLICY "Authenticated users can read documents"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read document chunks" ON public.document_chunks;
CREATE POLICY "Authenticated users can read document chunks"
ON public.document_chunks
FOR SELECT
TO authenticated
USING (true);
