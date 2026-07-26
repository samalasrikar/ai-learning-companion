"""
Tests for semantic retrieval using ChromaDB & BAAI/bge-small-en-v1.5:
  - retrieval_service (query embedding, ChromaDB search, metadata & similarity scoring, user isolation)
  - document_routes (FastAPI /documents/search and /documents/query endpoints)
"""

import os
import sys
import pytest

# Ensure the rag-service root is on sys.path so `services.*` imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import fitz  # PyMuPDF
from fastapi.testclient import TestClient

from services.chroma_service import (
    init_chroma_db,
    store_document_chunks,
    get_documents_collection,
)
from services.embedding_service import generate_embeddings
from services.retrieval_service import retrieve_relevant_chunks


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
# 1. retrieval_service tests
# ──────────────────────────────────────────────
class TestRetrievalService:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path, monkeypatch):
        _fresh_chroma_fixture(tmp_path, monkeypatch)
        yield
        _teardown_chroma()

    def test_empty_query_returns_empty(self):
        assert retrieve_relevant_chunks("", "user-1") == []
        assert retrieve_relevant_chunks("   ", "user-1") == []

    def test_empty_user_id_returns_empty(self):
        assert retrieve_relevant_chunks("What is AI?", "") == []
        assert retrieve_relevant_chunks("What is AI?", "   ") == []

    def test_no_documents_returns_empty(self):
        results = retrieve_relevant_chunks("What is machine learning?", "user-empty")
        assert results == []

    def test_semantic_retrieval_returns_relevant_chunks(self):
        # Seed AI and Astronomy texts for user-1
        _seed_document(
            document_id="doc-ai",
            user_id="user-1",
            filename="ai_guide.pdf",
            texts=[
                "Artificial intelligence and machine learning allow computers to learn from data.",
                "Deep learning neural networks are inspired by biological brain architectures.",
                "Supervised learning algorithms require labeled training datasets.",
            ],
        )
        _seed_document(
            document_id="doc-space",
            user_id="user-1",
            filename="space.pdf",
            texts=[
                "The solar system consists of eight major planets orbiting the sun.",
                "Galaxies contain billions of stars, interstellar gas, and dark matter.",
            ],
        )

        results = retrieve_relevant_chunks(
            query="Tell me about neural networks and machine learning",
            user_id="user-1",
            top_k=3,
        )

        assert len(results) > 0
        assert len(results) <= 3

        # Most relevant chunk should be neural networks / AI
        top_chunk = results[0]
        assert "similarity_score" in top_chunk
        assert top_chunk["similarity_score"] > 0.0
        assert top_chunk["metadata"]["filename"] in ["ai_guide.pdf", "space.pdf"]
        assert "text" in top_chunk
        assert "chunk_id" in top_chunk

    def test_user_isolation(self):
        """User A must NOT see chunks belonging to User B."""
        _seed_document(
            document_id="doc-userA",
            user_id="user-A",
            filename="secret_a.pdf",
            texts=["User A private financial records and salary data."],
        )
        _seed_document(
            document_id="doc-userB",
            user_id="user-B",
            filename="secret_b.pdf",
            texts=["User B private medical information and health data."],
        )

        # Query as User A
        results_a = retrieve_relevant_chunks("financial records", "user-A", top_k=5)
        for r in results_a:
            assert r["metadata"]["user_id"] == "user-A"
            assert "secret_b.pdf" not in r["metadata"]["filename"]

        # Query as User B
        results_b = retrieve_relevant_chunks("financial records", "user-B", top_k=5)
        for r in results_b:
            assert r["metadata"]["user_id"] == "user-B"
            assert "secret_a.pdf" not in r["metadata"]["filename"]

    def test_top_k_limiting(self):
        texts = [f"This is chunk text number {i} about computer science." for i in range(10)]
        _seed_document(
            document_id="doc-large",
            user_id="user-limit",
            filename="cs.pdf",
            texts=texts,
        )

        results_2 = retrieve_relevant_chunks("computer science", "user-limit", top_k=2)
        assert len(results_2) == 2

        results_5 = retrieve_relevant_chunks("computer science", "user-limit", top_k=5)
        assert len(results_5) == 5

    def test_metadata_fields_present(self):
        _seed_document(
            document_id="doc-meta-check",
            user_id="user-meta",
            filename="physics.pdf",
            texts=["Quantum mechanics studies particles at subatomic scales."],
        )

        results = retrieve_relevant_chunks("quantum mechanics", "user-meta", top_k=1)
        assert len(results) == 1
        meta = results[0]["metadata"]
        assert meta["filename"] == "physics.pdf"
        assert meta["page_number"] == 1
        assert meta["document_id"] == "doc-meta-check"
        assert meta["user_id"] == "user-meta"
        assert "chunk_index" in meta
        assert "upload_date" in meta

    def test_similarity_scores_sorted_descending(self):
        _seed_document(
            document_id="doc-sorted",
            user_id="user-sort",
            filename="mixed.pdf",
            texts=[
                "Python programming language uses dynamic typing and readable syntax.",
                "Baking chocolate chip cookies requires flour, sugar, and butter.",
                "Python web frameworks include FastAPI, Django, and Flask.",
            ],
        )

        results = retrieve_relevant_chunks("Python programming language frameworks", "user-sort", top_k=3)
        scores = [r["similarity_score"] for r in results]
        assert scores == sorted(scores, reverse=True)


# ──────────────────────────────────────────────
# 2. FastAPI Route Tests (/documents/search & /documents/query)
# ──────────────────────────────────────────────
def _create_test_app():
    from fastapi import FastAPI
    from routes.document_routes import router
    app = FastAPI()
    app.include_router(router)
    return app


class TestSearchRoutes:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path, monkeypatch):
        _fresh_chroma_fixture(tmp_path, monkeypatch)
        self.client = TestClient(_create_test_app())
        yield
        _teardown_chroma()

    def test_search_endpoint_success(self):
        _seed_document(
            document_id="route-doc",
            user_id="route-user",
            filename="route.pdf",
            texts=["FastAPI is a modern high-performance web framework for building APIs."],
        )

        response = self.client.post(
            "/documents/search",
            json={"query": "FastAPI framework", "user_id": "route-user", "top_k": 3},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["query"] == "FastAPI framework"
        assert body["user_id"] == "route-user"
        assert body["total_results"] == 1
        assert len(body["results"]) == 1

        first_res = body["results"][0]
        assert "chunk_id" in first_res
        assert "text" in first_res
        assert "similarity_score" in first_res
        assert first_res["metadata"]["filename"] == "route.pdf"
        assert first_res["metadata"]["document_id"] == "route-doc"

    def test_query_alias_endpoint(self):
        """/documents/query should execute RAG question answering."""
        _seed_document(
            document_id="alias-doc",
            user_id="alias-user",
            filename="alias.pdf",
            texts=["ChromaDB is an open-source AI-native vector database."],
        )

        response = self.client.post(
            "/documents/query",
            json={"query": "What is ChromaDB?", "user_id": "alias-user", "top_k": 1},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert "answer" in body
        assert "sources" in body

    def test_search_validation_missing_query(self):
        response = self.client.post(
            "/documents/search",
            json={"user_id": "user-1"},
        )
        assert response.status_code == 422  # Unprocessable entity

    def test_search_validation_empty_query(self):
        response = self.client.post(
            "/documents/search",
            json={"query": "", "user_id": "user-1"},
        )
        assert response.status_code == 422

    def test_search_no_results_for_new_user(self):
        response = self.client.post(
            "/documents/search",
            json={"query": "Anything", "user_id": "nonexistent-user", "top_k": 5},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["total_results"] == 0
        assert body["results"] == []
