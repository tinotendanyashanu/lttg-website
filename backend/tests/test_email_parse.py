from app.utils.email_parse import (
    extract_case_id_from_subject,
    normalize_email,
    strip_case_tag_from_subject,
    strip_quoted_reply,
)


def test_normalize_email():
    assert normalize_email("  Foo@BAR.com ") == "foo@bar.com"


def test_strip_case_tags():
    assert strip_case_tag_from_subject("[CASE-0001] Hello") == "Hello"
    assert strip_case_tag_from_subject("[case-12ab] [CASE-0002] X") == "X"


def test_extract_case_id():
    assert extract_case_id_from_subject("Re: [CASE-0042] hi") == "CASE-0042"
    assert extract_case_id_from_subject("no tag") is None


def test_strip_quoted_reply_removes_gmail_history():
    body = """Hey thank you

On Wed, May 13, 2026 at 18:03 <contact@leothetechguy.com> wrote:

> test email
>"""

    assert strip_quoted_reply(body) == "Hey thank you"


def test_strip_quoted_reply_removes_blockquote_only_history():
    body = """Got it

> Previous message
> More previous message"""

    assert strip_quoted_reply(body) == "Got it"
