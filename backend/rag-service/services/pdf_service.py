import os
import logging
from typing import List, Dict, Any
import fitz  # PyMuPDF

from services.cleaner_service import clean_text

logger = logging.getLogger("rag_service.pdf")

# Maximum file size: 50 MB
MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024


def extract_pdf_pages(file_content: bytes, filename: str) -> Dict[str, Any]:
    """
    Extracts text page by page from raw PDF bytes using PyMuPDF (fitz).

    Validates file size and PDF integrity before extraction.
    Each page's raw text is cleaned via cleaner_service.clean_text().

    Returns a dictionary with document metadata and extracted page objects:
    {
        "filename": filename,
        "total_pages": int,
        "total_characters": int,
        "pages": [
            {"page_number": 1, "text": "cleaned text...", "char_count": int},
            ...
        ]
    }

    Raises:
        ValueError: If the PDF is empty, exceeds size limit, is encrypted,
                    or cannot be parsed.
    """
    if not file_content:
        raise ValueError(f"PDF file '{filename}' is empty (0 bytes).")

    if len(file_content) > MAX_PDF_SIZE_BYTES:
        size_mb = round(len(file_content) / (1024 * 1024), 2)
        raise ValueError(
            f"PDF file '{filename}' is {size_mb} MB, exceeding the "
            f"{MAX_PDF_SIZE_BYTES // (1024 * 1024)} MB limit."
        )

    try:
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document '{filename}': {str(e)}")

    if pdf_document.is_encrypted:
        pdf_document.close()
        raise ValueError(
            f"PDF document '{filename}' is encrypted/password-protected "
            f"and cannot be processed."
        )

    total_pages = len(pdf_document)
    if total_pages == 0:
        pdf_document.close()
        raise ValueError(f"PDF document '{filename}' contains no pages.")

    pages: List[Dict[str, Any]] = []

    for page_index in range(total_pages):
        page = pdf_document[page_index]
        raw_text = page.get_text("text")
        cleaned = clean_text(raw_text)

        # Include page even if text is blank so page indices remain accurate
        pages.append({
            "page_number": page_index + 1,
            "text": cleaned,
            "char_count": len(cleaned),
        })

    pdf_document.close()

    total_chars = sum(p["char_count"] for p in pages)
    non_empty_pages = sum(1 for p in pages if p["char_count"] > 0)

    logger.info(
        f"Extracted {total_pages} pages from '{filename}' "
        f"({non_empty_pages} with text, {total_chars} total chars)"
    )

    return {
        "filename": filename,
        "total_pages": total_pages,
        "total_characters": total_chars,
        "pages": pages,
    }
