# Mail Cases API (FastAPI)

Case-based Gmail sync with MongoDB (Motor), Cloudflare R2 attachments, and JWT auth shared with the Next.js app.

## Local development

From this directory:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in .env (MongoDB, Google OAuth refresh token, R2, BACKEND_JWT_SECRET)
DISABLE_BACKGROUND_SYNC=1 uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

`DISABLE_BACKGROUND_SYNC=1` skips the Gmail polling loop (useful when Gmail credentials are not configured yet).

### Gmail refresh token

Create OAuth 2.0 credentials (Desktop or Web) in [Google Cloud Console](https://developers.google.com/workspace/guides/create-credentials), enable the Gmail API, then complete the OAuth flow to obtain a **refresh token**. Official guide: [Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/oauth2). Store the refresh token in `GOOGLE_REFRESH_TOKEN` — never commit it.

### Tests

```bash
cd backend
pytest
```

## Railway

1. Create a Railway service from this repo; set the **root directory** to `backend` (or deploy only the `backend` folder).
2. Railway sets `PORT` automatically; the Docker `CMD` uses it.
3. Configure environment variables from `.env.example` (production values, no secrets in git).

Required env vars: see `backend/.env.example`.

## Assignment policy for new cases

When an inbound thread does not match an existing Gmail thread:

1. If the subject contains `[CASE-XXXX]` and that case exists **and** belongs to the same client, the thread is attached to that case.
2. Otherwise, if the client has an **open** case, it is reused.
3. Otherwise a new `CASE-XXXX` is created. Assignee order: `clients.default_owner_id` if set; else **round-robin** among `users` with `role=employee` (sorted by `_id`); if none, the first `admin` by `_id`.

## JWT auth

The Next.js app mints an HS256 JWT with `sub` (Account ObjectId), `role` (`admin` | `employee`), and `email`. The backend verifies with `BACKEND_JWT_SECRET` and loads the user from the `users` collection in the same database.
