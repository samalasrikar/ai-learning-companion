import re


def clean_text(text: str) -> str:
    """
    Cleans raw text extracted from PDF documents:
    - Removes null bytes and non-printable control characters.
    - Normalizes Unicode ligatures (ﬁ → fi, ﬂ → fl, etc.).
    - Normalizes smart quotes and dashes to ASCII equivalents.
    - Fixes hyphenated words broken across line breaks.
    - Strips common PDF header/footer artifacts (standalone page numbers).
    - Normalizes excessive whitespace and line breaks.
    """
    if not text:
        return ""

    # Remove null bytes and non-printable control characters (keep \t, \n, \r)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Normalize common Unicode ligatures
    ligature_map = {
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
    }
    for ligature, replacement in ligature_map.items():
        text = text.replace(ligature, replacement)

    # Normalize smart quotes and dashes to ASCII
    text = text.replace("\u2018", "'").replace("\u2019", "'")   # single quotes
    text = text.replace("\u201c", '"').replace("\u201d", '"')   # double quotes
    text = text.replace("\u2013", "-").replace("\u2014", "-")   # en/em dashes

    # Rejoin hyphenated words split by line breaks (e.g., "commu-\nnication" → "communication")
    text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)

    # Strip standalone page numbers on their own line (e.g., "\n 42 \n")
    text = re.sub(r"\n\s*\d{1,4}\s*\n", "\n", text)

    # Replace multiple spaces/tabs within lines with a single space
    text = re.sub(r"[ \t]+", " ", text)

    # Clean whitespace surrounding newlines
    text = re.sub(r" ?\n ?", "\n", text)

    # Normalize excessive consecutive newlines (keep max 2 for paragraph boundaries)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()
