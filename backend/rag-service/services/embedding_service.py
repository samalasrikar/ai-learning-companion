import logging
from typing import List
from sentence_transformers import SentenceTransformer
from config import settings

logger = logging.getLogger("rag_service.embedding")

# Model singleton — loaded once, reused across requests
_model: SentenceTransformer = None

EMBEDDING_MODEL_NAME = settings.EMBEDDING_MODEL
EMBEDDING_DIMENSION = 384  # bge-small-en-v1.5 output dimension


def load_embedding_model() -> SentenceTransformer:
    """
    Lazily loads and caches the BAAI/bge-small-en-v1.5 SentenceTransformer model.
    The model is downloaded on first call and reused for all subsequent calls.

    Returns:
        The loaded SentenceTransformer model instance.
    """
    global _model
    if _model is None:
        logger.info(f"Loading embedding model '{EMBEDDING_MODEL_NAME}'...")
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        logger.info(
            f"Embedding model loaded successfully "
            f"(dimension={_model.get_embedding_dimension()})"
        )
    return _model


def generate_embeddings(texts: List[str], batch_size: int = 64) -> List[List[float]]:
    """
    Generates embeddings for a list of text strings using BAAI/bge-small-en-v1.5.

    This model expects an instruction prefix for queries but NOT for documents/passages.
    Since we are embedding document chunks (passages), we pass them directly.

    Args:
        texts: List of text strings to embed.
        batch_size: Number of texts to encode per batch (default 64).

    Returns:
        List of embedding vectors, one per input text. Each vector is a list
        of floats with length = EMBEDDING_DIMENSION (384).
    """
    if not texts:
        return []

    model = load_embedding_model()

    logger.info(f"Generating embeddings for {len(texts)} texts (batch_size={batch_size})")

    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=False,
        normalize_embeddings=True,  # L2-normalize for cosine similarity
    )

    # Convert numpy arrays to plain Python lists for JSON serialization / ChromaDB
    result = [emb.tolist() for emb in embeddings]

    logger.info(f"Generated {len(result)} embeddings (dim={len(result[0]) if result else 0})")
    return result
