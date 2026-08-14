# AI Learning Companion (Jarvis)

An intelligent AI Learning Companion application built with React, Node.js (Express), MongoDB, and a dedicated Python FastAPI RAG Service connected exclusively to **Chroma Cloud**.

---

## ⚡ Architecture Overview

```text
React Frontend (Vite)
       │
       ▼
Node.js Express Backend (MongoDB & Auth)
       │
       ▼
Python FastAPI RAG Service (PyMuPDF, sentence-transformers, OpenRouter)
       │
       ▼
Chroma Cloud Vector Database (Collection: `documents`)
```

- **Vector Storage**: Uses **Chroma Cloud exclusively** for storing and querying document embeddings. No local persistent vector databases (`PersistentClient`) are used in production or development.
- **Centralized Upload Directory**: Stores all uploaded PDFs in `backend/uploads/documents/` and user avatars in `backend/uploads/avatars/`. No duplicate copies are created by the RAG service.

---

## 📚 API Documentation

Complete API reference specifications and function maps:
- 📖 [**Master API Documentation**](./API_DOCUMENTATION.md)
- 🟢 [**Node.js Express Backend API Spec**](./backend/API.md)
- 🐍 [**Python FastAPI RAG Service API Spec**](./backend/rag-service/API.md)

---

## 🔑 Configuration Setup

Configure credentials and upload paths in **`backend/.env`**:

```env
# Chroma Cloud Credentials
CHROMA_API_KEY=your_chroma_cloud_api_key_here
CHROMA_TENANT=4f9a2bf8-faca-482c-b301-e53b41f08e3f
CHROMA_DATABASE=ai-learning-companion

# RAG Service & Storage Configuration
RAG_PORT=8000
UPLOAD_DIR=backend/uploads/documents
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openrouter/free
```

---

## 🛠️ Verification & Diagnostic Endpoints

### 1. Connection & Health Check
Verify RAG Service health and Chroma Cloud connection details:
```bash
curl http://localhost:8000/health
```
**Expected Output**:
```json
{
  "status": "ok",
  "mode": "Chroma Cloud",
  "tenant": "4f9a2bf8-faca-482c-b301-e53b41f08e3f",
  "database": "ai-learning-companion",
  "collection": "documents",
  "embedding_model": "BAAI/bge-small-en-v1.5",
  "sdk_version": "<sdk_version>"
}
```

### 2. Live Admin Statistics
Check live vector chunk counts and document stats from Chroma Cloud:
```bash
curl http://localhost:8000/admin/stats
```

### 3. Debug Inspection
Inspect raw collection count and document IDs:
```bash
curl http://localhost:8000/debug/chroma
```

---

## 🔍 Troubleshooting Indexing Issues

1. **Authentication Error / 410 Gone / 401 Unauthorized**:
   - Ensure `chromadb>=0.5.20` is installed.
   - Verify `CHROMA_API_KEY`, `CHROMA_TENANT`, and `CHROMA_DATABASE` in `backend/.env`.
2. **Duplicate Uploads**:
   - The RAG service automatically checks whether a document ID is already indexed into the `documents` collection using `is_document_indexed(document_id)`.
3. **Resetting / Rebuilding Collection**:
   - To clear and recreate the `documents` collection in Chroma Cloud, trigger the rebuild endpoint:
     ```bash
     curl -X POST http://localhost:8000/admin/rebuild-index
     ```

---

## 🚀 Running the Project Locally

1. **Backend (Express API)**:
   ```bash
   cd backend
   npm run dev
   ```

2. **RAG Service (FastAPI)**:
   ```bash
   cd backend/rag-service
   uvicorn app:app --reload --port 8000
   ```

3. **Frontend (React)**:
   ```bash
   cd frontend
   npm run dev
   ```
