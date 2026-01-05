# PebbleNotes

PebbleNotes is a simple study notes marketplace with user authentication, email verification, secure file downloads, and password reset. It’s designed to be easy to run locally for college projects while keeping core flows realistic and secure.

## Overview
- Frontend: React + Vite, clean UI and mobile-friendly flows
- Backend: Express.js + PostgreSQL, JWT auth, Nodemailer for real emails
- Storage: local `/uploads` for previews, PDFs, and avatars
- Security: email verification gating, purchase-gated downloads

## Tech Stack
- Frontend: React 19 (Vite), Tailwind via CDN in [frontend/index.html](frontend/index.html)
- Backend: Express 4, PostgreSQL via `pg`, JWT (`jsonwebtoken`), `bcrypt`, `multer`, `nodemailer`

## Project Structure
```
PebbleNotes/
├─ backend/                 # Express API
│  ├─ src/
│  │  ├─ server.js         # Main server, routes, middleware
│  │  └─ repositories/     # Database access (users, notes, purchases, etc.)
│  ├─ uploads/             # previews/, pdfs/, avatars/
│  ├─ .env                  # Environment config (local)
│  └─ package.json
├─ frontend/               # React app
│  ├─ pages/               # Views: Login, Signup, Marketplace, NoteDetail, Profile, ResetPassword
│  ├─ components/          # Navbar, Footer, NoteCard
│  ├─ index.html           # App HTML + favicon/meta
│  ├─ index.jsx            # App bootstrap
│  └─ App.jsx              # Router and top-level app
├─ vite.config.js          # Vite dev server config
└─ README.md               # This documentation
```

## Setup
1) Backend
- Install: `cd backend && npm install`
- Copy env: `cp .env.example .env`
- Edit `.env` (see Environment below)
- Start: `npm run dev` (runs on `http://0.0.0.0:4000`)

2) Frontend
- Install: `npm install`
- Start: `npm run dev` (runs on `http://0.0.0.0:3000`)

## Environment (backend/.env)
- Networking
	- `BACKEND_URL`: e.g., `http://<LAN-IP>:4000` so mobile emails can reach the backend
	- `FRONTEND_URL`: e.g., `http://<LAN-IP>:3000` for CORS
	- `FRONTEND_URLS`: comma-separated list of allowed origins
- Database
	- `DATABASE_URL` or `DB_*` keys for PostgreSQL
- JWT
	- `JWT_SECRET`, `JWT_EXPIRES_IN`
- SMTP (real email sending)
	- Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER=<your@gmail.com>`, `SMTP_PASS=<app password (no spaces)>`, `SMTP_FROM="PebbleNotes <your@gmail.com>"`
	- SendGrid: `SMTP_HOST=smtp.sendgrid.net`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER=apikey`, `SMTP_PASS=<api key>`, `SMTP_FROM="PebbleNotes <no-reply@yourdomain.com>"`
- Admin dev bypass (optional)
	- `ADMIN_DEV_PASSWORD=<password>` and use header `x-admin-pass` for local admin uploads

## Key Features
- Signup with email verification (1-minute link): [backend/src/server.js](backend/src/server.js)
- Login blocks unverified; Sign In shows 60s countdown and Resend button: [frontend/pages/Login.jsx](frontend/pages/Login.jsx)
- Forgot password sends a reset link; Reset page updates password: [frontend/pages/ResetPassword.jsx](frontend/pages/ResetPassword.jsx)
- Profile: update info, upload avatar, change password, delete account: [frontend/pages/Profile.jsx](frontend/pages/Profile.jsx)
- Notes: browse, detail view, purchase, secure PDF download after purchase: [frontend/pages/NoteDetail.jsx](frontend/pages/NoteDetail.jsx)
- Admin upload (local dev): upload note preview/PDF with `x-admin-pass`: [backend/src/server.js](backend/src/server.js)

## Auth & Email Flows
- Registration
	- `POST /api/auth/register` creates user and sends verification email
	- Verification link expires in 1 minute; if expired, use Resend on Sign In
- Login
	- Blocks unverified users with a helpful banner + countdown and Resend
- Resend
	- `POST /api/auth/resend-verification` sends a fresh link
- Forgot / Reset
	- `POST /api/auth/forgot-password` emails a reset link to open on phone
	- `POST /api/auth/reset-password` updates the password using the token

## Files & Storage
- Static route: `/uploads` serves files
- Directories: `/uploads/previews`, `/uploads/pdfs`, `/uploads/avatars`
- Secure download: `GET /api/notes/:id/download` checks purchase or admin

## API Summary (high-level)
- Auth: `register`, `login`, `verify`, `me`, `resend-verification`, `forgot-password`, `reset-password`
- Users: `PUT /api/users/profile`, `POST /api/users/change-password`, `DELETE /api/users/me`, `POST /api/users/avatar`
- Notes: `GET /api/notes`, `GET /api/notes/:id`, `POST /api/notes` (admin/dev), `GET /api/notes/:id/download`
- Purchases: `GET /api/purchases`, `POST /api/purchases`, `GET /api/purchases/check/:noteId`
- Favorites/Reviews: `GET/POST/DELETE favorites`, `GET/POST reviews`

## Mobile & LAN Tips
- Use your machine’s LAN IP for `BACKEND_URL` and `FRONTEND_URL`
- Phone and computer must be on the same Wi‑Fi for local dev
- For off-network testing, use a tunnel (e.g., ngrok) and set URLs to the public tunnel

## Troubleshooting
- 535 Invalid login: Check Gmail App Password (2FA enabled), no spaces, `SMTP_FROM` matches your Gmail
- "wrong version number": Use `PORT=465 + SECURE=true` for SSL or `PORT=587 + SECURE=false` for STARTTLS
- Email previews in terminal: Means SMTP vars are missing; Ethereal test mode is used
- CORS errors: Ensure `FRONTEND_URL(S)` include your current frontend origin

## Quick Commands
```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (from project root)
npm install
npm run dev

# Test registration
curl -s -X POST http://<LAN-IP>:4000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"name":"Test","email":"you@gmail.com","password":"pass123","university":"Your Univ"}'
```

## Notes
- Keep `.env` secrets out of commits
- Use verified domains or Gmail for reliable SMTP