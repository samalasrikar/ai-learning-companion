import logging
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger("rag_service.chunker")

# Cache the tiktoken encoding so it's loaded only once
_tiktoken_encoding = None


def _get_tiktoken_encoding():
    """Lazily load and cache the tiktoken cl100k_base encoding."""
    global _tiktoken_encoding
    if _tiktoken_encoding is None:
        try:
            import tiktoken
            _tiktoken_encoding = tiktoken.get_encoding("cl100k_base")
        except Exception as e:
            logger.warning(f"Failed to load tiktoken encoding: {e}")
            _tiktoken_encoding = None
    return _tiktoken_encoding


def estimate_token_count(text: str) -> int:
    """
    Estimates token count using tiktoken (cl100k_base) with character-ratio fallback.
    The encoding is cached after first use for performance.
    """
    encoding = _get_tiktoken_encoding()
    if encoding is not None:
        try:
            return len(encoding.encode(text))
        except Exception:
            pass
    # Fallback estimation: ~1 token per 4 characters
    return max(1, len(text) // 4)


def get_text_splitter(
    target_chunk_tokens: int = 500,
    overlap_tokens: int = 100,
) -> RecursiveCharacterTextSplitter:
    """
    Constructs a RecursiveCharacterTextSplitter configured for target token counts.
    Uses tiktoken-aware splitting when available, with a character-based fallback.

    Separators are ordered to prefer paragraph > sentence > word boundaries,
    producing semantically coherent chunks.
    """
    separators = ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""]

    try:
        return RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            model_name="gpt-4",
            chunk_size=target_chunk_tokens,
            chunk_overlap=overlap_tokens,
            separators=separators,
        )
    except Exception as e:
        logger.warning(
            f"Failed to load tiktoken splitter ({e}), "
            f"falling back to character-based splitter."
        )
        # ~4 chars per token: 500 tokens ≈ 2000 chars, 100 overlap ≈ 400 chars
        return RecursiveCharacterTextSplitter(
            chunk_size=target_chunk_tokens * 4,
            chunk_overlap=overlap_tokens * 4,
            separators=separators,
        )


def create_document_chunks(
    pages: List[Dict[str, Any]],
    document_id: str,
    user_id: str,
    filename: str,
    target_chunk_tokens: int = 500,
    overlap_tokens: int = 100,
) -> Dict[str, Any]:
    """
    Splits document pages into semantic chunks of ~500 tokens with 100-token overlap,
    preserving metadata (filename, page_number, document_id, user_id, chunk_number).

    Args:
        pages: List of page dicts with 'page_number' and 'text' keys.
        document_id: Unique identifier for the document.
        user_id: ID of the user who uploaded the document.
        filename: Original filename of the uploaded PDF.
        target_chunk_tokens: Target number of tokens per chunk (default 500).
        overlap_tokens: Number of overlapping tokens between chunks (default 100).

    Returns:
        Dict with 'statistics' (processing stats) and 'chunks' (list of chunk dicts).
    """
    splitter = get_text_splitter(
        target_chunk_tokens=target_chunk_tokens,
        overlap_tokens=overlap_tokens,
    )

    chunks: List[Dict[str, Any]] = []
    chunk_number = 1
    total_characters = 0
    total_tokens = 0

    for page in pages:
        page_num = page["page_number"]
        page_text = page["text"]

        if not page_text or not page_text.strip():
            continue

        # Split text of current page into semantic chunks
        page_chunks = splitter.split_text(page_text)

        for chunk_text in page_chunks:
            chunk_text = chunk_text.strip()
            if not chunk_text:
                continue

            chars = len(chunk_text)
            tokens = estimate_token_count(chunk_text)

            chunk_item = {
                "chunk_number": chunk_number,
                "text": chunk_text,
                "metadata": {
                    "filename": filename,
                    "page_number": page_num,
                    "document_id": document_id,
                    "user_id": user_id,
                    "chunk_number": chunk_number,
                    "char_count": chars,
                    "token_count": tokens,
                },
            }

            chunks.append(chunk_item)
            total_characters += chars
            total_tokens += tokens
            chunk_number += 1

    total_chunks = len(chunks)
    avg_tokens = round(total_tokens / total_chunks, 2) if total_chunks > 0 else 0
    avg_chars = round(total_characters / total_chunks, 2) if total_chunks > 0 else 0

    statistics = {
        "document_id": document_id,
        "user_id": user_id,
        "filename": filename,
        "total_pages": len(pages),
        "total_chunks": total_chunks,
        "total_characters": total_characters,
        "total_tokens": total_tokens,
        "average_chunk_tokens": avg_tokens,
        "average_chunk_characters": avg_chars,
        "target_chunk_tokens": target_chunk_tokens,
        "overlap_tokens": overlap_tokens,
    }

    logger.info(
        f"Created {total_chunks} chunks from '{filename}' "
        f"(avg {avg_tokens} tokens/chunk)"
    )

    return {
        "statistics": statistics,
        "chunks": chunks,
    }
