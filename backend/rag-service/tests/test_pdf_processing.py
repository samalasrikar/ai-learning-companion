"""
Tests for the PDF processing pipeline:
  - cleaner_service (text cleaning)
  - pdf_service (PDF extraction)
  - chunker_service (semantic chunking)
  - document_processor (end-to-end orchestration)
  - document_routes (FastAPI endpoint)
"""

import os
import sys
import uuid
import pytest

# Ensure the rag-service root is on sys.path so `services.*` imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ──────────────────────────────────────────────
# 1. cleaner_service tests
# ──────────────────────────────────────────────
from services.cleaner_service import clean_text


class TestCleanText:
    def test_empty_string(self):
        assert clean_text("") == ""

    def test_none_input(self):
        assert clean_text(None) == ""

    def test_removes_null_bytes(self):
        assert clean_text("hello\x00world") == "hello world" or "helloworld" in clean_text("hello\x00world")
        assert "\x00" not in clean_text("hello\x00world")

    def test_removes_control_characters(self):
        text = "line\x01one\x02two\x03three"
        result = clean_text(text)
        assert "\x01" not in result
        assert "\x02" not in result
        assert "\x03" not in result

    def test_normalizes_ligatures(self):
        assert "fi" in clean_text("of\ufb01ce")
        assert "fl" in clean_text("\ufb02oor")

    def test_normalizes_smart_quotes(self):
        result = clean_text("\u201cHello\u201d \u2018world\u2019")
        assert '"Hello"' in result
        assert "'world'" in result

    def test_normalizes_dashes(self):
        result = clean_text("2020\u20132025 and a\u2014b")
        assert "2020-2025" in result
        assert "a-b" in result

    def test_rejoins_hyphenated_words(self):
        result = clean_text("commu-\nnication")
        assert result == "communication"

    def test_strips_standalone_page_numbers(self):
        result = clean_text("some text\n 42 \nmore text")
        assert "42" not in result
        assert "some text" in result
        assert "more text" in result

    def test_normalizes_whitespace(self):
        result = clean_text("too    many   spaces")
        assert result == "too many spaces"

    def test_normalizes_excessive_newlines(self):
        result = clean_text("paragraph one\n\n\n\n\nparagraph two")
        assert result == "paragraph one\n\nparagraph two"

    def test_strips_leading_trailing_whitespace(self):
        result = clean_text("   hello world   ")
        assert result == "hello world"


# ──────────────────────────────────────────────
# 2. pdf_service tests
# ──────────────────────────────────────────────
from services.pdf_service import extract_pdf_pages, MAX_PDF_SIZE_BYTES


def _make_pdf_bytes(text: str = "Hello, world!", num_pages: int = 1) -> bytes:
    """Create a minimal valid PDF in memory using PyMuPDF."""
    import fitz

    doc = fitz.open()
    for i in range(num_pages):
        page = doc.new_page()
        page.insert_text((72, 72), f"{text} (page {i + 1})")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


class TestExtractPdfPages:
    def test_single_page_extraction(self):
        pdf_bytes = _make_pdf_bytes("Sample text", num_pages=1)
        result = extract_pdf_pages(pdf_bytes, "test.pdf")
        assert result["filename"] == "test.pdf"
        assert result["total_pages"] == 1
        assert len(result["pages"]) == 1
        assert result["pages"][0]["page_number"] == 1
        assert "Sample text" in result["pages"][0]["text"]
        assert result["pages"][0]["char_count"] > 0

    def test_multi_page_extraction(self):
        pdf_bytes = _make_pdf_bytes("Page content", num_pages=5)
        result = extract_pdf_pages(pdf_bytes, "multi.pdf")
        assert result["total_pages"] == 5
        assert len(result["pages"]) == 5
        for i, page in enumerate(result["pages"]):
            assert page["page_number"] == i + 1

    def test_empty_bytes_raises(self):
        with pytest.raises(ValueError, match="empty"):
            extract_pdf_pages(b"", "empty.pdf")

    def test_invalid_pdf_raises(self):
        with pytest.raises(ValueError, match="Failed to parse"):
            extract_pdf_pages(b"not a pdf", "invalid.pdf")

    def test_oversized_file_raises(self):
        # Create bytes just over the limit
        oversized = b"x" * (MAX_PDF_SIZE_BYTES + 1)
        with pytest.raises(ValueError, match="exceeding"):
            extract_pdf_pages(oversized, "huge.pdf")

    def test_pages_preserve_order(self):
        pdf_bytes = _make_pdf_bytes("Content", num_pages=3)
        result = extract_pdf_pages(pdf_bytes, "ordered.pdf")
        page_numbers = [p["page_number"] for p in result["pages"]]
        assert page_numbers == [1, 2, 3]


# ──────────────────────────────────────────────
# 3. chunker_service tests
# ──────────────────────────────────────────────
from services.chunker_service import (
    estimate_token_count,
    create_document_chunks,
)


class TestEstimateTokenCount:
    def test_empty_string(self):
        assert estimate_token_count("") >= 0

    def test_short_string(self):
        count = estimate_token_count("Hello world")
        assert count >= 1

    def test_returns_integer(self):
        assert isinstance(estimate_token_count("some text"), int)


class TestCreateDocumentChunks:
    def _make_pages(self, text: str, num_pages: int = 1):
        return [
            {"page_number": i + 1, "text": text}
            for i in range(num_pages)
        ]

    def test_basic_chunking(self):
        # ~200 tokens of text per page across 3 pages
        long_text = "This is a sample sentence for testing the chunking logic. " * 40
        pages = self._make_pages(long_text, num_pages=3)

        result = create_document_chunks(
            pages=pages,
            document_id="doc-123",
            user_id="user-456",
            filename="test.pdf",
        )

        assert "statistics" in result
        assert "chunks" in result
        assert result["statistics"]["total_chunks"] > 0
        assert result["statistics"]["document_id"] == "doc-123"
        assert result["statistics"]["user_id"] == "user-456"
        assert result["statistics"]["filename"] == "test.pdf"

    def test_metadata_on_chunks(self):
        pages = self._make_pages("Some text for metadata testing. " * 20)
        result = create_document_chunks(
            pages=pages,
            document_id="doc-meta",
            user_id="user-meta",
            filename="meta.pdf",
        )

        for chunk in result["chunks"]:
            meta = chunk["metadata"]
            assert meta["document_id"] == "doc-meta"
            assert meta["user_id"] == "user-meta"
            assert meta["filename"] == "meta.pdf"
            assert "page_number" in meta
            assert "chunk_number" in meta
            assert meta["char_count"] > 0
            assert meta["token_count"] > 0

    def test_chunk_numbers_are_sequential(self):
        long_text = "Word " * 600  # enough to produce multiple chunks
        pages = self._make_pages(long_text)
        result = create_document_chunks(
            pages=pages,
            document_id="doc-seq",
            user_id="user-seq",
            filename="seq.pdf",
        )

        chunk_numbers = [c["chunk_number"] for c in result["chunks"]]
        assert chunk_numbers == list(range(1, len(chunk_numbers) + 1))

    def test_empty_pages_produce_no_chunks(self):
        pages = [
            {"page_number": 1, "text": ""},
            {"page_number": 2, "text": "   "},
            {"page_number": 3, "text": None},
        ]
        result = create_document_chunks(
            pages=pages,
            document_id="doc-empty",
            user_id="user-empty",
            filename="empty.pdf",
        )
        assert result["statistics"]["total_chunks"] == 0
        assert result["chunks"] == []

    def test_statistics_averages(self):
        text = "Testing average calculation across chunks. " * 100
        pages = self._make_pages(text)
        result = create_document_chunks(
            pages=pages,
            document_id="doc-avg",
            user_id="user-avg",
            filename="avg.pdf",
        )
        stats = result["statistics"]
        if stats["total_chunks"] > 0:
            assert stats["average_chunk_tokens"] > 0
            assert stats["average_chunk_characters"] > 0
            assert stats["total_tokens"] > 0
            assert stats["total_characters"] > 0

    def test_statistics_include_config(self):
        pages = self._make_pages("Some text. " * 10)
        result = create_document_chunks(
            pages=pages,
            document_id="doc-cfg",
            user_id="user-cfg",
            filename="cfg.pdf",
            target_chunk_tokens=300,
            overlap_tokens=50,
        )
        stats = result["statistics"]
        assert stats["target_chunk_tokens"] == 300
        assert stats["overlap_tokens"] == 50


# ──────────────────────────────────────────────
# 4. document_processor tests
# ──────────────────────────────────────────────
from services.document_processor import process_pdf_document
from services.chroma_service import init_chroma_db


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


class TestProcessPdfDocument:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path, monkeypatch):
        _fresh_chroma_fixture(tmp_path, monkeypatch)
        self.upload_dir = tmp_path / "uploads"
        yield
        _teardown_chroma()

    def test_end_to_end(self):
        pdf_bytes = _make_pdf_bytes("End to end test content. " * 30, num_pages=2)
        result = process_pdf_document(
            file_content=pdf_bytes,
            filename="e2e_test.pdf",
            document_id="e2e-doc",
            user_id="e2e-user",
        )

        assert result["status"] == "success"
        assert result["statistics"]["filename"] == "e2e_test.pdf"
        assert result["statistics"]["document_id"] == "e2e-doc"
        assert result["statistics"]["user_id"] == "e2e-user"
        assert result["statistics"]["total_chunks"] > 0
        assert len(result["chunks"]) == result["statistics"]["total_chunks"]

    def test_saves_file_to_disk(self):
        pdf_bytes = _make_pdf_bytes("disk save test")
        process_pdf_document(
            file_content=pdf_bytes,
            filename="save_test.pdf",
            document_id="save-doc",
            user_id="save-user",
            save_to_disk=True,
        )

        saved_files = [f for f in self.upload_dir.iterdir() if f.is_file()]
        assert len(saved_files) == 1
        assert saved_files[0].name == "save-doc_save_test.pdf"

    def test_skip_save_to_disk(self):
        pdf_bytes = _make_pdf_bytes("no disk save")
        process_pdf_document(
            file_content=pdf_bytes,
            filename="nosave.pdf",
            document_id="nosave-doc",
            user_id="nosave-user",
            save_to_disk=False,
        )

        if self.upload_dir.exists():
            saved_files = [f for f in self.upload_dir.iterdir() if f.is_file()]
            assert len(saved_files) == 0

    def test_invalid_pdf_raises_value_error(self):
        with pytest.raises(ValueError):
            process_pdf_document(
                file_content=b"not a valid pdf",
                filename="bad.pdf",
                document_id="bad-doc",
                user_id="bad-user",
            )


# ──────────────────────────────────────────────
# 5. FastAPI route tests
# ──────────────────────────────────────────────
from fastapi.testclient import TestClient


def _create_test_app():
    """Build a minimal FastAPI app with the document router for testing."""
    from fastapi import FastAPI
    from routes.document_routes import router

    app = FastAPI()
    app.include_router(router)
    return app


class TestProcessPdfRoute:
    @pytest.fixture(autouse=True)
    def setup(self, tmp_path, monkeypatch):
        _fresh_chroma_fixture(tmp_path, monkeypatch)
        self.client = TestClient(_create_test_app())
        yield
        _teardown_chroma()

    def test_successful_upload(self):
        pdf_bytes = _make_pdf_bytes("Route test content. " * 30, num_pages=2)
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("test.pdf", pdf_bytes, "application/pdf")},
            data={"document_id": "route-doc", "user_id": "route-user"},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "success"
        assert body["statistics"]["document_id"] == "route-doc"
        assert body["statistics"]["user_id"] == "route-user"
        assert body["statistics"]["total_chunks"] > 0
        assert len(body["chunks"]) > 0

    def test_auto_generated_ids(self):
        pdf_bytes = _make_pdf_bytes("Auto ID test")
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("auto.pdf", pdf_bytes, "application/pdf")},
        )
        assert response.status_code == 200
        body = response.json()
        assert body["statistics"]["user_id"] == "anonymous"
        # document_id should be a valid UUID
        uuid.UUID(body["statistics"]["document_id"])

    def test_non_pdf_rejected(self):
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("notes.txt", b"hello world", "text/plain")},
        )
        assert response.status_code == 400
        assert "PDF" in response.json()["detail"]

    def test_empty_file_rejected(self):
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("empty.pdf", b"", "application/pdf")},
        )
        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()

    def test_invalid_pdf_returns_422(self):
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("bad.pdf", b"not a pdf", "application/pdf")},
        )
        assert response.status_code == 422

    def test_chunk_metadata_structure(self):
        pdf_bytes = _make_pdf_bytes("Metadata structure check")
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("meta.pdf", pdf_bytes, "application/pdf")},
            data={"document_id": "meta-doc", "user_id": "meta-user"},
        )
        assert response.status_code == 200
        body = response.json()
        chunk = body["chunks"][0]
        assert "chunk_number" in chunk
        assert "text" in chunk
        meta = chunk["metadata"]
        required_keys = {
            "filename", "page_number", "document_id",
            "user_id", "chunk_number", "char_count", "token_count",
        }
        assert required_keys.issubset(set(meta.keys()))

    def test_statistics_structure(self):
        pdf_bytes = _make_pdf_bytes("Stats structure check. " * 20)
        response = self.client.post(
            "/documents/process-pdf",
            files={"file": ("stats.pdf", pdf_bytes, "application/pdf")},
            data={"document_id": "stats-doc", "user_id": "stats-user"},
        )
        assert response.status_code == 200
        stats = response.json()["statistics"]
        required_keys = {
            "document_id", "user_id", "filename", "total_pages",
            "total_chunks", "total_characters", "total_tokens",
            "average_chunk_tokens", "average_chunk_characters",
            "target_chunk_tokens", "overlap_tokens",
        }
        assert required_keys.issubset(set(stats.keys()))
