# Python FastAPI RAG Service — API & Function Specifications

Base URL: `http://localhost:8000`

---

## ⚡ Overview

The Python FastAPI RAG Service handles document ingestion, PyMuPDF text extraction, chunking, vector embedding generation using `sentence-transformers` (`BAAI/bge-small-en-v1.5`), and cloud vector persistence in **Chroma Cloud** (`documents` collection).

---

## 🛠️ API Endpoint Specifications

### 1. `GET /health`
- **Route Function**: [`health_check`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/app.py#L76-L88)
- **Authentication**: Public
- **Description**: Returns operational status, active vector database mode (`Chroma Cloud`), tenant ID, database name, collection name, and model configurations.
- **Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "mode": "Chroma Cloud",
    "tenant": "4f9a2bf8-faca-482c-b301-e53b41f08e3f",
    "database": "ai-learning-companion",
    "collection": "documents",
    "embedding_model": "BAAI/bge-small-en-v1.5",
    "ai_provider": "openrouter",
    "llm_model": "openrouter/free",
    "sdk_version": "0.5.20"
  }
  ```

---

### 2. `POST /upload`
- **Route Function**: [`process_pdf`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L44-L110)
- **Service Functions**:
  - [`process_pdf_document`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/document_processor.py)
  - [`extract_text_from_pdf_bytes`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/pdf_service.py)
  - [`chunk_document_pages`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/chunker_service.py)
  - [`store_document_chunks`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/chroma_service.py)
- **Authentication**: Backend Internal / Restricted (Requires `user_id` form field)
- **Form Data**:
  - `file`: UploadFile (PDF document stream, Max 50MB)
  - `document_id`: string (Optional MongoDB Document ObjectId)
  - `user_id`: string (Mandatory User ObjectId for multi-tenant isolation)
- **Description**: Parses PDF text using PyMuPDF, chunks content into contextual segments with page numbers, computes embeddings, and stores them in Chroma Cloud with `user_id` & `document_id` metadata.
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "document_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "filename": "DevOps_Guide.pdf",
    "total_pages": 42,
    "chunks_created": 156,
    "embedding": {
      "stored_count": 156,
      "collection_total": 1280
    }
  }
  ```

---

### 3. `POST /search`
- **Route Function**: [`search_documents`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L113-L150)
- **Service Functions**: [`retrieve_relevant_chunks`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/retrieval_service.py)
- **Request Body (Pydantic Schema `QueryRequest`)**:
  ```json
  {
    "query": "What is Kubernetes horizontal pod autoscaling?",
    "user_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "top_k": 5
  }
  ```
- **Description**: Performs cosine similarity vector search against Chroma Cloud restricted to chunks belonging to `user_id`.
- **Response** (`200 OK`):
  ```json
  {
    "status": "success",
    "query": "What is Kubernetes horizontal pod autoscaling?",
    "user_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "total_results": 5,
    "results": [
      {
        "id": "doc_64f1a2b3c4d5e6f7a8b9c0d3_chunk_12",
        "text": "Horizontal Pod Autoscaler (HPA) automatically updates a workload resource...",
        "similarity": 0.884,
        "metadata": {
          "document_id": "64f1a2b3c4d5e6f7a8b9c0d3",
          "filename": "DevOps_Guide.pdf",
          "page": 14,
          "user_id": "64f1a2b3c4d5e6f7a8b9c0d1"
        }
      }
    ]
  }
  ```

---

### 4. `POST /query`
- **Route Function**: [`rag_question_answering`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L153-L186)
- **Service Functions**: [`generate_rag_answer`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/rag_service.py)
- **Request Body (Pydantic Schema `RAGRequest`)**:
  ```json
  {
    "query": "How do I configure horizontal pod autoscaling?",
    "user_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "top_k": 5,
    "mode": "hybrid",
    "similarity_threshold": 0.75
  }
  ```
- **Description**: Combines semantic context retrieval from Chroma Cloud with LLM inference via OpenRouter to generate grounded answers with cited sources.
- **Response** (`200 OK`):
  ```json
  {
    "query": "How do I configure horizontal pod autoscaling?",
    "user_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "answer": "To configure Horizontal Pod Autoscaling (HPA) in Kubernetes, deploy an HPA resource specifying target CPU utilization...",
    "mode": "rag",
    "sources": [
      {
        "document_id": "64f1a2b3c4d5e6f7a8b9c0d3",
        "filename": "DevOps_Guide.pdf",
        "page": 14,
        "similarity": 0.884
      }
    ]
  }
  ```

---

### 5. `GET /debug/chroma`
- **Route Function**: [`debug_chroma_endpoint`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L189-L199)
- **Service Function**: [`get_chroma_debug_info`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/chroma_service.py)
- **Description**: Diagnostic endpoint inspecting Chroma Cloud runtime state, collection counts, and indexed document IDs.

---

### 6. `GET /admin/stats`
- **Route Function**: [`get_rag_statistics`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L202-L212)
- **Service Function**: [`get_chroma_stats`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/chroma_service.py)
- **Description**: Returns live total document count, total vector chunks, embedding model parameters, and index metadata.

---

### 7. `POST /admin/reindex/{document_id}`
- **Route Function**: [`reindex_document_endpoint`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L215-L227)
- **Service Function**: [`delete_document_vectors`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/chroma_service.py)
- **URL Parameters**: `document_id` (string)
- **Description**: Purges vector embeddings for a specific `document_id` to prepare it for re-indexing.

---

### 8. `DELETE /admin/documents/{document_id}`
- **Route Function**: [`delete_document_vectors_endpoint`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L230-L240)
- **Service Function**: [`delete_document_vectors`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/chroma_service.py)
- **URL Parameters**: `document_id` (string)
- **Description**: Deletes vector embeddings associated with `document_id` from Chroma Cloud.

---

### 9. `POST /admin/rebuild-index`
- **Route Function**: [`rebuild_vector_store_endpoint`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/routes/document_routes.py#L243-L253)
- **Service Function**: [`rebuild_vector_store`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/rag-service/services/chroma_service.py)
- **Description**: Completely resets and recreates the `documents` collection in Chroma Cloud.
