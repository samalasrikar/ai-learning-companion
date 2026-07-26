# Lazy imports to avoid pulling heavy dependencies (chromadb, torch, etc.)
# at module-import time. Individual services can be imported directly:
#   from services.pdf_service import extract_pdf_pages

from services.cleaner_service import clean_text
from services.pdf_service import extract_pdf_pages
from services.chunker_service import create_document_chunks
from services.document_processor import process_pdf_document


def get_chroma_exports():
    """Lazily import chroma_service to avoid eager chromadb load."""
    from services.chroma_service import (
        init_chroma_db,
        get_chroma_client,
        get_documents_collection,
        is_document_indexed,
        store_document_chunks,
    )
    return (
        init_chroma_db,
        get_chroma_client,
        get_documents_collection,
        is_document_indexed,
        store_document_chunks,
    )


def get_embedding_exports():
    """Lazily import embedding_service to avoid eager torch load."""
    from services.embedding_service import (
        load_embedding_model,
        generate_embeddings,
    )
    return load_embedding_model, generate_embeddings


def get_retrieval_exports():
    """Lazily import retrieval_service to avoid eager load."""
    from services.retrieval_service import retrieve_relevant_chunks
    return retrieve_relevant_chunks


def get_rag_exports():
    """Lazily import rag_service to avoid eager load."""
    from services.rag_service import (
        generate_rag_answer,
        construct_rag_prompt,
        call_llm,
    )
    return generate_rag_answer, construct_rag_prompt, call_llm


__all__ = [
    "clean_text",
    "extract_pdf_pages",
    "create_document_chunks",
    "process_pdf_document",
    "get_chroma_exports",
    "get_embedding_exports",
    "get_retrieval_exports",
    "get_rag_exports",
]
