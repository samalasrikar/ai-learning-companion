"""
Automated Security Audit & Isolation Tests for Multi-Tenant RAG:
  - Test 1: Student A uploads Java.pdf. Student B uploads Physics.pdf.
            Student A queries "Explain Java". Verified ONLY Student A's vectors are searched.
  - Test 2: Student B queries "Explain Java". Verified NO document context from Student A is retrieved.
  - Test 3: Attempt to send request with missing/empty/anonymous user_id.
            Verified request is rejected with HTTP 400 Bad Request.
"""

import os
import sys
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.chroma_service import (
    init_chroma_db,
    store_document_chunks,
)
from services.embedding_service import generate_embeddings
from services.rag_service import generate_rag_answer, NOT_FOUND_RESPONSE
from routes.document_routes import router
from fastapi import FastAPI


def _fresh_chroma_fixture(tmp_path, monkeypatch):
    import services.chroma_service as cs
    monkeypatch.setenv("TESTING", "true")
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "uploads"))
    cs._chroma_client = None
    cs._documents_collection = None
    client, coll = init_chroma_db()
    try:
        client.delete_collection("documents")
    except Exception:
        pass
    cs._documents_collection = None
    init_chroma_db()


def _teardown_chroma():
    import services.chroma_service as cs
    if cs._chroma_client:
        try:
            cs._chroma_client.delete_collection("documents")
        except Exception:
            pass
    cs._chroma_client = None
    cs._documents_collection = None


def _seed_user_document(
    document_id: str,
    user_id: str,
    filename: str,
    texts: list[str],
):
    chunks = [
        {
            "chunk_number": i + 1,
            "text": t,
            "metadata": {
                "filename": filename,
                "page_number": i + 1,
                "document_id": document_id,
                "user_id": user_id,
                "chunk_number": i + 1,
                "char_count": len(t),
                "token_count": len(t) // 4,
            },
        }
        for i, t in enumerate(texts)
    ]
    embeddings = generate_embeddings(texts)
    return store_document_chunks(
        chunks=chunks,
        embeddings=embeddings,
        document_id=document_id,
        user_id=user_id,
        filename=filename,
    )


def _create_test_app():
    app = FastAPI()
    app.include_router(router)
    return app


class TestMultiTenantIsolation:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path, monkeypatch):
        _fresh_chroma_fixture(tmp_path, monkeypatch)
        self.client = TestClient(_create_test_app())
        yield
        _teardown_chroma()

    def test_student_a_searches_only_student_a_documents(self):
        """Test 1: Student A uploads Java.pdf. Student B uploads Physics.pdf. Student A queries 'Explain Java'."""
        _seed_user_document(
            document_id="doc-java-student-a",
            user_id="student_A",
            filename="Java.pdf",
            texts=["Java arrays are zero-indexed data structures that hold fixed-size elements of the same type."],
        )
        _seed_user_document(
            document_id="doc-physics-student-b",
            user_id="student_B",
            filename="Physics.pdf",
            texts=["Newton's second law of motion states that force equals mass times acceleration (F = ma)."],
        )

        mock_ans = "Java arrays are zero-indexed data structures holding fixed-size elements."
        with patch("services.rag_service.call_llm", return_value=mock_ans):
            result = generate_rag_answer(
                query="Explain Java arrays",
                user_id="student_A",
                mode="hybrid",
                similarity_threshold=0.1,
            )

            assert result["status"] == "success"
            assert result["mode"] == "rag"
            assert result["user_id"] == "student_A"
            assert len(result["sources"]) == 1
            # Must ONLY contain Student A's document
            assert result["sources"][0]["filename"] == "Java.pdf"
            assert result["sources"][0]["document_id"] == "doc-java-student-a"

    def test_student_b_does_not_receive_student_a_documents(self):
        """Test 2: Student B queries 'Explain Java arrays' — must NOT retrieve Student A's Java.pdf notes."""
        _seed_user_document(
            document_id="doc-java-student-a",
            user_id="student_A",
            filename="Java.pdf",
            texts=["Java arrays are zero-indexed data structures that hold fixed-size elements of the same type."],
        )
        _seed_user_document(
            document_id="doc-physics-student-b",
            user_id="student_B",
            filename="Physics.pdf",
            texts=["Newton's second law of motion states that force equals mass times acceleration (F = ma)."],
        )

        # In Strict RAG mode with mock return of NOT_FOUND_RESPONSE
        with patch("services.rag_service.call_llm", return_value=NOT_FOUND_RESPONSE):
            result_strict = generate_rag_answer(
                query="Explain Java arrays",
                user_id="student_B",
                mode="strict_rag",
                similarity_threshold=0.1,
            )
            assert result_strict["status"] == "success"
            assert result_strict["mode"] == "rag"
            assert result_strict["answer"] == NOT_FOUND_RESPONSE
            assert result_strict["sources"] == []

        # In Hybrid mode: falls back to General AI with NO sources from Student A
        mock_gen_ans = "Java arrays store fixed-size sequential elements of identical types."
        with patch("services.rag_service.call_llm", return_value=mock_gen_ans):
            result_hybrid = generate_rag_answer(
                query="Explain Java arrays",
                user_id="student_B",
                mode="hybrid",
                similarity_threshold=0.75,
            )
            assert result_hybrid["status"] == "success"
            assert result_hybrid["mode"] == "general"
            assert result_hybrid["sources"] == []

    def test_missing_or_anonymous_user_id_rejected(self):
        """Test 3: Attempting to query or upload with missing/empty/anonymous user_id must be rejected."""
        # 1. Missing user_id in API RAG endpoint
        resp1 = self.client.post("/documents/rag", json={"query": "Explain Java", "user_id": ""})
        assert resp1.status_code in (400, 422)

        resp2 = self.client.post("/documents/rag", json={"query": "Explain Java", "user_id": "anonymous"})
        assert resp2.status_code == 400
        assert "userId is mandatory" in resp2.json()["detail"]

        # 2. Store document chunks directly without valid user_id
        with pytest.raises(ValueError, match="userId is mandatory for indexing"):
            store_document_chunks(
                chunks=[{"text": "Sample", "metadata": {"page_number": 1}}],
                embeddings=[[0.1] * 384],
                document_id="doc-invalid",
                user_id="",
                filename="test.pdf",
            )
