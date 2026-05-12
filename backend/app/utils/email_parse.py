"""Email normalization and subject helpers."""

import re
from email.message import Message
from email.parser import BytesParser
from email.policy import default

CASE_TAG = re.compile(r"^\s*\[CASE-[\w-]+\]\s*", re.IGNORECASE)


def normalize_email(addr: str) -> str:
    return addr.strip().lower()


def strip_case_tag_from_subject(subject: str | None) -> str:
    if not subject:
        return ""
    s = subject.strip()
    while True:
        m = CASE_TAG.match(s)
        if not m:
            break
        s = s[m.end() :].strip()
    return s


def extract_case_id_from_subject(subject: str | None) -> str | None:
    if not subject:
        return None
    m = re.search(r"\[CASE-([A-Z0-9-]+)\]", subject, re.IGNORECASE)
    return f"CASE-{m.group(1).upper()}" if m else None


def parse_rfc822_raw(raw_bytes: bytes) -> Message:
    return BytesParser(policy=default).parsebytes(raw_bytes)
