import os
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

import chromadb
from chromadb.errors import ChromaError

from config import settings

logger = logging.getLogger("rag_service.chroma")

COLLECTION_NAME = "documents"

_chroma_client = None
_documents_collection = None


def init_chroma_db(use_ephemeral: bool = False):
    """
    Initializes the Chroma Cloud client using CHROMA_API_KEY, CHROMA_TENANT, and CHROMA_DATABASE.
    Ensures the 'documents' collection exists in Chroma Cloud with cosine distance metric.

    If use_ephemeral or TESTING=true environment variable is set, uses chromadb.EphemeralClient
    for isolated unit testing.
    """
    global _chroma_client, _documents_collection

    is_testing = use_ephemeral or os.getenv("TESTING", "").lower() in ("true", "1")

    if is_testing:
        logger.info("[CHROMA] Initializing EphemeralClient for unit testing environment")
        _chroma_client = chromadb.EphemeralClient(
            settings=chromadb.Settings(anonymized_telemetry=False),
        )
        _documents_collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={
                "description": "RAG Service Test Documents Collection",
                "hnsw:space": "cosine",
            },
        )
        return _chroma_client, _documents_collection

    api_key = settings.CHROMA_API_KEY
    tenant = settings.CHROMA_TENANT
    database = settings.CHROMA_DATABASE

    if not api_key:
        err_msg = "CHROMA_API_KEY is not configured in backend/.env"
        logger.error(f"[CHROMA ERROR] {err_msg}")
        raise ValueError(err_msg)

    if not tenant:
        err_msg = "CHROMA_TENANT is not configured in backend/.env"
        logger.error(f"[CHROMA ERROR] {err_msg}")
        raise ValueError(err_msg)

    if not database:
        err_msg = "CHROMA_DATABASE is not configured in backend/.env"
        logger.error(f"[CHROMA ERROR] {err_msg}")
        raise ValueError(err_msg)

    try:
        logger.info(
            f"[CHROMA] Initializing Chroma CloudClient (tenant='{tenant}', database='{database}')"
        )

        _chroma_client = chromadb.CloudClient(
            tenant=tenant,
            database=database,
            api_key=api_key,
        )

        resolved_tenant = getattr(_chroma_client, "tenant", tenant)
        resolved_database = getattr(_chroma_client, "database", database)

        _documents_collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={
                "description": "RAG Service Cloud Documents Collection",
                "hnsw:space": "cosine",
            },
        )

        count = _documents_collection.count()
        logger.info("=========================================")
        logger.info("Chroma Cloud Connection Status")
        logger.info("=========================================")
        logger.info("Mode            : Chroma Cloud")
        logger.info(f"Tenant          : {resolved_tenant}")
        logger.info(f"Database        : {resolved_database}")
        logger.info(f"Collection      : {COLLECTION_NAME}")
        logger.info(f"Existing Chunks : {count}")
        logger.info("Connection      : Successful")
        logger.info("=========================================")

        return _chroma_client, _documents_collection

    except Exception as e:
        logger.error(f"[CHROMA ERROR] Failed to connect to Chroma Cloud: {str(e)}")
        raise RuntimeError(f"Chroma Cloud connection failed: {str(e)}")


def get_chroma_client():
    """
    Returns the singleton Chroma Cloud client instance.
    Initializes connection if not already created.
    """
    global _chroma_client
    if _chroma_client is None:
        init_chroma_db()
    return _chroma_client


def get_documents_collection():
    """
    Returns the 'documents' collection from Chroma Cloud.
    Initializes connection if not already created.
    """
    global _documents_collection
    if _documents_collection is None:
        init_chroma_db()
    return _documents_collection


def is_document_indexed(document_id: str) -> bool:
    """
    Checks whether a document with document_id already has embeddings stored in Chroma Cloud.
    """
    collection = get_documents_collection()
    results = collection.get(
        where={"documentId": document_id},
        limit=1,
        include=[],
    )
    already_indexed = len(results["ids"]) > 0
    if already_indexed:
        logger.info(f"[CHROMA CLOUD] Document '{document_id}' is already indexed — skipping duplicate embedding.")
    return already_indexed


def store_document_chunks(
    chunks: List[Dict[str, Any]],
    embeddings: List[List[float]],
    document_id: str,
    user_id: str,
    filename: str,
    upload_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Stores document chunk embeddings into the Chroma Cloud 'documents' collection.
    Enforces strict userId presence on every indexed vector chunk.
    """
    if not user_id or not str(user_id).strip():
        raise ValueError("userId is mandatory for indexing. Vector storage rejected without valid userId.")

    if not chunks or not embeddings:
        return {
            "stored_count": 0,
            "document_id": document_id,
            "collection_name": COLLECTION_NAME,
            "mode": "Chroma Cloud",
            "collection_total": get_documents_collection().count(),
        }

    if len(chunks) != len(embeddings):
        raise ValueError(
            f"Mismatch: {len(chunks)} chunks but {len(embeddings)} embeddings"
        )

    if upload_date is None:
        upload_date = datetime.now(timezone.utc).isoformat()

    collection = get_documents_collection()
    before_count = collection.count()

    ids = []
    documents = []
    metadatas = []

    clean_user_id = str(user_id).strip()

    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        chunk_index = idx + 1
        chunk_id = f"{document_id}_chunk_{chunk_index}"
        meta = chunk.get("metadata", {})

        ids.append(chunk_id)
        documents.append(chunk["text"])
        metadatas.append({
            "userId": clean_user_id,
            "documentId": str(document_id),
            "filename": str(filename),
            "pageNumber": int(meta.get("page_number", 1)),
            "chunkIndex": chunk_index,
            "uploadDate": str(upload_date),
            "uploadedAt": str(upload_date),
            "subject": str(meta.get("subject", "")),
        })

    logger.info(
        f"[CHROMA CLOUD] Uploading {len(ids)} vectors with mandatory userId='{clean_user_id}' "
        f"into collection '{COLLECTION_NAME}' (before count: {before_count})"
    )

    batch_size = 100
    for start in range(0, len(ids), batch_size):
        end = start + batch_size
        collection.upsert(
            ids=ids[start:end],
            embeddings=embeddings[start:end],
            documents=documents[start:end],
            metadatas=metadatas[start:end],
        )

    after_count = collection.count()

    if after_count == 0 and len(ids) > 0:
        err_msg = f"[CHROMA CLOUD ERROR] collection.count() remains 0 after uploading {len(ids)} chunks to Chroma Cloud"
        logger.error(err_msg)
        raise RuntimeError(err_msg)

    logger.info(
        f"[CHROMA CLOUD] Vector upload verified for '{filename}'. Collection '{COLLECTION_NAME}' total: {after_count} vectors "
        f"(added: {after_count - before_count})"
    )

    return {
        "stored_count": len(ids),
        "document_id": document_id,
        "user_id": clean_user_id,
        "collection_name": COLLECTION_NAME,
        "mode": "Chroma Cloud",
        "before_count": before_count,
        "after_count": after_count,
        "collection_total": after_count,
    }


def get_chroma_stats() -> Dict[str, Any]:
    """
    Returns administrative statistics from Chroma Cloud.
    """
    collection = get_documents_collection()
    total_chunks = collection.count()

    results = collection.get(include=["metadatas"])
    metadatas = results.get("metadatas", [])

    doc_map: Dict[str, Dict[str, Any]] = {}
    user_set = set()
    user_doc_counts: Dict[str, int] = {}
    last_indexing_time = None

    for meta in metadatas:
        if not meta:
            continue
        doc_id = meta.get("documentId", "unknown")
        filename = meta.get("filename", "unknown.pdf")
        user_id = meta.get("userId", "anonymous")
        upload_date = meta.get("uploadDate", "") or meta.get("uploadedAt", "")

        user_set.add(user_id)
        user_doc_counts[user_id] = user_doc_counts.get(user_id, 0) + 1

        if doc_id not in doc_map:
            doc_map[doc_id] = {
                "document_id": doc_id,
                "filename": filename,
                "user_id": user_id,
                "chunk_count": 0,
                "upload_date": upload_date,
            }
        doc_map[doc_id]["chunk_count"] += 1

        if upload_date and (not last_indexing_time or upload_date > last_indexing_time):
            last_indexing_time = upload_date

    tenant_val = getattr(_chroma_client, "tenant", settings.CHROMA_TENANT)
    database_val = getattr(_chroma_client, "database", settings.CHROMA_DATABASE)

    return {
        "status": "success",
        "mode": "Chroma Cloud",
        "tenant": str(tenant_val),
        "database": str(database_val),
        "collection_name": COLLECTION_NAME,
        "total_documents": len(doc_map),
        "total_chunks": total_chunks,
        "students_count": len(user_set),
        "embedding_model": settings.EMBEDDING_MODEL,
        "embedding_dimension": 384,
        "sdk_version": getattr(chromadb, "__version__", "unknown"),
        "chromadb_status": "online",
        "queue_status": "idle",
        "failed_jobs": 0,
        "last_indexing_time": last_indexing_time or datetime.now(timezone.utc).isoformat(),
        "indexed_documents": list(doc_map.values()),
        "students_summary": [
            {"user_id": uid, "total_chunks": count}
            for uid, count in user_doc_counts.items()
        ],
    }


def get_chroma_debug_info() -> Dict[str, Any]:
    """
    Returns live debug inspection data for Chroma Cloud.
    """
    collection = get_documents_collection()
    count = collection.count()

    results = collection.get(include=["metadatas"])
    metadatas = results.get("metadatas", [])
    doc_ids = sorted(list(set(m.get("documentId", "") for m in metadatas if m and m.get("documentId"))))

    tenant_val = getattr(_chroma_client, "tenant", settings.CHROMA_TENANT)
    database_val = getattr(_chroma_client, "database", settings.CHROMA_DATABASE)

    return {
        "mode": "Chroma Cloud",
        "tenant": str(tenant_val),
        "database": str(database_val),
        "collection": COLLECTION_NAME,
        "collectionCount": count,
        "totalChunks": count,
        "totalDocuments": len(doc_ids),
        "sdkVersion": getattr(chromadb, "__version__", "unknown"),
        "connected": True,
    }


def delete_document_vectors(document_id: str) -> Dict[str, Any]:
    """
    Deletes all vector embeddings for document_id from Chroma Cloud.
    """
    collection = get_documents_collection()
    existing = collection.get(where={"documentId": document_id}, include=[])
    matching_ids = existing.get("ids", [])

    if matching_ids:
        collection.delete(ids=matching_ids)
        logger.info(f"[CHROMA CLOUD] Deleted {len(matching_ids)} vectors for document '{document_id}'.")

    after_count = collection.count()

    return {
        "status": "success",
        "document_id": document_id,
        "deleted_chunks": len(matching_ids),
        "collection_total": after_count,
        "message": f"Successfully deleted {len(matching_ids)} vector chunks from Chroma Cloud for document '{document_id}'.",
    }


def rebuild_vector_store() -> Dict[str, Any]:
    """
    Resets the 'documents' collection in Chroma Cloud.
    """
    global _chroma_client, _documents_collection
    client = get_chroma_client()

    try:
        client.delete_collection(COLLECTION_NAME)
        logger.info(f"[CHROMA CLOUD] Reset existing '{COLLECTION_NAME}' collection in Chroma Cloud.")
    except Exception as e:
        logger.warning(f"[CHROMA CLOUD WARNING] Error deleting collection during rebuild: {e}")

    _documents_collection = None
    init_chroma_db()

    return {
        "status": "success",
        "message": f"Chroma Cloud vector store rebuilt successfully. Collection '{COLLECTION_NAME}' reset.",
        "collection_total": 0,
    }
