import os
import uuid
import logging
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status

from services.document_processor import process_pdf_document
from services.retrieval_service import retrieve_relevant_chunks
from services.rag_service import generate_rag_answer
from services.chroma_service import (
    get_chroma_stats,
    get_chroma_debug_info,
    delete_document_vectors,
    rebuild_vector_store,
)

logger = logging.getLogger("rag_service.routes")

router = APIRouter()

# 50 MB upload limit
MAX_UPLOAD_BYTES = 50 * 1024 * 1024


class QueryRequest(BaseModel):
    """Request model for semantic retrieval queries."""

    query: str = Field(..., description="User question or search phrase", min_length=1)
    user_id: str = Field(..., description="ID of the user making the query", min_length=1)
    top_k: Optional[int] = Field(5, description="Number of top relevant chunks to retrieve", ge=1, le=50)


class RAGRequest(BaseModel):
    """Request model for Retrieval-Augmented Generation (RAG)."""

    query: str = Field(..., description="User question to be answered using document context", min_length=1)
    user_id: str = Field(..., description="ID of the requesting user", min_length=1)
    top_k: Optional[int] = Field(5, description="Number of context chunks to retrieve", ge=1, le=50)
    mode: Optional[str] = Field(None, description="AI Response Mode: hybrid, strict_rag, general_only")
    similarity_threshold: Optional[float] = Field(None, description="Similarity threshold cutoff (0.0 - 1.0)", ge=0.0, le=1.0)


@router.post("/upload")
@router.post("/process-pdf")
@router.post("/documents/upload")
@router.post("/documents/process-pdf")
async def process_pdf(
    file: UploadFile = File(...),
    document_id: str = Form(None),
    user_id: str = Form(None),
):
    """
    Uploads and indexes a PDF document into Chroma Cloud.
    Requires non-empty content and valid file extension.
    """
    try:
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )

        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported. Upload a file with a .pdf extension.",
            )

        if file.content_type and file.content_type != "application/pdf":
            logger.warning(
                f"Unexpected content type '{file.content_type}' for file '{file.filename}'"
            )

        doc_id = document_id if document_id else str(uuid.uuid4())
        usr_id = str(user_id).strip() if (user_id and str(user_id).strip()) else "anonymous"

        if len(content) > MAX_UPLOAD_BYTES:
            size_mb = round(len(content) / (1024 * 1024), 2)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size ({size_mb} MB) exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
            )

        logger.info(
            f"Processing PDF upload '{file.filename}' "
            f"(doc_id={doc_id}, user_id={usr_id}, size={len(content)} bytes)"
        )

        result = process_pdf_document(
            file_content=content,
            filename=file.filename,
            document_id=doc_id,
            user_id=usr_id,
        )

        return result

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        logger.exception(f"Unexpected error processing PDF '{file.filename}'")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the PDF: {str(e)}",
        )


@router.post("/search")
@router.post("/documents/search")
async def search_documents(request: QueryRequest):
    """
    Performs semantic vector search against Chroma Cloud 'documents' collection.
    """
    if not request.user_id or not str(request.user_id).strip() or str(request.user_id).strip() == "anonymous":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="userId is mandatory for semantic search.",
        )

    try:
        clean_user_id = str(request.user_id).strip()
        logger.info(
            f"Semantic search request from user '{clean_user_id}': "
            f"query='{request.query[:60]}...', top_k={request.top_k}"
        )

        results = retrieve_relevant_chunks(
            query=request.query,
            user_id=clean_user_id,
            top_k=request.top_k or 5,
        )

        return {
            "status": "success",
            "query": request.query,
            "user_id": clean_user_id,
            "total_results": len(results),
            "results": results,
        }

    except Exception as e:
        logger.exception(f"Unexpected error during search for user '{request.user_id}'")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during semantic search: {str(e)}",
        )


@router.post("/query")
@router.post("/rag")
@router.post("/answer")
@router.post("/documents/query")
@router.post("/documents/rag")
@router.post("/documents/answer")
async def rag_question_answering(request: RAGRequest):
    """
    Performs Retrieval-Augmented Generation (RAG) using Chroma Cloud context and LLM.
    """
    if not request.user_id or not str(request.user_id).strip() or str(request.user_id).strip() == "anonymous":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="userId is mandatory for RAG query processing.",
        )

    try:
        clean_user_id = str(request.user_id).strip()
        logger.info(
            f"RAG query request from user '{clean_user_id}': "
            f"query='{request.query[:60]}...', top_k={request.top_k}"
        )

        result = generate_rag_answer(
            query=request.query,
            user_id=clean_user_id,
            top_k=request.top_k or 5,
            mode=request.mode,
            similarity_threshold=request.similarity_threshold,
        )

        return result

    except Exception as e:
        logger.exception(f"Unexpected error during RAG for user '{request.user_id}'")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during Retrieval-Augmented Generation: {str(e)}",
        )


@router.get("/debug/chroma")
@router.get("/documents/debug/chroma")
async def debug_chroma_endpoint():
    """Debug endpoint returning live runtime inspection data for Chroma Cloud."""
    try:
        return get_chroma_debug_info()
    except Exception as e:
        logger.exception("Failed to retrieve Chroma Cloud debug info")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debug lookup failed: {str(e)}",
        )


@router.get("/admin/stats")
@router.get("/documents/admin/stats")
async def get_rag_statistics():
    """Returns live RAG management statistics directly from Chroma Cloud."""
    try:
        return get_chroma_stats()
    except Exception as e:
        logger.exception("Failed to retrieve RAG statistics")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch RAG stats: {str(e)}",
        )


@router.post("/admin/reindex/{document_id}")
@router.post("/documents/admin/reindex/{document_id}")
async def reindex_document_endpoint(document_id: str):
    """Deletes vectors for document_id from Chroma Cloud so it can be cleanly re-indexed."""
    try:
        res = delete_document_vectors(document_id)
        res["message"] = f"Document '{document_id}' cleared for re-indexing."
        return res
    except Exception as e:
        logger.exception(f"Failed to clear document '{document_id}' for re-indexing")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Re-indexing failed: {str(e)}",
        )


@router.delete("/admin/documents/{document_id}")
@router.delete("/documents/admin/documents/{document_id}")
async def delete_document_vectors_endpoint(document_id: str):
    """Deletes all vector embeddings for specified document_id from Chroma Cloud."""
    try:
        return delete_document_vectors(document_id)
    except Exception as e:
        logger.exception(f"Failed to delete vectors for document '{document_id}'")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Vector deletion failed: {str(e)}",
        )


@router.post("/admin/rebuild-index")
@router.post("/documents/admin/rebuild-index")
async def rebuild_vector_store_endpoint():
    """Resets the 'documents' collection in Chroma Cloud."""
    try:
        return rebuild_vector_store()
    except Exception as e:
        logger.exception("Failed to rebuild Chroma Cloud vector store")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rebuild failed: {str(e)}",
        )
