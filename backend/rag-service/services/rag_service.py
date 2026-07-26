import os
import logging
from typing import List, Dict, Any, Optional
import requests

from config import settings
from services.retrieval_service import retrieve_relevant_chunks

logger = logging.getLogger("rag_service.rag")

NOT_FOUND_RESPONSE = "The information is not available in the uploaded documents."

RAG_SYSTEM_PROMPT = """You are an AI learning companion. Answer the user's question using the provided document context below.
Always cite the document name and page number when stating facts from the documents (e.g., According to "Filename.pdf" (Page 12)...).
If the context does not contain enough information to fully answer, state what is available in the documents."""

STRICT_RAG_SYSTEM_PROMPT = """You are an AI learning companion. Answer the user's question strictly using ONLY the provided document context below.

Critical Instructions:
1. Rely ONLY on clear facts directly mentioned in the context. Do NOT extrapolate, speculate, or use outside knowledge.
2. If the answer cannot be found in the provided context, respond with: "The information is not available in the uploaded documents."
3. Keep your response accurate, clear, concise, and well-structured."""

GENERAL_SYSTEM_PROMPT = """You are an AI learning companion. Provide a helpful, accurate, well-structured, and clear response to the user's question based on your general knowledge. Keep your response informative, concise, and structured."""


def construct_rag_prompt(query: str, chunks: List[Dict[str, Any]]) -> str:
    """
    Constructs the user prompt combining retrieved context chunks with the user question.
    """
    context_blocks = []
    for idx, chunk in enumerate(chunks, 1):
        meta = chunk.get("metadata", {})
        filename = meta.get("filename", "document.pdf")
        page_num = meta.get("page_number", 1)
        doc_id = meta.get("document_id", "N/A")

        header = f"[Source {idx}: {filename}, Page {page_num}, Doc ID: {doc_id}]"
        context_blocks.append(f"{header}\n{chunk['text']}")

    context_str = "\n\n".join(context_blocks)

    return f"""Context from uploaded documents:
---
{context_str}
---

Question: {query}

Answer:"""


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Calls the LLM via OpenRouter / OpenAI-compatible API to generate an answer.
    """
    api_key = settings.OPENROUTER_API_KEY
    base_url = settings.OPENROUTER_BASE_URL
    model_name = settings.OPENROUTER_MODEL

    if not api_key:
        logger.warning("OPENROUTER_API_KEY is not configured.")
        return NOT_FOUND_RESPONSE

    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Jarvis RAG Service",
    }
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 1000,
    }

    try:
        logger.info(f"[LLM]\nProvider:\nOpenRouter\nModel:\n{model_name}")
        response = requests.post(url, headers=headers, json=payload, timeout=30)

        if response.status_code == 200:
            data = response.json()
            choices = data.get("choices", [])
            if choices and "message" in choices[0]:
                content = choices[0]["message"].get("content", "").strip()
                if content:
                    logger.info("[LLM] Request Successful")
                    return content

        logger.error(
            f"LLM API returned status {response.status_code}: {response.text[:200]}"
        )

        # Try fallback model if main model hits rate limit / error
        if model_name != "openrouter/free":
            logger.info("Retrying with fallback model 'openrouter/free'...")
            payload["model"] = "openrouter/free"
            fb_res = requests.post(url, headers=headers, json=payload, timeout=30)
            if fb_res.status_code == 200:
                data = fb_res.json()
                choices = data.get("choices", [])
                if choices and "message" in choices[0]:
                    content = choices[0]["message"].get("content", "").strip()
                    if content:
                        return content

    except Exception as e:
        logger.exception(f"Error communicating with LLM API: {e}")

    return NOT_FOUND_RESPONSE


def generate_rag_answer(
    query: str,
    user_id: str,
    top_k: int = 5,
    mode: Optional[str] = None,
    similarity_threshold: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Generates AI responses based on AI Response Mode (hybrid, strict_rag, general_only):
    - Hybrid (Default): Uses RAG if retrieved chunks pass similarity threshold.
      Otherwise, falls back to General AI knowledge with a clear notice.
    - Strict RAG: Only uses document context. Returns 'not available' if missing/below threshold.
    - General Only: Bypasses RAG and uses General AI knowledge directly.
    """
    if not query or not query.strip():
        return {
            "status": "error",
            "message": "Query string cannot be empty.",
            "mode": "rag",
            "answer": NOT_FOUND_RESPONSE,
            "sources": [],
            "retrieved_chunks_count": 0,
        }

    if not user_id or not user_id.strip():
        return {
            "status": "error",
            "message": "User ID cannot be empty.",
            "mode": "rag",
            "answer": NOT_FOUND_RESPONSE,
            "sources": [],
            "retrieved_chunks_count": 0,
        }

    # Resolve active response mode and similarity threshold
    active_mode = (mode or settings.AI_RESPONSE_MODE or "hybrid").lower()
    if active_mode not in ("hybrid", "strict_rag", "general_only", "general"):
        active_mode = "hybrid"

    threshold = similarity_threshold if similarity_threshold is not None else settings.SIMILARITY_THRESHOLD

    # Case A: General AI Only Mode
    if active_mode in ("general_only", "general"):
        logger.info(f"[RAG] Mode: general_only → Generating response using General AI for user '{user_id}'")
        gen_answer = call_llm(GENERAL_SYSTEM_PROMPT, query.strip())
        return {
            "status": "success",
            "mode": "general",
            "query": query,
            "user_id": user_id,
            "answer": gen_answer,
            "sources": [],
            "retrieved_chunks_count": 0,
        }

    # Retrieve chunks for RAG or Hybrid evaluation
    retrieved_chunks = retrieve_relevant_chunks(
        query=query,
        user_id=user_id,
        top_k=top_k,
    )

    # Filter chunks above configured similarity threshold
    relevant_chunks = [
        chunk for chunk in retrieved_chunks
        if chunk.get("similarity_score", 0.0) >= threshold
    ]

    top_score = relevant_chunks[0]["similarity_score"] if relevant_chunks else (
        retrieved_chunks[0]["similarity_score"] if retrieved_chunks else 0.0
    )

    # Build sources list from filtered relevant chunks
    sources = []
    seen_sources = set()

    for chunk in relevant_chunks:
        meta = chunk.get("metadata", {})
        source_key = (
            meta.get("document_id", ""),
            meta.get("filename", ""),
            meta.get("page_number", 1),
            meta.get("chunk_index", 1),
        )

        source_obj = {
            "filename": meta.get("filename", "document.pdf"),
            "page_number": meta.get("page_number", 1),
            "document_id": meta.get("document_id", ""),
            "chunk_id": chunk.get("chunk_id", ""),
            "chunk_index": meta.get("chunk_index", 1),
            "similarity_score": chunk.get("similarity_score", 0.0),
        }

        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources.append(source_obj)

    # Case B: Strict RAG Mode
    if active_mode == "strict_rag":
        if not relevant_chunks:
            logger.info(f"[RAG] Mode: strict_rag → No relevant chunks found above threshold {threshold} (top score={top_score}).")
            return {
                "status": "success",
                "mode": "rag",
                "query": query,
                "user_id": user_id,
                "answer": NOT_FOUND_RESPONSE,
                "sources": [],
                "retrieved_chunks_count": 0,
            }

        logger.info(f"[RAG] Retrieved {len(relevant_chunks)} chunks above threshold {threshold} → Using RAG")
        user_prompt = construct_rag_prompt(query, relevant_chunks)
        answer = call_llm(STRICT_RAG_SYSTEM_PROMPT, user_prompt)

        # Clear sources if LLM responds that information is not available in context
        if answer == NOT_FOUND_RESPONSE or "information is not available" in answer.lower():
            return {
                "status": "success",
                "mode": "rag",
                "query": query,
                "user_id": user_id,
                "answer": NOT_FOUND_RESPONSE,
                "sources": [],
                "retrieved_chunks_count": len(relevant_chunks),
            }

        return {
            "status": "success",
            "mode": "rag",
            "query": query,
            "user_id": user_id,
            "answer": answer,
            "sources": sources,
            "retrieved_chunks_count": len(relevant_chunks),
        }

    # Case C: Hybrid Mode (Default)
    if relevant_chunks:
        logger.info(f"[RAG] Retrieved {len(relevant_chunks)} chunks above threshold {threshold} (top score={top_score}) → Using RAG")
        user_prompt = construct_rag_prompt(query, relevant_chunks)
        answer = call_llm(RAG_SYSTEM_PROMPT, user_prompt)
        return {
            "status": "success",
            "mode": "rag",
            "query": query,
            "user_id": user_id,
            "answer": answer,
            "sources": sources,
            "retrieved_chunks_count": len(relevant_chunks),
        }

    # Fallback to General AI when no relevant chunks match threshold
    logger.info(f"[RAG] No relevant chunks found above threshold {threshold} (top score={top_score}) → Falling back to General AI")
    gen_answer = call_llm(
        GENERAL_SYSTEM_PROMPT,
        query.strip()
    )

    return {
        "status": "success",
        "mode": "general",
        "query": query,
        "user_id": user_id,
        "answer": gen_answer,
        "sources": [],
        "retrieved_chunks_count": 0,
    }
