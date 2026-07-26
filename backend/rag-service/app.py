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
    init_chroma_db()
    load_embedding_model()
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
