# Node.js Express Backend — API & Function Specifications

Base URL: `http://localhost:5000/api`

---

## 🔑 1. Authentication Module (`/api/auth`)

Mounted File: [`backend/src/modules/auth/auth.routes.js`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/auth/auth.routes.js)

### `POST /api/auth/register`
- **Controller Function**: [`register`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/auth/auth.controller.js#L14-L23)
- **Service Function**: [`registerStudent`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/auth.service.js#L27-L51)
- **Authentication**: Public
- **Description**: Registers a new Student account. Always sets `role: "Student"`.
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecretPassword123"
  }
  ```
- **Response** (`201 Created`):
  ```json
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

---

### `POST /api/auth/login`
- **Controller Function**: [`login`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/auth/auth.controller.js#L29-L42)
- **Service Functions**: [`loginUser`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/auth.service.js#L56-L90), [`generateToken`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/auth.service.js#L10-L12), [`getCookieOptions`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/auth.service.js#L17-L22)
- **Authentication**: Public
- **Description**: Validates email/password credentials, updates `lastLogin` timestamp, and sets an `HttpOnly` JWT cookie (`token`).
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecretPassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
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

---

### `POST /api/auth/logout`
- **Controller Function**: [`logout`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/auth/auth.controller.js#L48-L54)
- **Service Function**: [`getCookieOptions`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/auth.service.js#L17-L22)
- **Authentication**: Public
- **Description**: Clears the `token` cookie.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 👤 2. User & Profile Management Module (`/api/users`)

Mounted File: [`backend/src/modules/users/user.routes.js`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/users/user.routes.js)

### `GET /api/users/me`
- **Controller Function**: [`getMe`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/users/user.controller.js#L13-L19)
- **Authentication**: Required (`authenticateUser`)
- **Description**: Retrieves current authenticated user profile details.
- **Response** (`200 OK`):
  ```json
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

---

### `PATCH /api/users/me`
- **Controller Function**: [`updateMe`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/users/user.controller.js#L25-L34)
- **Service Function**: [`updateProfile`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/auth.service.js#L108-L122)
- **Authentication**: Required (`authenticateUser`)
- **Description**: Updates profile details (`firstName`, `lastName`, `avatar` URL string).
- **Request Body**:
  ```json
  {
    "firstName": "Johnny",
    "lastName": "Doe"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": { ... }
  }
  ```

---

### `PATCH /api/users/me/avatar`
- **Controller Function**: [`updateAvatar`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/users/user.controller.js#L40-L54)
- **Service Function**: [`updateProfile`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/auth.service.js#L108-L122)
- **Middleware**: `avatarUpload.single('avatar')` (Multer: Max 2MB, JPG/PNG/WEBP)
- **Authentication**: Required (`authenticateUser`)
- **Description**: Uploads avatar image file and updates profile picture path.
- **Form Data**: `avatar` (File)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Profile picture updated successfully",
    "user": { ... }
  }
  ```

---

### `GET /api/users`
- **Controller Function**: [`getUsers`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/users/user.controller.js#L60-L68)
- **Service Function**: [`getAllUsersService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/user.service.js#L10-L34)
- **Authentication**: Admin Required (`authenticateUser`, `authorizeAdmin`)
- **Query Parameters**: `search` (Optional name/email query string)
- **Description**: Retrieves all registered Student accounts and their uploaded document counts. Excludes Admin accounts.
- **Response** (`200 OK`):
  ```json
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

---

### `GET /api/users/:id`
- **Controller Function**: [`getUserById`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/users/user.controller.js#L74-L80)
- **Service Function**: [`getUserByIdService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/user.service.js#L40-L75)
- **Authentication**: Admin Required (`authenticateUser`, `authorizeAdmin`)
- **URL Parameters**: `id` (User ObjectId)
- **Description**: Fetches detailed information for a single student including uploaded documents and AI usage metrics (`totalConversations`, `totalMessages`, `avgMessagesPerConversation`).
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "documentsUploaded": 2,
      "documents": [...],
      "aiUsage": {
        "totalConversations": 4,
        "totalMessages": 28,
        "lastAiActivity": "2026-08-12T14:30:00.000Z",
        "avgMessagesPerConversation": 7.0
      }
    }
  }
  ```

---

### `PATCH /api/users/:id/status`
- **Controller Function**: [`toggleUserStatus`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/users/user.controller.js#L86-L94)
- **Service Function**: [`toggleUserStatusService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/user.service.js#L80-L98)
- **Authentication**: Admin Required (`authenticateUser`, `authorizeAdmin`)
- **URL Parameters**: `id` (User ObjectId)
- **Request Body**: `{ "isActive": false }`
- **Description**: Enables or disables a student user account. Admin accounts cannot be disabled.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Student account disabled successfully",
    "user": { ... }
  }
  ```

---

## ⚙️ 3. Admin Operations & Analytics Module (`/api/admin`)

Mounted File: [`backend/src/modules/admin/admin.routes.js`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.routes.js)

### `GET /api/admin/dashboard`
- **Controller Function**: [`getDashboardStats`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L13-L16)
- **Service Function**: [`getDashboardStatsService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L11-L28)
- **Authentication**: Admin Required
- **Description**: Returns dashboard KPI metrics (`totalStudents`, `totalDocuments`, `activeStudents`, `newStudents`).

---

### `GET /api/admin/recent-activity` & `GET /api/admin/activity`
- **Controller Function**: [`getRecentActivity`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L18-L21)
- **Service Function**: [`getRecentActivityService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L33-L91)
- **Authentication**: Admin Required
- **Description**: Aggregates registration, document upload, and chat activity streams (newest first).

---

### `GET /api/admin/documents`
- **Controller Function**: [`getAdminDocuments`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L23-L27)
- **Service Function**: [`getAdminDocumentsService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L96-L113)
- **Authentication**: Admin Required
- **Query Parameters**: `search` (Optional document name or student search)

---

### `DELETE /api/admin/documents/:id`
- **Controller Function**: [`deleteAdminDocument`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L29-L32)
- **Service Function**: [`deleteAdminDocumentService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L118-L145)
- **Authentication**: Admin Required
- **Description**: Deletes physical PDF file from disk, vector embeddings from Chroma Cloud, and MongoDB metadata.

---

### `GET /api/admin/chats`
- **Controller Function**: [`getAdminChats`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L34-L38)
- **Service Function**: [`getAdminChatsService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L150-L193)
- **Authentication**: Admin Required
- **Query Parameters**: `search`, `filter` (`today`, `last7days`, `last30days`, `all`)

---

### `GET /api/admin/chats/:conversationId`
- **Controller Function**: [`getAdminChatById`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L40-L43)
- **Service Function**: [`getAdminChatByIdService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L198-L214)
- **Authentication**: Admin Required

---

### `DELETE /api/admin/chats/:conversationId`
- **Controller Function**: [`deleteAdminChat`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L45-L48)
- **Service Function**: [`deleteAdminChatService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L219-L229)
- **Authentication**: Admin Required

---

### `GET /api/admin/analytics`
- **Controller Function**: [`getAdminAnalytics`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L50-L53)
- **Service Function**: [`getAdminAnalyticsService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/admin.service.js#L234-L362)
- **Authentication**: Admin Required
- **Description**: Returns MongoDB aggregations for registrations, uploads, AI chats per day (7-day timeline), and top active students.

---

### `GET /api/admin/rag/stats`
- **Controller Function**: [`getAdminRagStats`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L66-L72)
- **Service Function**: [`getRagStatsService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/ragClient.service.js#L122-L143)
- **Authentication**: Admin Required

---

### `GET /api/admin/rag/debug`
- **Controller Function**: [`getAdminRagDebugInfo`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L74-L80)
- **Service Function**: [`getRagDebugInfoService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/ragClient.service.js#L108-L117)
- **Authentication**: Admin Required

---

### `POST /api/admin/rag/reindex/:documentId`
- **Controller Function**: [`reindexAdminDocument`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L82-L89)
- **Service Function**: [`reindexDocumentRagService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/ragClient.service.js#L148-L157)
- **Authentication**: Admin Required

---

### `DELETE /api/admin/rag/documents/:documentId`
- **Controller Function**: [`deleteAdminDocumentVectors`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L91-L98)
- **Service Function**: [`deleteDocumentVectorsRagService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/ragClient.service.js#L162-L171)
- **Authentication**: Admin Required

---

### `POST /api/admin/rag/rebuild`
- **Controller Function**: [`rebuildAdminVectorStore`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/admin/admin.controller.js#L100-L106)
- **Service Function**: [`rebuildVectorStoreRagService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/ragClient.service.js#L176-L185)
- **Authentication**: Admin Required

---

## 💬 4. AI Chat & Conversation Module (`/api/chat`)

Mounted File: [`backend/src/modules/chat/chat.routes.js`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.routes.js)

### `POST /api/chat/conversations`
- **Controller Function**: [`createConversationHandler`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.controller.js#L20-L28)
- **Service Function**: [`createConversationService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/conversation.service.js#L10-L15)
- **Authentication**: Required (`authenticateUser`)
- **Request Body**: `{ "title": "DevOps Concepts" }`

---

### `GET /api/chat/conversations`
- **Controller Function**: [`getConversationsHandler`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.controller.js#L34-L42)
- **Service Function**: [`getUserConversationsService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/conversation.service.js#L20-L22)
- **Authentication**: Required (`authenticateUser`)

---

### `GET /api/chat/conversations/:id`
- **Controller Function**: [`getConversationByIdHandler`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.controller.js#L48-L59)
- **Service Function**: [`getConversationByIdService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/conversation.service.js#L27-L35)
- **Authentication**: Required (`authenticateUser`)

---

### `PATCH /api/chat/conversations/:id`
- **Controller Function**: [`updateConversationTitleHandler`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.controller.js#L97-L112)
- **Service Function**: [`updateConversationTitleService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/conversation.service.js#L47-L57)
- **Authentication**: Required (`authenticateUser`)
- **Request Body**: `{ "title": "Updated Chat Title" }`

---

### `DELETE /api/chat/conversations/:id`
- **Controller Function**: [`deleteConversationHandler`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.controller.js#L82-L91)
- **Service Function**: [`deleteConversationService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/conversation.service.js#L40-L42)
- **Authentication**: Required (`authenticateUser`)

---

### `GET /api/chat/messages/:conversationId`
- **Controller Function**: [`getMessagesHandler`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.controller.js#L65-L74)
- **Service Function**: [`getMessagesByConversationService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/message.service.js#L10-L15)
- **Authentication**: Required (`authenticateUser`)

---

### `POST /api/chat/messages` & `POST /api/chat`
- **Controller Function**: [`sendMessage`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/chat/chat.controller.js#L120-L177)
- **Service & Pipeline Functions**: [`saveMessageService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/message.service.js#L20-L31), [`processChat`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/ai/services/chat.service.js)
- **Authentication**: Required (`authenticateUser`)
- **Description**: Accepts student prompt, saves user message, invokes Python FastAPI RAG pipeline, records citations and answer in MongoDB, and returns response.
- **Request Body**:
  ```json
  {
    "message": "What is Docker containerization?",
    "conversationId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "documentId": "64f1a2b3c4d5e6f7a8b9c0d3"
  }
  ```

---

## 📄 5. Document Processing Module (`/api/documents`)

Mounted File: [`backend/src/modules/documents/routes.js`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/routes.js)

### `GET /api/documents`
- **Controller Function**: [`getDocumentsController`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/controller.js#L49-L56)
- **Service Function**: [`getAllDocumentsService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/service.js#L64-L69)
- **Authentication**: Required (`authenticateUser`)

---

### `POST /api/documents/upload`
- **Controller Function**: [`uploadDocumentController`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/controller.js#L17-L43)
- **Service Functions**: [`registerDocument`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/service.js#L12-L59), [`forwardDocumentToRagService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/ragClient.service.js#L16-L61)
- **Middleware**: `upload.single('file')` (Multer: PDF files only, Max 20MB)
- **Authentication**: Required (`authenticateUser`)
- **Description**: Saves file metadata in MongoDB and streams the file to Python FastAPI `/upload` endpoint for PyMuPDF parsing and Chroma Cloud indexing.

---

### `POST /api/documents/query`
- **Controller Function**: [`queryDocumentController`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/controller.js#L63-L86)
- **Service Function**: [`queryRagService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/services/ragClient.service.js#L70-L103)
- **Authentication**: Required (`authenticateUser`)
- **Request Body**:
  ```json
  {
    "query": "Explain Kubernetes pods",
    "top_k": 5
  }
  ```

---

### `GET /api/documents/:id/view`
- **Controller Function**: [`viewDocumentController`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/controller.js#L106-L116)
- **Service Function**: [`getDocumentByIdService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/service.js#L124-L137)
- **Authentication**: Required (`authenticateUser`)
- **Description**: Streams the PDF file inline (`Content-Type: application/pdf`).

---

### `GET /api/documents/:id/download`
- **Controller Function**: [`downloadDocumentController`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/controller.js#L122-L127)
- **Service Function**: [`getDocumentByIdService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/service.js#L124-L137)
- **Authentication**: Required (`authenticateUser`)
- **Description**: Triggers a file download dialog in the browser.

---

### `DELETE /api/documents/:id`
- **Controller Function**: [`deleteDocumentController`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/controller.js#L92-L100)
- **Service Function**: [`deleteDocumentService`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/modules/documents/service.js#L90-L117)
- **Authentication**: Required (`authenticateUser`)

---

## 🩺 6. System Health check (`/api/health`)

### `GET /api/health`
- **Inline Handler**: [`app.js`](file:///e:/projects/DMV%20core%20tech/ai-learning-companion/backend/src/app.js#L50-L55)
- **Authentication**: Public
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Jarvis backend server is running"
  }
  ```
