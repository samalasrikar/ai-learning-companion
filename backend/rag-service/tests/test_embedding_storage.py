import os
import io
import pytest
import numpy as np

# ──────────────────────────────────────────────
# 1. embedding_service tests
# ──────────────────────────────────────────────
from services.embedding_service import (
    load_embedding_model,
    generate_embeddings,
)


def test_embedding_model_lazy_loading():
    """Model should load automatically on first call and be cached."""
    import services.embedding_service as es

    es._model = None
    assert es._model is None

    # First call loads the model
    emb = generate_embeddings(["Hello world"])[0]
    assert isinstance(emb, list)
    assert len(emb) == 384
    assert es._model is not None

    cached_model = es._model
    emb2 = generate_embeddings(["Test second call"])[0]
    assert es._model is cached_model


def test_generate_query_embedding_dimension_and_type():
    """Query embedding should produce a 384-dimensional list of floats."""
    emb = generate_embeddings(["Artificial Intelligence and Machine Learning"])[0]
    assert isinstance(emb, list)
    assert len(emb) == 384
    assert all(isinstance(val, float) for val in emb)


def test_generate_query_embedding_normalization():
    """Embedding vector should be L2 normalized (unit length = 1.0)."""
    emb = generate_embeddings(["L2 norm verification"])[0]
    vec = np.array(emb, dtype=np.float32)
    norm = np.linalg.norm(vec)
    assert pytest.approx(norm, abs=1e-4) == 1.0


def test_generate_embeddings_batch_list():
    """Batch embedding generation should return one 384-dim vector per input string."""
    texts = [
        "First document chunk text for testing.",
        "Second chunk covering machine learning algorithms.",
        "Third chunk with natural language processing details.",
    ]
    embeddings = generate_embeddings(texts)
    assert isinstance(embeddings, list)
    assert len(embeddings) == 3
    for emb in embeddings:
        assert len(emb) == 384
        vec = np.array(emb, dtype=np.float32)
        assert pytest.approx(np.linalg.norm(vec), abs=1e-4) == 1.0


def test_generate_embeddings_empty_list():
    """Empty list input should return an empty list immediately."""
    assert generate_embeddings([]) == []


def test_generate_embeddings_deterministic():
    """Identical text should yield identical embedding vectors."""
    text = "Deterministic vector generation check."
    emb1 = generate_embeddings([text])[0]
    emb2 = generate_embeddings([text])[0]

    np.testing.assert_allclose(emb1, emb2, rtol=1e-5, atol=1e-5)


def test_semantic_similarity_concept():
    """Cosines of semantically similar texts should be higher than dissimilar ones."""
    query_emb = np.array(generate_embeddings(["Deep neural networks in artificial intelligence"])[0])
    similar_emb = np.array(generate_embeddings(["Machine learning with deep neural network models"])[0])
    dissimilar_emb = np.array(generate_embeddings(["Baking chocolate cake with flour and sugar"])[0])

    sim_high = np.dot(query_emb, similar_emb)
    sim_low = np.dot(query_emb, dissimilar_emb)

    assert sim_high > sim_low


# ──────────────────────────────────────────────
# 2. chroma_service tests (storage + duplicates)
# ──────────────────────────────────────────────
from services.chroma_service import (
    init_chroma_db,
    get_documents_collection,
    is_document_indexed,
    store_document_chunks,
)


@pytest.fixture
def fresh_chroma(monkeypatch):
    """
    Provides a fresh ChromaDB collection for testing.
    Resets the module-level globals so each test gets a clean state.
    """
    import services.chroma_service as cs

    monkeypatch.setenv("TESTING", "true")
    cs._chroma_client = None
    cs._documents_collection = None
    client, coll = init_chroma_db()
    try:
        client.delete_collection("documents")
    except Exception:
        pass
    cs._documents_collection = None
    _, coll = init_chroma_db()
    yield coll
    cs._chroma_client = None
    cs._documents_collection = None


def _sample_chunks(n: int = 3):
    """Create n sample chunk dicts mimicking chunker_service output."""
    return [
        {
            "chunk_number": i + 1,
            "text": f"Sample chunk text number {i + 1}. " * 5,
            "metadata": {
                "filename": "test.pdf",
                "page_number": 1,
                "document_id": "test-doc-id",
                "user_id": "test-user-id",
                "chunk_number": i + 1,
                "char_count": 120,
                "token_count": 25,
            },
        }
        for i in range(n)
    ]


class TestStoreDocumentChunks:
    def test_empty_chunks_returns_zero_count(self, fresh_chroma):
        result = store_document_chunks([], [], "doc-1", "user-1", "file.pdf")
        assert result["stored_count"] == 0
        assert result["document_id"] == "doc-1"
        assert result["collection_total"] == 0

    def test_mismatched_chunks_and_embeddings_raises_error(self, fresh_chroma):
        chunks = _sample_chunks(2)
        embeddings = [[0.1] * 384]  # 2 chunks, 1 embedding
        with pytest.raises(ValueError, match="Mismatch"):
            store_document_chunks(chunks, embeddings, "doc-1", "user-1", "file.pdf")

    def test_store_and_count(self, fresh_chroma):
        chunks = _sample_chunks(5)
        embeddings = generate_embeddings([c["text"] for c in chunks])
        result = store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            document_id="store-doc",
            user_id="store-user",
            filename="store.pdf",
        )
        assert result["stored_count"] == 5
        assert result["document_id"] == "store-doc"
        assert result["collection_total"] == 5

    def test_stored_chunk_metadata_content(self, fresh_chroma):
        chunks = _sample_chunks(1)
        embeddings = generate_embeddings([chunks[0]["text"]])
        store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            document_id="meta-doc",
            user_id="user-meta",
            filename="meta.pdf",
        )

        collection = get_documents_collection()
        result = collection.get(ids=["meta-doc_chunk_1"], include=["metadatas", "documents"])

        assert len(result["ids"]) == 1
        assert result["ids"][0] == "meta-doc_chunk_1"
        meta = result["metadatas"][0]
        assert meta["userId"] == "user-meta"
        assert meta["documentId"] == "meta-doc"
        assert meta["filename"] == "meta.pdf"
        assert meta["chunkIndex"] == 1
        assert "uploadDate" in meta

    def test_is_document_indexed_true_and_false(self, fresh_chroma):
        assert not is_document_indexed("non-existent-doc")

        chunks = _sample_chunks(2)
        embeddings = generate_embeddings([c["text"] for c in chunks])
        store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            document_id="indexed-doc",
            user_id="u1",
            filename="indexed.pdf",
        )

        assert is_document_indexed("indexed-doc")
        assert not is_document_indexed("other-doc")

    def test_upsert_is_idempotent(self, fresh_chroma):
        """Storing the same document twice should not duplicate entries."""
        chunks = _sample_chunks(3)
        embeddings = generate_embeddings([c["text"] for c in chunks])
        store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            document_id="idem-doc",
            user_id="idem-user",
            filename="idem.pdf",
        )
        # Store again
        result = store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            document_id="idem-doc",
            user_id="idem-user",
            filename="idem.pdf",
        )
        assert result["stored_count"] == 3
        assert result["collection_total"] == 3  # not 6

    def test_deterministic_chunk_ids(self, fresh_chroma):
        chunks = _sample_chunks(2)
        embeddings = generate_embeddings([c["text"] for c in chunks])
        store_document_chunks(
            chunks=chunks,
            embeddings=embeddings,
            document_id="det-doc",
            user_id="u1",
            filename="det.pdf",
        )

        collection = get_documents_collection()
        result = collection.get(ids=["det-doc_chunk_1", "det-doc_chunk_2"])
        assert len(result["ids"]) == 2


# ──────────────────────────────────────────────
# 3. Integration with process_pdf_document
# ──────────────────────────────────────────────
from services.document_processor import process_pdf_document
import fitz


def _make_pdf_bytes(text: str = "Sample content for RAG pipeline test.") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


class TestProcessPdfDocumentWithEmbeddings:
    def test_end_to_end_with_embeddings(self, fresh_chroma):
        pdf_bytes = _make_pdf_bytes("RAG vector pipeline end-to-end integration test text.")
        result = process_pdf_document(
            file_content=pdf_bytes,
            filename="e2e.pdf",
            document_id="e2e-doc",
            user_id="e2e-user",
            save_to_disk=False,
        )

        assert result["status"] == "success"
        emb = result["embedding"]
        assert emb["model"] == "BAAI/bge-small-en-v1.5"
        assert emb["dimension"] == 384
        assert emb["chunks_embedded"] > 0
        assert emb["stored_count"] == emb["chunks_embedded"]
        assert emb["collection_total"] > 0

    def test_duplicate_document_skipped(self, fresh_chroma):
        pdf_bytes = _make_pdf_bytes("Duplicate checking content for RAG.")

        # First upload — succeeds
        res1 = process_pdf_document(
            file_content=pdf_bytes,
            filename="dup.pdf",
            document_id="dup-doc",
            user_id="dup-user",
            save_to_disk=False,
        )
        assert res1["status"] == "success"

        # Second upload with same document_id — returns skipped
        res2 = process_pdf_document(
            file_content=pdf_bytes,
            filename="dup.pdf",
            document_id="dup-doc",
            user_id="dup-user",
            save_to_disk=False,
        )
        assert res2["status"] == "skipped"
        assert "already indexed" in res2["message"]

    def test_different_doc_ids_both_stored(self, fresh_chroma):
        pdf_bytes = _make_pdf_bytes("Different doc ID testing content.")

        res1 = process_pdf_document(
            file_content=pdf_bytes,
            filename="d1.pdf",
            document_id="doc-id-1",
            user_id="u1",
            save_to_disk=False,
        )
        res2 = process_pdf_document(
            file_content=pdf_bytes,
            filename="d2.pdf",
            document_id="doc-id-2",
            user_id="u1",
            save_to_disk=False,
        )

        assert res1["status"] == "success"
        assert res2["status"] == "success"

        total = res2["embedding"]["collection_total"]
        assert total >= 2


# ──────────────────────────────────────────────
# 4. Route Level Test with TestClient
# ──────────────────────────────────────────────
from fastapi.testclient import TestClient
from app import app


class TestProcessPdfRouteWithEmbeddings:
    @pytest.fixture(autouse=True)
    def setup_route(self, monkeypatch):
        import services.chroma_service as cs

        monkeypatch.setenv("TESTING", "true")
        cs._chroma_client = None
        cs._documents_collection = None
        client, coll = init_chroma_db()
        try:
            client.delete_collection("documents")
        except Exception:
            pass
        cs._documents_collection = None
        init_chroma_db()
        self.client = TestClient(app)
        yield
        cs._chroma_client = None
        cs._documents_collection = None

    def test_response_includes_embedding_stats(self):
        pdf_bytes = _make_pdf_bytes("Route testing with embedding verification.")
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("route_emb.pdf", pdf_bytes, "application/pdf")},
            data={"document_id": "route-emb-doc", "user_id": "route-user"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert "embedding" in body
        emb = body["embedding"]
        required_embedding_keys = {"model", "dimension", "chunks_embedded", "stored_count", "collection_total"}
        assert required_embedding_keys.issubset(emb.keys())
        assert emb["model"] == "BAAI/bge-small-en-v1.5"
        assert emb["dimension"] == 384

    def test_duplicate_returns_skipped(self):
        pdf_bytes = _make_pdf_bytes("Duplicate route post check.")

        # Post 1
        res1 = self.client.post(
            "/documents/process-pdf",
            files={"file": ("dup.pdf", pdf_bytes, "application/pdf")},
            data={"document_id": "dup-route-doc", "user_id": "u1"},
        )
        assert res1.status_code == 200
        assert res1.json()["status"] == "success"

        # Post 2
        res2 = self.client.post(
            "/documents/process-pdf",
            files={"file": ("dup.pdf", pdf_bytes, "application/pdf")},
            data={"document_id": "dup-route-doc", "user_id": "u1"},
        )
        assert res2.status_code == 200
        assert res2.json()["status"] == "skipped"

    def test_embedding_response_structure(self):
        pdf_bytes = _make_pdf_bytes("Structure check for full pipeline.")
        response = self.client.post(
            "/upload",
            files={"file": ("struct.pdf", pdf_bytes, "application/pdf")},
            data={"document_id": "struct-doc", "user_id": "struct-user"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "statistics" in body
        assert "embedding" in body
        assert "chunks" in body
