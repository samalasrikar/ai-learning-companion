import logging
from typing import List, Dict, Any

from services.embedding_service import generate_embeddings
from services.chroma_service import get_documents_collection

logger = logging.getLogger("rag_service.retrieval")


def retrieve_relevant_chunks(
    query: str,
    user_id: str,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Performs semantic retrieval against the ChromaDB 'documents' collection.

    1. Embeds the user question using BAAI/bge-small-en-v1.5.
    2. Searches ChromaDB filtering strictly by userId = user_id.
    3. Retrieves top_k most relevant chunks with similarity scores.

    Args:
        query: User question or search phrase.
        user_id: ID of the user (restricts search scope).
        top_k: Maximum number of relevant chunks to return (default: 5).

    Returns:
        List of result dicts, each containing:
          - chunk_id: Unique chunk identifier
          - text: Chunk text content
          - similarity_score: Calculated cosine similarity score (1.0 - distance)
          - metadata: Dict with filename, page_number, document_id, user_id, etc.
    """
    if not query or not query.strip():
        logger.warning("Empty query provided to retrieve_relevant_chunks")
        return []

    if not user_id or not user_id.strip():
        logger.warning("Empty user_id provided to retrieve_relevant_chunks")
        return []

    clean_user_id = str(user_id).strip()

    top_k = max(1, top_k)

    # Step 1: Generate embedding vector for the user query
    query_text = query.strip()
    query_embeddings = generate_embeddings([query_text])

    if not query_embeddings:
        logger.error("Failed to generate query embedding.")
        return []

    query_vec = query_embeddings[0]

    # Step 2: Query ChromaDB with mandatory userId metadata filter
    collection = get_documents_collection()
    collection_count = collection.count()

    if collection_count == 0:
        logger.info(
            f"[RAG] User: {clean_user_id} | Query: '{query_text[:60]}' | "
            f"Collection: documents | Metadata Filter: {{\"userId\": \"{clean_user_id}\"}} | "
            f"Retrieved Chunks: 0 (Collection is empty)"
        )
        return []

    try:
        raw_results = collection.query(
            query_embeddings=[query_vec],
            n_results=top_k,
            where={"userId": clean_user_id},
            include=["documents", "metadatas", "distances"],
        )
    except Exception as e:
        logger.error(f"[RAG ERROR] ChromaDB query failed for user '{clean_user_id}': {e}")
        return []

    # Unpack ChromaDB list-of-lists response
    ids_list = raw_results.get("ids", [[]])[0]
    docs_list = raw_results.get("documents", [[]])[0]
    meta_list = raw_results.get("metadatas", [[]])[0]
    dist_list = raw_results.get("distances", [[]])[0]

    retrieved_chunks: List[Dict[str, Any]] = []

    for chunk_id, doc_text, meta, dist in zip(ids_list, docs_list, meta_list, dist_list):
        # Convert cosine distance to similarity score: similarity = 1.0 - distance
        similarity_score = round(max(0.0, 1.0 - dist), 4)

        item = {
            "chunk_id": chunk_id,
            "text": doc_text,
            "similarity_score": similarity_score,
            "metadata": {
                "filename": meta.get("filename", ""),
                "page_number": meta.get("pageNumber", 1),
                "document_id": meta.get("documentId", ""),
                "user_id": meta.get("userId", clean_user_id),
                "chunk_index": meta.get("chunkIndex", 1),
                "upload_date": meta.get("uploadDate", "") or meta.get("uploadedAt", ""),
            },
        }
        retrieved_chunks.append(item)

    logger.info(
        f"[RAG] User: {clean_user_id} | Query: '{query_text[:60]}' | "
        f"Collection: documents | Metadata Filter: {{\"userId\": \"{clean_user_id}\"}} | "
        f"Retrieved Chunks: {len(retrieved_chunks)}"
    )

    return retrieved_chunks
