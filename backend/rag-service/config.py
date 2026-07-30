import os
import logging
from pathlib import Path
from typing import List
from dotenv import load_dotenv
import chromadb

# Resolve paths to backend/.env (Single source of truth)
BASE_DIR = Path(__file__).resolve().parent      # backend/rag-service
BACKEND_DIR = BASE_DIR.parent                   # backend
SHARED_ENV_PATH = BACKEND_DIR / ".env"

if SHARED_ENV_PATH.exists():
    load_dotenv(dotenv_path=SHARED_ENV_PATH, override=True)
else:
    load_dotenv(override=True)

logger = logging.getLogger("rag_service.config")


class Settings:
    """
    Centralized configuration class for the FastAPI RAG service targeting Chroma Cloud exclusively.
    Loads and validates environment variables strictly from backend/.env.
    """

    @property
    def PORT(self) -> int:
        port_str = os.getenv("RAG_PORT") or os.getenv("PORT") or "8000"
        return int(port_str)

    @property
    def HOST(self) -> str:
        return os.getenv("RAG_HOST") or os.getenv("HOST") or "0.0.0.0"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        raw_origins = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://localhost:5000",
        )
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    # Chroma Cloud Configuration
    @property
    def CHROMA_API_KEY(self) -> str:
        return os.getenv("CHROMA_API_KEY", "")

    @property
    def CHROMA_TENANT(self) -> str:
        return os.getenv("CHROMA_TENANT", "")

    @property
    def CHROMA_DATABASE(self) -> str:
        return os.getenv("CHROMA_DATABASE", "")

    @property
    def CHROMA_HOST(self) -> str:
        return os.getenv("CHROMA_HOST", "api.trychroma.com")

    # Storage and Model Configurations
    @property
    def UPLOAD_DIR(self) -> str:
        raw_path = os.getenv("UPLOAD_DIR", "backend/uploads/documents")
        p = Path(raw_path)
        if not p.is_absolute():
            project_root = BACKEND_DIR.parent
            if raw_path.startswith("./rag-service/") or raw_path.startswith("rag-service/"):
                relative_path = raw_path[2:] if raw_path.startswith("./") else raw_path
                p = (BACKEND_DIR / relative_path).resolve()
            elif raw_path.startswith("backend/") or raw_path.startswith("./backend/"):
                clean_rel = raw_path.lstrip("./").replace("backend/", "", 1)
                p = (BACKEND_DIR / clean_rel).resolve()
            elif (BACKEND_DIR / p).exists() or raw_path.startswith("uploads/"):
                p = (BACKEND_DIR / p).resolve()
            else:
                p = (project_root / p).resolve()
        return str(p)

    @property
    def EMBEDDING_MODEL(self) -> str:
        return os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")

    @property
    def OPENROUTER_API_KEY(self) -> str:
        return os.getenv("OPENROUTER_API_KEY", "")

    @property
    def OPENROUTER_BASE_URL(self) -> str:
        return os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    @property
    def AI_PROVIDER(self) -> str:
        return "OpenRouter"

    @property
    def OPENROUTER_MODEL(self) -> str:
        return os.getenv("OPENROUTER_MODEL", "openrouter/free")

    @property
    def SIMILARITY_THRESHOLD(self) -> float:
        try:
            return float(os.getenv("SIMILARITY_THRESHOLD", "0.75"))
        except ValueError:
            return 0.75

    @property
    def AI_RESPONSE_MODE(self) -> str:
        return os.getenv("AI_RESPONSE_MODE", "hybrid").lower()

    def validate_directories(self) -> None:
        """Ensures UPLOAD_DIR exists on disk."""
        upload_path = self.UPLOAD_DIR
        os.makedirs(upload_path, exist_ok=True)
        logger.info(f"Verified Uploads directory: {upload_path}")

    def mask_secret(self, secret: str) -> str:
        """Masks sensitive strings for safe logging."""
        if not secret:
            return "not_configured"
        if len(secret) <= 8:
            return "****"
        return f"{secret[:4]}...{secret[-4:]}"

    def log_startup_config(self) -> None:
        """Safely logs application configuration parameters at startup."""
        self.validate_directories()
        sdk_version = getattr(chromadb, "__version__", "unknown")
        logger.info("=========================================")
        logger.info("RAG Configuration")
        logger.info("=========================================")
        logger.info("Storage Mode:")
        logger.info("Chroma Cloud")
        logger.info("")
        logger.info("Tenant:")
        logger.info(self.CHROMA_TENANT or "Not Configured")
        logger.info("")
        logger.info("Database:")
        logger.info(self.CHROMA_DATABASE or "Not Configured")
        logger.info("")
        logger.info("Collection:")
        logger.info("documents")
        logger.info("")
        logger.info("Embedding Model:")
        logger.info(self.EMBEDDING_MODEL)
        logger.info("")
        logger.info("SDK Version:")
        logger.info(sdk_version)
        logger.info("")
        logger.info("Connection:")
        logger.info("Initializing...")
        logger.info("=========================================")


# Singleton settings instance
settings = Settings()
