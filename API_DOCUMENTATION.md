# AI Learning Companion (Jarvis) --- API Documentation

## 1. Overview

The AI Learning Companion (Jarvis) exposes two cooperating API services:

-   **Node.js Express Backend** --- authentication, users, admin
    operations, conversations, messages, and document metadata.
-   **Python FastAPI RAG Service** --- PDF ingestion, text extraction,
    chunking, embeddings, vector search, and RAG answer generation.

### Base URLs

-   Express Backend: `http://localhost:5000/api`
-   FastAPI RAG Service: `http://localhost:8000`

## 2. Architecture

``` text
React Frontend (Vite)
        |
        | HTTP / REST / HttpOnly Cookie
        v
Node.js Express Backend
        |
        | MongoDB
        | Axios HTTP calls
        v
Python FastAPI RAG Service
        |
        | Chroma Cloud
        v
Chroma Cloud
Collection: documents
```

The RAG service uses **PyMuPDF** for PDF text extraction,
**BAAI/bge-small-en-v1.5** for embeddings, and **OpenRouter** for LLM
inference. Chroma Cloud is the vector database.

## 3. Authentication and Security

### JWT Authentication

Authenticated requests are protected by `authenticateUser`.

The backend accepts JWT authentication through:

-   `token` HttpOnly cookie
-   `Authorization: Bearer <token>` header

The authenticated MongoDB user is attached to `req.user`.

### Admin Authorization

Admin-only routes use `authorizeAdmin`.

The middleware requires:

``` text
req.user.role === "Admin"
```

Unauthorized users receive `403 Forbidden`.

### User Isolation

Document and RAG operations use `user_id` metadata to isolate users'
vector data. Chroma Cloud queries are filtered by the authenticated
user's identifier.

## 4. Standard Error Format

### Express

``` json
{
  "success": false,
  "message": "Error description"
}
```

### FastAPI

``` json
{
  "detail": "FastAPI exception description"
}
```

------------------------------------------------------------------------

# 5. Authentication API

## POST `/api/auth/register`

Registers a new Student account.

**Authentication:** Public

### Request

``` json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecretPassword123"
}
```

### Response --- 201 Created

``` json
{
  "success": true,
  "message": "Student account registered successfully. Please log in.",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Student",
    "isActive": true
  }
}
```

## POST `/api/auth/login`

Validates credentials, updates `lastLogin`, and creates the JWT
authentication cookie.

**Authentication:** Public

### Request

``` json
{
  "email": "john@example.com",
  "password": "SecretPassword123"
}
```

### Response --- 200 OK

``` json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Student",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## POST `/api/auth/logout`

Clears the authentication cookie.

**Authentication:** Public

### Response --- 200 OK

``` json
{
  "success": true,
  "message": "Logged out successfully"
}
```

------------------------------------------------------------------------

# 6. User and Profile API

## GET `/api/users/me`

Returns the currently authenticated user's profile.

**Authentication:** Required

### Response

``` json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Student",
    "avatar": "/uploads/avatars/avatar-1692000000.png"
  }
}
```

## PATCH `/api/users/me`

Updates the current user's profile.

**Authentication:** Required

### Request

``` json
{
  "firstName": "Johnny",
  "lastName": "Doe"
}
```

## PATCH `/api/users/me/avatar`

Uploads and updates the user's profile picture.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Field:** `avatar`

**File limits:** JPG, PNG, WEBP; maximum 2 MB.

## GET `/api/users`

Returns registered Student accounts and document counts.

**Authentication:** Admin

### Query Parameters

  Parameter   Required   Description
  ----------- ---------- --------------------------------
  `search`    No         Searches student name or email

### Response

``` json
{
  "success": true,
  "count": 1,
  "users": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "Student",
      "isActive": true,
      "documentsUploaded": 3
    }
  ]
}
```

## GET `/api/users/:id`

Returns detailed student information, documents, and AI usage
statistics.

**Authentication:** Admin

**Path Parameter:** `id` --- MongoDB User ObjectId.

### AI Usage

The response may include:

-   `totalConversations`
-   `totalMessages`
-   `lastAiActivity`
-   `avgMessagesPerConversation`

## PATCH `/api/users/:id/status`

Enables or disables a Student account.

**Authentication:** Admin

### Request

``` json
{
  "isActive": false
}
```

Admin accounts cannot be disabled.

------------------------------------------------------------------------

# 7. Admin API

All endpoints in this section require **Admin authentication**.

## GET `/api/admin/dashboard`

Returns dashboard KPIs:

-   `totalStudents`
-   `totalDocuments`
-   `activeStudents`
-   `newStudents`

## GET `/api/admin/recent-activity`

Returns recent registration, document upload, and chat activity.

## GET `/api/admin/activity`

Provides the activity endpoint alias.

## GET `/api/admin/documents`

Returns uploaded documents.

### Query Parameters

  Parameter   Required   Description
  ----------- ---------- -----------------------------------
  `search`    No         Searches document name or student

## DELETE `/api/admin/documents/:id`

Deletes:

1.  Physical PDF file
2.  Chroma Cloud vector embeddings
3.  MongoDB document metadata

**Path Parameter:** `id` --- document identifier.

## GET `/api/admin/chats`

Returns student conversations.

### Query Parameters

  Parameter   Required   Values
  ----------- ---------- -------------------------------------------
  `search`    No         Search conversations
  `filter`    No         `today`, `last7days`, `last30days`, `all`

## GET `/api/admin/chats/:conversationId`

Returns a specific conversation and its messages.

## DELETE `/api/admin/chats/:conversationId`

Deletes a conversation.

## GET `/api/admin/analytics`

Returns analytics generated from MongoDB aggregations, including:

-   registrations
-   document uploads
-   daily AI chats
-   seven-day activity timeline
-   top active students

## GET `/api/admin/rag/stats`

Returns RAG and Chroma Cloud statistics.

## GET `/api/admin/rag/debug`

Returns Chroma Cloud diagnostic information.

## POST `/api/admin/rag/reindex/:documentId`

Reindexes a document's vector data.

**Path Parameter:** `documentId`

## DELETE `/api/admin/rag/documents/:documentId`

Deletes a document's vectors from Chroma Cloud.

## POST `/api/admin/rag/rebuild`

Rebuilds the vector store.

------------------------------------------------------------------------

# 8. Chat and Conversation API

## POST `/api/chat/conversations`

Creates a new conversation.

**Authentication:** Required

### Request

``` json
{
  "title": "DevOps Concepts"
}
```

## GET `/api/chat/conversations`

Returns conversations belonging to the authenticated user.

**Authentication:** Required

## GET `/api/chat/conversations/:id`

Returns a specific conversation.

**Authentication:** Required

## PATCH `/api/chat/conversations/:id`

Updates a conversation title.

**Authentication:** Required

### Request

``` json
{
  "title": "Updated Chat Title"
}
```

## DELETE `/api/chat/conversations/:id`

Deletes a conversation.

**Authentication:** Required

## GET `/api/chat/messages/:conversationId`

Returns messages for a conversation.

**Authentication:** Required

## POST `/api/chat/messages`

Sends a student message through the AI/RAG pipeline.

**Authentication:** Required

## POST `/api/chat`

Provides the chat endpoint alias for sending a message.

### Request

``` json
{
  "message": "What is Docker containerization?",
  "conversationId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "documentId": "64f1a2b3c4d5e6f7a8b9c0d3"
}
```

### Processing Flow

``` text
Student prompt
    |
    v
Save user message in MongoDB
    |
    v
Call FastAPI RAG service
    |
    v
Retrieve relevant document chunks
    |
    v
Generate grounded answer
    |
    v
Save answer and citations
    |
    v
Return response to frontend
```

------------------------------------------------------------------------

# 9. Document API

## GET `/api/documents`

Returns documents belonging to the authenticated user.

**Authentication:** Required

## POST `/api/documents/upload`

Uploads a PDF and starts the RAG indexing process.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

### Upload Field

`file`

**File type:** PDF

**Maximum size:** 20 MB at the Express upload layer.

### Processing Flow

``` text
PDF upload
   |
   v
Store metadata in MongoDB
   |
   v
Forward PDF to FastAPI
   |
   v
PyMuPDF text extraction
   |
   v
Document chunking
   |
   v
Embedding generation
   |
   v
Store vectors in Chroma Cloud
```

## POST `/api/documents/query`

Queries the RAG service for relevant document content.

**Authentication:** Required

### Request

``` json
{
  "query": "Explain Kubernetes pods",
  "top_k": 5
}
```

## GET `/api/documents/:id/view`

Streams the PDF inline.

**Authentication:** Required

**Response Content-Type:** `application/pdf`

## GET `/api/documents/:id/download`

Downloads the PDF.

**Authentication:** Required

## DELETE `/api/documents/:id`

Deletes the authenticated user's document and associated document data.

**Authentication:** Required

------------------------------------------------------------------------

# 10. FastAPI RAG Service API

Base URL:

`http://localhost:8000`

## GET `/health`

Returns RAG service and Chroma Cloud status.

**Authentication:** Public

### Response

``` json
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

## POST `/upload`

Processes and indexes a PDF.

**Authentication:** Backend internal/restricted.

### Form Data

  Field           Required   Description
  --------------- ---------- ----------------------------------
  `file`          Yes        PDF upload, maximum 50 MB
  `document_id`   No         MongoDB document ObjectId
  `user_id`       Yes        User ObjectId used for isolation

### Processing

1.  Read PDF bytes.
2.  Extract text with PyMuPDF.
3.  Split content into chunks with page information.
4.  Generate embeddings with `BAAI/bge-small-en-v1.5`.
5.  Store vectors and metadata in Chroma Cloud.

### Response

``` json
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

## POST `/search`

Performs semantic vector search in Chroma Cloud.

### Request

``` json
{
  "query": "What is Kubernetes horizontal pod autoscaling?",
  "user_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "top_k": 5
}
```

### Response

``` json
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

## POST `/query`

Runs the complete RAG question-answering pipeline.

### Request

``` json
{
  "query": "How do I configure horizontal pod autoscaling?",
  "user_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "top_k": 5,
  "mode": "hybrid",
  "similarity_threshold": 0.75
}
```

### Response

``` json
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

## GET `/debug/chroma`

Returns Chroma Cloud diagnostic information including collection state,
counts, and indexed document IDs.

## GET `/admin/stats`

Returns live vector statistics, document counts, embedding
configuration, and index metadata.

## POST `/admin/reindex/{document_id}`

Removes the selected document's vectors to prepare for re-indexing.

**Path Parameter:** `document_id`

## DELETE `/admin/documents/{document_id}`

Deletes all vectors associated with a document from Chroma Cloud.

**Path Parameter:** `document_id`

## POST `/admin/rebuild-index`

Clears and recreates the `documents` Chroma Cloud collection.

**Warning:** This is a destructive administrative operation.

------------------------------------------------------------------------

# 11. API Endpoint Summary

## Express Backend

  Method   Endpoint                                 Access
  -------- ---------------------------------------- --------
  POST     `/api/auth/register`                     Public
  POST     `/api/auth/login`                        Public
  POST     `/api/auth/logout`                       Public
  GET      `/api/users/me`                          User
  PATCH    `/api/users/me`                          User
  PATCH    `/api/users/me/avatar`                   User
  GET      `/api/users`                             Admin
  GET      `/api/users/:id`                         Admin
  PATCH    `/api/users/:id/status`                  Admin
  GET      `/api/admin/dashboard`                   Admin
  GET      `/api/admin/recent-activity`             Admin
  GET      `/api/admin/activity`                    Admin
  GET      `/api/admin/documents`                   Admin
  DELETE   `/api/admin/documents/:id`               Admin
  GET      `/api/admin/chats`                       Admin
  GET      `/api/admin/chats/:conversationId`       Admin
  DELETE   `/api/admin/chats/:conversationId`       Admin
  GET      `/api/admin/analytics`                   Admin
  GET      `/api/admin/rag/stats`                   Admin
  GET      `/api/admin/rag/debug`                   Admin
  POST     `/api/admin/rag/reindex/:documentId`     Admin
  DELETE   `/api/admin/rag/documents/:documentId`   Admin
  POST     `/api/admin/rag/rebuild`                 Admin
  POST     `/api/chat/conversations`                User
  GET      `/api/chat/conversations`                User
  GET      `/api/chat/conversations/:id`            User
  PATCH    `/api/chat/conversations/:id`            User
  DELETE   `/api/chat/conversations/:id`            User
  GET      `/api/chat/messages/:conversationId`     User
  POST     `/api/chat/messages`                     User
  POST     `/api/chat`                              User
  GET      `/api/documents`                         User
  POST     `/api/documents/upload`                  User
  POST     `/api/documents/query`                   User
  GET      `/api/documents/:id/view`                User
  GET      `/api/documents/:id/download`            User
  DELETE   `/api/documents/:id`                     User

## FastAPI RAG Service

  Method   Endpoint                           Access
  -------- ---------------------------------- ----------------
  GET      `/health`                          Public
  POST     `/upload`                          Internal
  POST     `/search`                          Internal
  POST     `/query`                           Internal
  GET      `/debug/chroma`                    Diagnostic
  GET      `/admin/stats`                     Admin/Internal
  POST     `/admin/reindex/{document_id}`     Admin/Internal
  DELETE   `/admin/documents/{document_id}`   Admin/Internal
  POST     `/admin/rebuild-index`             Admin/Internal

------------------------------------------------------------------------

# 12. Core Technology Configuration

``` text
Backend:        Node.js + Express
Database:       MongoDB
Authentication: JWT + HttpOnly Cookie
RAG Service:    Python + FastAPI
PDF Parsing:    PyMuPDF
Embeddings:     BAAI/bge-small-en-v1.5
Vector DB:      Chroma Cloud
LLM Provider:   OpenRouter
LLM Model:      openrouter/free
Frontend:       React + Vite
```

## Environment Configuration

``` env
CHROMA_API_KEY=your_chroma_cloud_api_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=ai-learning-companion

RAG_PORT=8000
UPLOAD_DIR=backend/uploads/documents
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/free
```

## 13. Health Checks

### Express

``` text
GET http://localhost:5000/api/health
```

Expected response:

``` json
{
  "success": true,
  "message": "Jarvis backend server is running"
}
```

### FastAPI

``` text
GET http://localhost:8000/health
```

The response reports the active Chroma Cloud configuration and AI/RAG
settings.

## 14. Important Implementation Notes

-   Express accepts PDF uploads up to 20 MB at its upload middleware
    layer.
-   FastAPI accepts PDF streams up to 50 MB.
-   Uploaded PDFs are centrally stored under
    `backend/uploads/documents/`.
-   User avatars are stored under `backend/uploads/avatars/`.
-   The RAG service uses Chroma Cloud rather than a local persistent
    vector database.
-   Document metadata is stored in MongoDB while document chunks and
    embeddings are stored in Chroma Cloud.
-   `user_id` and `document_id` metadata are used to maintain
    document-level and user-level isolation.
-   The complete chat pipeline combines MongoDB conversation storage,
    Chroma Cloud retrieval, and OpenRouter-based answer generation.
