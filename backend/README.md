# PebbleNotes Backend

## Setup
- Install deps: `npm install`
- Copy env: `cp .env.example .env` and fill values
- Start dev server: `npm run dev`

## Real Email Sending (SMTP)
This project uses Nodemailer. If SMTP variables are present, real emails are sent; otherwise a test (Ethereal) inbox is used.

Configure these in `.env`:
- `SMTP_HOST`: SMTP server hostname (e.g., smtp.sendgrid.net or smtp.gmail.com)
- `SMTP_PORT`: 587 for TLS, 465 for SSL
- `SMTP_SECURE`: `false` for 587, `true` for 465
- `SMTP_USER`: Username (e.g., `apikey` for SendGrid, full email for Gmail)
- `SMTP_PASS`: Password or API key
- `SMTP_FROM`: Displayed sender, e.g., `PebbleNotes <no-reply@yourdomain.com>`
- `BACKEND_URL`: e.g., `http://localhost:4000` (used in verification links)
- `FRONTEND_URL`: e.g., `http://localhost:5173`

### Provider Notes
- Gmail: Create an App Password (Account → Security → App passwords) and use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER=your@gmail.com`, `SMTP_PASS=your-app-password`.
- SendGrid: Use `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER=apikey`, `SMTP_PASS=<your API key>`.

## Test Email Verification
1. Ensure `.env` has SMTP settings.
2. Register a user via the frontend (Signup page) or cURL:

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Test User","email":"you@domain.com","password":"pass123","university":"Your Univ"}'
```

3. Check your inbox for "Verify your PebbleNotes account" and click the link.
4. Login should now work after verification.

## Notes
- CORS: set `FRONTEND_URL` or `FRONTEND_URLS` for multiple origins.
- Admin upload bypass (local only): set `ADMIN_DEV_PASSWORD` and pass header `x-admin-pass` when uploading.