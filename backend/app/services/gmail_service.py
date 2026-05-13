"""Gmail API: list, fetch, parse, send."""

from __future__ import annotations

import base64
import binascii
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from email.message import EmailMessage
from email.utils import formatdate, parsedate_to_datetime
from typing import Any

from google.auth.transport.requests import Request
from google.auth.exceptions import RefreshError
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.config import Settings
from app.utils.email_parse import parse_rfc822_raw, strip_case_tag_from_subject


def _b64decode(data: str) -> bytes:
    pad = 4 - len(data) % 4
    if pad != 4:
        data += "=" * pad
    return base64.urlsafe_b64decode(data.encode("ascii"))


def _header(headers: list[dict[str, str]], name: str) -> str | None:
    want = name.lower()
    for h in headers:
        if h.get("name", "").lower() == want:
            return h.get("value")
    return None


def _parse_addr_header(value: str | None) -> tuple[str | None, str | None]:
    if not value:
        return None, None
    m = re.match(r"^(?P<name>.*?)\s*<(?P<email>[^>]+)>\s*$", value.strip())
    if m:
        return m.group("name").strip().strip('"') or None, normalize_addr(m.group("email"))
    if "@" in value:
        return None, normalize_addr(value.strip())
    return None, None


def normalize_addr(raw: str) -> str:
    return raw.strip().lower()


@dataclass
class ParsedGmailMessage:
    gmail_thread_id: str
    gmail_message_id: str
    from_email: str
    from_name: str | None
    to: list[str]
    subject: str
    body_text: str
    body_html: str | None
    attachments: list[dict[str, Any]]
    timestamp: datetime
    internet_message_id: str | None


class GmailAuthError(RuntimeError):
    """Raised when Gmail OAuth credentials cannot be refreshed."""


class GmailService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._service: Any | None = None

    def _creds(self) -> Credentials:
        kwargs = {
            "token": None,
            "refresh_token": self._settings.google_refresh_token,
            "token_uri": "https://oauth2.googleapis.com/token",
            "client_id": self._settings.google_client_id,
            "client_secret": self._settings.google_client_secret,
        }
        scopes = self._settings.google_oauth_scope_list
        if scopes:
            kwargs["scopes"] = scopes
        return Credentials(**kwargs)

    def _get_service(self) -> Any:
        if self._service is None:
            creds = self._creds()
            try:
                creds.refresh(Request())
            except RefreshError as exc:
                self.reset_client()
                raise GmailAuthError(
                    "Gmail OAuth refresh failed. Recreate GOOGLE_REFRESH_TOKEN with Gmail API "
                    "enabled and the scopes required by this app."
                ) from exc
            self._service = build("gmail", "v1", credentials=creds, cache_discovery=False)
        return self._service

    def reset_client(self) -> None:
        self._service = None

    def list_recent_message_ids(
        self,
        history_id: str | None,
        max_results: int = 50,
    ) -> tuple[list[str], str | None, bool]:
        """
        Returns (message_ids, new_history_id, used_history_api).
        On history failure, falls back to messages.list and returns new_history_id from profile.
        """
        uid = self._settings.google_sync_user
        svc = self._get_service()
        ids: list[str] = []
        new_hist: str | None = None
        if history_id:
            try:
                page_token = None
                while len(ids) < max_results:
                    req = (
                        svc.users()
                        .history()
                        .list(
                            userId=uid,
                            startHistoryId=history_id,
                            historyTypes="messageAdded",
                            pageToken=page_token,
                        )
                        .execute()
                    )
                    for h in req.get("history", []):
                        for added in h.get("messagesAdded", []):
                            mid = added.get("message", {}).get("id")
                            if mid:
                                ids.append(mid)
                    new_hist = req.get("historyId") or new_hist
                    page_token = req.get("nextPageToken")
                    if not page_token:
                        break
                prof = svc.users().getProfile(userId=uid).execute()
                new_hist = prof.get("historyId") or new_hist
                return ids[:max_results], new_hist, True
            except HttpError:
                self.reset_client()
                svc = self._get_service()

        # Fallback: recent messages
        res = (
            svc.users()
            .messages()
            .list(userId=uid, maxResults=max_results, q="newer_than:7d")
            .execute()
        )
        for m in res.get("messages", []) or []:
            if m.get("id"):
                ids.append(m["id"])
        prof = svc.users().getProfile(userId=uid).execute()
        new_hist = prof.get("historyId")
        return ids, new_hist, False

    def fetch_message(self, msg_id: str) -> dict[str, Any]:
        uid = self._settings.google_sync_user
        svc = self._get_service()
        return (
            svc.users()
            .messages()
            .get(userId=uid, id=msg_id, format="full")
            .execute()
        )

    def parse_message(self, raw_api: dict[str, Any]) -> ParsedGmailMessage:
        payload = raw_api.get("payload", {}) or {}
        headers = payload.get("headers", []) or []
        raw_b64 = raw_api.get("raw")
        if raw_b64:
            raw_bytes = _b64decode(raw_b64)
            return self._parse_from_bytes(raw_bytes, raw_api)

        tid = raw_api.get("threadId", "")
        mid = raw_api.get("id", "")
        subj = _header(headers, "Subject") or ""
        from_val = _header(headers, "From")
        fn, fe = _parse_addr_header(from_val)
        if not fe:
            fe = ""
        to_raw = _header(headers, "To") or ""
        to_list = [normalize_addr(x) for x in re.split(r"[,;]", to_raw) if x.strip()]
        date_h = _header(headers, "Date")
        ts = self._parse_date(date_h)
        msg_id_h = _header(headers, "Message-ID")

        body_text, body_html, attachments = self._walk_parts(payload, mid)

        if not body_text and body_html:
            body_text = re.sub(r"<[^>]+>", " ", body_html)
            body_text = re.sub(r"\s+", " ", body_text).strip()

        return ParsedGmailMessage(
            gmail_thread_id=tid,
            gmail_message_id=mid,
            from_email=fe,
            from_name=fn,
            to=to_list,
            subject=subj,
            body_text=body_text or "",
            body_html=body_html,
            attachments=attachments,
            timestamp=ts,
            internet_message_id=msg_id_h,
        )

    def _parse_from_bytes(self, raw_bytes: bytes, raw_api: dict[str, Any]) -> ParsedGmailMessage:
        msg = parse_rfc822_raw(raw_bytes)
        subj = msg.get("Subject", "") or ""
        from_val = msg.get("From", "")
        fn, fe = _parse_addr_header(str(from_val))
        to_raw = msg.get("To", "")
        to_list = [normalize_addr(x) for x in re.split(r"[,;]", str(to_raw)) if x.strip()]
        date_h = msg.get("Date")
        ts = self._parse_date(str(date_h) if date_h else None)
        msg_id_h = msg.get("Message-ID")
        body_text, body_html, attachments = self._extract_from_email_message(msg, raw_api.get("id", ""))
        tid = raw_api.get("threadId", "")
        mid = raw_api.get("id", "")
        if not body_text and body_html:
            body_text = re.sub(r"<[^>]+>", " ", body_html)
            body_text = re.sub(r"\s+", " ", body_text).strip()
        return ParsedGmailMessage(
            gmail_thread_id=tid,
            gmail_message_id=mid,
            from_email=fe or "",
            from_name=fn,
            to=to_list,
            subject=subj,
            body_text=body_text or "",
            body_html=body_html,
            attachments=attachments,
            timestamp=ts,
            internet_message_id=str(msg_id_h) if msg_id_h else None,
        )

    def _parse_date(self, date_h: str | None) -> datetime:
        if date_h:
            try:
                dt = parsedate_to_datetime(date_h)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt.astimezone(timezone.utc).replace(tzinfo=None)
            except (TypeError, ValueError):
                pass
        return datetime.utcnow()

    def _walk_parts(
        self,
        payload: dict[str, Any],
        msg_id: str,
    ) -> tuple[str, str | None, list[dict[str, Any]]]:
        body_text = ""
        body_html: str | None = None
        attachments: list[dict[str, Any]] = []

        def visit(part: dict[str, Any]) -> None:
            nonlocal body_text, body_html
            mime = part.get("mimeType", "")
            body = part.get("body", {}) or {}
            data = body.get("data")
            att_id = body.get("attachmentId")
            filename = part.get("filename") or ""

            if att_id and filename:
                attachments.append(
                    {
                        "filename": filename,
                        "mime_type": mime or "application/octet-stream",
                        "attachment_id": att_id,
                        "message_id": msg_id,
                    }
                )
                return

            if data and mime == "text/plain":
                try:
                    body_text = _b64decode(data).decode("utf-8", errors="replace")
                except (binascii.Error, UnicodeError):
                    pass
            elif data and mime == "text/html" and not body_html:
                try:
                    body_html = _b64decode(data).decode("utf-8", errors="replace")
                except (binascii.Error, UnicodeError):
                    pass

            for child in part.get("parts", []) or []:
                visit(child)

        visit(payload)
        return body_text, body_html, attachments

    def _extract_from_email_message(
        self,
        msg: EmailMessage,
        fallback_mid: str,
    ) -> tuple[str, str | None, list[dict[str, Any]]]:
        body_text = ""
        body_html: str | None = None
        attachments: list[dict[str, Any]] = []

        if msg.is_multipart():
            for part in msg.walk():
                ctype = part.get_content_type()
                if part.get_content_disposition() == "attachment":
                    fn = part.get_filename() or "attachment"
                    payload = part.get_payload(decode=True) or b""
                    attachments.append(
                        {
                            "filename": fn,
                            "mime_type": ctype,
                            "data_bytes": payload,
                        }
                    )
                elif ctype == "text/plain":
                    body_text = (part.get_payload(decode=True) or b"").decode(
                        "utf-8", errors="replace"
                    )
                elif ctype == "text/html" and body_html is None:
                    body_html = (part.get_payload(decode=True) or b"").decode(
                        "utf-8", errors="replace"
                    )
        else:
            payload = msg.get_payload(decode=True) or b""
            if msg.get_content_type() == "text/html":
                body_html = payload.decode("utf-8", errors="replace")
            else:
                body_text = payload.decode("utf-8", errors="replace")

        return body_text, body_html, attachments

    def download_attachment(self, message_id: str, attachment_id: str) -> tuple[bytes, str]:
        uid = self._settings.google_sync_user
        svc = self._get_service()
        att = (
            svc.users()
            .messages()
            .attachments()
            .get(userId=uid, messageId=message_id, id=attachment_id)
            .execute()
        )
        data = att.get("data", "")
        raw = _b64decode(data)
        return raw, att.get("mimeType") or "application/octet-stream"

    def send_email(
        self,
        to: str,
        subject: str,
        body_html: str,
        body_text: str | None = None,
        in_reply_to: str | None = None,
        references: str | None = None,
        attachments: list[tuple[str, bytes, str]] | None = None,
    ) -> tuple[str, str]:
        from email.message import EmailMessage as PyEmail

        em = PyEmail()
        em["To"] = to
        em["Subject"] = subject
        em["Date"] = formatdate(localtime=True)
        em["MIME-Version"] = "1.0"
        if in_reply_to:
            em["In-Reply-To"] = in_reply_to
        if references:
            em["References"] = references

        if attachments:
            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            from email.mime.application import MIMEApplication

            root = MIMEMultipart("mixed")
            for k, v in em.items():
                root[k] = v
            alt = MIMEMultipart("alternative")
            if body_text:
                alt.attach(MIMEText(body_text, "plain", "utf-8"))
            alt.attach(MIMEText(body_html, "html", "utf-8"))
            root.attach(alt)
            for fn, data, ctype in attachments:
                part = MIMEApplication(data, _subtype=ctype.split("/")[-1])
                part.add_header("Content-Disposition", "attachment", filename=fn)
                part.set_type(ctype)
                root.attach(part)
            raw_bytes = root.as_bytes()
        else:
            em.set_content(body_html, subtype="html", charset="utf-8")
            raw_bytes = em.as_bytes()

        raw = base64.urlsafe_b64encode(raw_bytes).decode("ascii").rstrip("=")
        uid = self._settings.google_sync_user
        svc = self._get_service()
        sent = svc.users().messages().send(userId=uid, body={"raw": raw}).execute()
        return sent.get("threadId", ""), sent.get("id", "")
