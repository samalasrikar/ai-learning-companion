import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import chromadb

from config import settings
from services.chroma_service import init_chroma_db
from services.embedding_service import load_embedding_model
from routes import document_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag_service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Log safe config, initialize Chroma Cloud + preload embedding model
    logger.info("Starting up RAG service...")
    settings.log_startup_config()

    # ── Chroma Cloud init (non-fatal on startup) ──────────────────────────────
    # If the API key is invalid/expired the server will still start.
    # Fix CHROMA_API_KEY in backend/.env then restart to restore full function.
    try:
        init_chroma_db()
    except Exception as chroma_err:
        logger.error("=" * 60)
        logger.error("[CHROMA STARTUP ERROR] Could not connect to Chroma Cloud.")
        logger.error(f"  Reason  : {chroma_err}")
        logger.error("  Fix     : Your CHROMA_API_KEY is likely expired or invalid.")
        logger.error("  Steps   :")
        logger.error("    1. Go to https://trychroma.com and log in.")
        logger.error("    2. Open your Dashboard → API Keys → Create new key.")
        logger.error("    3. Also copy your Tenant ID and Database name.")
        logger.error("    4. Update CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE")
        logger.error("       in  backend/.env")
        logger.error("    5. Restart the RAG service.")
        logger.error("  NOTE    : RAG service started in DEGRADED mode.")
        logger.error("            Document indexing and semantic search are unavailable")
        logger.error("            until a valid Chroma connection is restored.")
        logger.error("=" * 60)

    # ── Embedding model preload ───────────────────────────────────────────────
    try:
        load_embedding_model()
    except Exception as embed_err:
        logger.error(f"[EMBEDDING STARTUP ERROR] Failed to load embedding model: {embed_err}")

    yield
    logger.info("Shutting down RAG service...")



app = FastAPI(
    title="Jarvis RAG Service",
    description="FastAPI RAG service for document processing and vector storage using Chroma Cloud",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration using settings.ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router at root and with /documents prefix for compatibility
app.include_router(document_router)
app.include_router(document_router, prefix="/documents")


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "mode": "Chroma Cloud",
        "tenant": settings.CHROMA_TENANT,
        "database": settings.CHROMA_DATABASE,
        "collection": "documents",
        "embedding_model": settings.EMBEDDING_MODEL,
        "ai_provider": settings.AI_PROVIDER,
        "llm_model": settings.OPENROUTER_MODEL,
        "sdk_version": getattr(chromadb, "__version__", "unknown"),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host=settings.HOST, port=settings.PORT, reload=True)
