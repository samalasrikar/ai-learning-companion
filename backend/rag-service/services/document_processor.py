import os
import logging
from typing import Dict, Any

from config import settings
from services.pdf_service import extract_pdf_pages
from services.chunker_service import create_document_chunks
from services.embedding_service import generate_embeddings
from services.chroma_service import is_document_indexed, store_document_chunks

logger = logging.getLogger("rag_service.processor")


def process_pdf_document(
    file_content: bytes,
    filename: str,
    document_id: str,
    user_id: str,
    save_to_disk: bool = False,
) -> Dict[str, Any]:
    """
    Orchestrates end-to-end PDF processing:
    1. Checks if document is already indexed in Chroma Cloud (skip duplicate embeddings).
    2. Optionally saves raw uploaded file to uploads directory.
    3. Extracts and cleans text page-by-page using PyMuPDF.
    4. Splits text into ~500 token semantic chunks with 100 token overlap.
    5. Generates embeddings using BAAI/bge-small-en-v1.5.
    6. Stores embeddings + metadata into Chroma Cloud 'documents' collection.
    7. Returns chunks and comprehensive processing statistics.
    """
    logger.info(f"[RAG] Upload Started for '{filename}' (doc_id={document_id}, user_id={user_id})")

    # Step 0: Check for duplicate — skip if already indexed
    if is_document_indexed(document_id):
        logger.info(f"[RAG] Document '{document_id}' is already indexed in Chroma Cloud. Skipping duplicate embedding.")
        return {
            "status": "skipped",
            "message": f"Document '{document_id}' is already indexed in Chroma Cloud. Skipping duplicate embedding.",
            "document_id": document_id,
        }

    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)

    # Persist raw file for audit / reprocessing
    if save_to_disk:
        saved_file_path = os.path.join(upload_dir, f"{document_id}_{filename}")
        try:
            with open(saved_file_path, "wb") as f:
                f.write(file_content)
            logger.info(f"[RAG] Saved uploaded PDF to {saved_file_path}")
        except Exception as e:
            logger.warning(f"[RAG WARNING] Could not save file to disk: {e}")

    # Step 1: Extract & clean text per page
    try:
        extraction_result = extract_pdf_pages(file_content, filename)
        logger.info(f"[RAG] Text Extracted from {extraction_result['total_pages']} pages ({extraction_result['total_characters']} characters)")
    except Exception as e:
        logger.error(f"[RAG ERROR] Text extraction failed for '{filename}': {e}")
        raise ValueError(f"Failed to extract text from PDF '{filename}': {str(e)}")

    # Step 2: Semantic chunking with metadata preservation
    try:
        chunk_result = create_document_chunks(
            pages=extraction_result["pages"],
            document_id=document_id,
            user_id=user_id,
            filename=filename,
            target_chunk_tokens=500,
            overlap_tokens=100,
        )
        chunks = chunk_result["chunks"]
        logger.info(f"[RAG] Chunks Created: {len(chunks)} chunks (avg tokens={chunk_result['statistics']['average_chunk_tokens']})")
    except Exception as e:
        logger.error(f"[RAG ERROR] Chunking failed for '{filename}': {e}")
        raise ValueError(f"Failed to chunk PDF content for '{filename}': {str(e)}")

    # Step 3: Generate embeddings for all chunks
    try:
        chunk_texts = [c["text"] for c in chunks]
        embeddings = generate_embeddings(chunk_texts)
        logger.info(f"[RAG] Embeddings Generated: {len(embeddings)} vectors ({settings.EMBEDDING_MODEL})")
    except Exception as e:
        logger.error(f"[RAG ERROR] Embedding generation failed for '{filename}': {e}")
        raise ValueError(f"Failed to generate embeddings for '{filename}': {str(e)}")

    # Step 4: Store embeddings + metadata in Chroma Cloud
    try:
        storage_result = store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            document_id=document_id,
            user_id=user_id,
            filename=filename,
        )
        logger.info(
            f"[CHROMA CLOUD] Vector upload successful for '{filename}':\n"
            f"  - Chunks Created    : {len(chunks)}\n"
            f"  - Embeddings Stored : {storage_result['stored_count']}\n"
            f"  - Collection Name   : {storage_result.get('collection_name', 'documents')}\n"
            f"  - Mode              : Chroma Cloud\n"
            f"  - Collection Count  : {storage_result['collection_total']}"
        )
    except Exception as e:
        logger.error(f"[CHROMA CLOUD ERROR] Vector upload failed for '{filename}': {e}")
        raise ValueError(f"Failed to store vectors in Chroma Cloud for '{filename}': {str(e)}")

    logger.info(f"[RAG] Indexing Complete for '{filename}'")

    return {
        "status": "success",
        "statistics": chunk_result["statistics"],
        "embedding": {
            "model": settings.EMBEDDING_MODEL,
            "dimension": len(embeddings[0]) if embeddings else 0,
            "chunks_embedded": len(embeddings),
            "stored_count": storage_result["stored_count"],
            "collection_total": storage_result["collection_total"],
        },
        "chunks": chunks,
    }
