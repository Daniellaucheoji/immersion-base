# Immersion

Next.js site for [enterimmersion.com](https://enterimmersion.com), including the guest check-in kiosk for **play.enterimmersion.com** and the queue admin at **/admin**.

## Apps in this repo

| Surface | URL | Purpose |
| --- | --- | --- |
| Marketing site | `enterimmersion.com` | Existing Immersion marketing pages (Sanity CMS) |
| Guest kiosk | `play.enterimmersion.com` (or `/play`) | Minimal check-in → queue number |
| Admin | `enterimmersion.com/admin` | Registration list + queue status updates |

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in Neon DATABASE_URL, SMTP, and ADMIN_SESSION_SECRET
npm run dev
```

- Kiosk (local): [http://localhost:3000/play](http://localhost:3000/play)
- Admin (local): [http://localhost:3000/admin](http://localhost:3000/admin)

## Neon setup

1. Create a Neon project and copy the connection string into `DATABASE_URL`.
2. Run [`neon/schema.sql`](./neon/schema.sql) in the Neon SQL Editor.

Registrations are stored in `immersion_kiosk_registrations`. Admin OTP codes are stored in `immersion_admin_otps`. All reads/writes go through Next.js API routes using the Neon serverless driver.

## Guest flow

1. Guest sees Immersion logo on the CPad and taps **Check In**.
2. Enters name, email, phone; selects **VR** or **FIFA**; accepts the health & safety disclaimer.
3. On submit, a row is inserted and a unique **queue number** is returned.
4. Acknowledgment email is sent via nodemailer (SMTP).
5. When staff sets status to **Ready** in admin, a second email goes out: *Your Immersion experience is ready.*

## Admin access

1. Sign in at `/admin` with any **@nodeclub.co** email.
2. A 6-digit one-time code is emailed via SMTP.
3. Enter the code to open the guest queue.

## Environment

See [`.env.example`](./.env.example):

- `DATABASE_URL` — Neon Postgres connection string
- `NEXT_PUBLIC_EVENT_NAME` — stored on each registration
- `ADMIN_SESSION_SECRET` — signs admin session cookies
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` — nodemailer

## Deploy notes

Point both `enterimmersion.com` and `play.enterimmersion.com` at this Next.js deployment. Middleware rewrites the play hostname root to `/play`.
