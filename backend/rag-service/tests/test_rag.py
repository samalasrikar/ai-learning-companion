"""
Tests for Retrieval-Augmented Generation (RAG):
  - construct_rag_prompt (context formatting)
  - generate_rag_answer (hybrid, strict_rag, general_only, similarity threshold, source citation)
  - document_routes (FastAPI /documents/rag, /documents/query, and /documents/answer endpoints)
"""

import os
import sys
import pytest
from unittest.mock import patch

# Ensure the rag-service root is on sys.path so `services.*` imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import fitz  # PyMuPDF
from fastapi.testclient import TestClient

from services.chroma_service import (
    init_chroma_db,
    store_document_chunks,
)
from services.embedding_service import generate_embeddings
from services.rag_service import (
    construct_rag_prompt,
    generate_rag_answer,
    NOT_FOUND_RESPONSE,
    RAG_SYSTEM_PROMPT,
    STRICT_RAG_SYSTEM_PROMPT,
    GENERAL_SYSTEM_PROMPT,
)


def _make_pdf_bytes(text: str = "Hello, world!", num_pages: int = 1) -> bytes:
    doc = fitz.open()
    for i in range(num_pages):
        page = doc.new_page()
        page.insert_text((72, 72), f"{text} (page {i + 1})")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def _fresh_chroma_fixture(tmp_path, monkeypatch):
    """Helper to set up isolated ChromaDB + upload dir per test."""
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


def _seed_document(
    document_id: str,
    user_id: str,
    filename: str,
    texts: list[str],
):
    """Helper to populate ChromaDB with test chunks."""
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
    store_document_chunks(
        chunks=chunks,
        embeddings=embeddings,
        document_id=document_id,
        user_id=user_id,
        filename=filename,
    )


# ──────────────────────────────────────────────
# 1. Prompt Construction Tests
# ──────────────────────────────────────────────
class TestConstructRagPrompt:
    def test_prompt_formatting(self):
        chunks = [
            {
                "text": "Photosynthesis is the process by which green plants make food.",
                "metadata": {
                    "filename": "biology.pdf",
                    "page_number": 5,
                    "document_id": "bio-101",
                },
            },
            {
                "text": "Chlorophyll absorbs light energy from the sun.",
                "metadata": {
                    "filename": "biology.pdf",
                    "page_number": 6,
                    "document_id": "bio-101",
                },
            },
        ]
        query = "What is photosynthesis?"
        prompt = construct_rag_prompt(query, chunks)

        assert "Context from uploaded documents:" in prompt
        assert "[Source 1: biology.pdf, Page 5, Doc ID: bio-101]" in prompt
        assert "Photosynthesis is the process" in prompt
        assert "[Source 2: biology.pdf, Page 6, Doc ID: bio-101]" in prompt
        assert "Chlorophyll absorbs light" in prompt
        assert "Question: What is photosynthesis?" in prompt


# ──────────────────────────────────────────────
# 2. RAG Generation Service Tests (Hybrid, Strict RAG, General AI)
# ──────────────────────────────────────────────
class TestGenerateRagAnswer:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path, monkeypatch):
        _fresh_chroma_fixture(tmp_path, monkeypatch)
        yield
        _teardown_chroma()

    def test_no_documents_hybrid_falls_back_to_general_ai(self):
        mock_gen_answer = "Quantum computing relies on qubits to perform complex calculations."
        with patch("services.rag_service.call_llm", return_value=mock_gen_answer):
            result = generate_rag_answer(
                query="What is quantum computing?",
                user_id="user-empty",
                mode="hybrid",
            )
            assert result["status"] == "success"
            assert result["mode"] == "general"
            assert "General AI" in result["answer"] or "couldn't find" in result["answer"] or mock_gen_answer in result["answer"]
            assert result["sources"] == []
            assert result["retrieved_chunks_count"] == 0

    def test_no_documents_strict_rag_returns_not_found(self):
        result = generate_rag_answer(
            query="What is quantum computing?",
            user_id="user-empty",
            mode="strict_rag",
        )
        assert result["status"] == "success"
        assert result["mode"] == "rag"
        assert result["answer"] == NOT_FOUND_RESPONSE
        assert result["sources"] == []

    def test_general_only_mode(self):
        mock_gen_answer = "Software engineering involves designing and maintaining applications."
        with patch("services.rag_service.call_llm", return_value=mock_gen_answer):
            result = generate_rag_answer(
                query="Define software engineering",
                user_id="user-gen",
                mode="general_only",
            )
            assert result["status"] == "success"
            assert result["mode"] == "general"
            assert result["answer"] == mock_gen_answer
            assert result["sources"] == []

    def test_rag_with_matching_documents(self):
        _seed_document(
            document_id="doc-ml",
            user_id="user-rag-1",
            filename="ml_intro.pdf",
            texts=[
                "Supervised learning trains models using labeled input and target output pairs.",
                "Unsupervised learning finds hidden patterns in unlabeled data.",
            ],
        )

        mock_answer = "Supervised learning trains models using labeled input and target output pairs."
        with patch("services.rag_service.call_llm", return_value=mock_answer) as mock_llm:
            result = generate_rag_answer(
                query="How does supervised learning work?",
                user_id="user-rag-1",
                top_k=3,
                mode="hybrid",
                similarity_threshold=0.1,  # Low threshold to ensure test match
            )

            assert result["status"] == "success"
            assert result["mode"] == "rag"
            assert result["answer"] == mock_answer
            assert result["retrieved_chunks_count"] > 0
            assert len(result["sources"]) > 0

            # Verify sources metadata payload
            first_source = result["sources"][0]
            assert first_source["filename"] == "ml_intro.pdf"
            assert "page_number" in first_source
            assert first_source["document_id"] == "doc-ml"
            assert "chunk_id" in first_source
            assert "similarity_score" in first_source

            # Verify LLM was called with constructed prompt
            assert mock_llm.called
            system_arg, user_arg = mock_llm.call_args[0]
            assert system_arg == RAG_SYSTEM_PROMPT
            assert "Supervised learning trains models" in user_arg

    def test_empty_inputs_return_error(self):
        res1 = generate_rag_answer("", "user-1")
        assert res1["status"] == "error"
        assert res1["answer"] == NOT_FOUND_RESPONSE

        res2 = generate_rag_answer("valid query", "")
        assert res2["status"] == "error"
        assert res2["answer"] == NOT_FOUND_RESPONSE


# ──────────────────────────────────────────────
# 3. FastAPI Route Tests (/documents/rag & /documents/answer)
# ──────────────────────────────────────────────
def _create_test_app():
    from fastapi import FastAPI
    from routes.document_routes import router
    app = FastAPI()
    app.include_router(router)
    return app


class TestRagRoutes:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path, monkeypatch):
        _fresh_chroma_fixture(tmp_path, monkeypatch)
        self.client = TestClient(_create_test_app())
        yield
        _teardown_chroma()

    def test_rag_endpoint_success(self):
        _seed_document(
            document_id="route-rag-doc",
            user_id="route-rag-user",
            filename="chemistry.pdf",
            texts=["Water molecules consist of two hydrogen atoms and one oxygen atom."],
        )

        mock_llm_ans = "Water molecules consist of two hydrogen atoms and one oxygen atom."
        with patch("services.rag_service.call_llm", return_value=mock_llm_ans):
            response = self.client.post(
                "/documents/rag",
                json={
                    "query": "What is the chemical composition of water?",
                    "user_id": "route-rag-user",
                    "top_k": 3,
                    "mode": "hybrid",
                    "similarity_threshold": 0.1,
                },
            )
            assert response.status_code == 200
            body = response.json()
            assert body["status"] == "success"
            assert body["mode"] == "rag"
            assert body["query"] == "What is the chemical composition of water?"
            assert body["user_id"] == "route-rag-user"
            assert body["answer"] == mock_llm_ans
            assert len(body["sources"]) == 1
            assert body["sources"][0]["filename"] == "chemistry.pdf"
            assert body["sources"][0]["document_id"] == "route-rag-doc"

    def test_answer_alias_endpoint(self):
        """/documents/answer should work identically to /documents/rag."""
        _seed_document(
            document_id="alias-rag-doc",
            user_id="alias-rag-user",
            filename="history.pdf",
            texts=["The Declaration of Independence was signed in 1776."],
        )

        mock_ans = "The Declaration of Independence was signed in 1776."
        with patch("services.rag_service.call_llm", return_value=mock_ans):
            response = self.client.post(
                "/documents/answer",
                json={
                    "query": "When was the Declaration of Independence signed?",
                    "user_id": "alias-rag-user",
                    "similarity_threshold": 0.1,
                },
            )
            assert response.status_code == 200
            body = response.json()
            assert body["status"] == "success"
            assert body["mode"] == "rag"
            assert body["answer"] == mock_ans
            assert len(body["sources"]) > 0

    def test_rag_validation_missing_query(self):
        response = self.client.post(
            "/documents/rag",
            json={"user_id": "user-1"},
        )
        assert response.status_code == 422
