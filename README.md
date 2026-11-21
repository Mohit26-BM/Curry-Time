# Curry Time

A website for **Curry Time**, an Indian restaurant in Faridabad, Haryana. Visitors can read the menu, browse the gallery, create an account, request a table and send a message. The restaurant gets an email for each booking and message, and everything is also saved in a database.

The frontend is plain HTML, CSS and a little JavaScript. The backend is a small Node.js / Express API with SQLite. Express serves both from the same address, so there is nothing to configure between them.

## Features

- **Pages:** Home, Menu, Gallery, About, Contact (with the booking form), Login, Sign up, My Bookings.
- **Accounts:** sign up, log in, log out. Passwords are hashed and the login lives in a secure cookie.
- **Table requests:** guests and logged-in users can request a table. Logged-in users see their requests under **My Bookings**.
- **Contact form:** saved to the database and emailed to the restaurant, with a confirmation email to the sender.
- **Admin API:** an admin can list reservations and mark them pending, confirmed or cancelled (see [Admin](#admin)).
- **Email is optional.** Without SMTP settings the site still works and saves everything to the database.

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript, WebP images |
| Backend | Node.js 20, Express 4 |
| Database | SQLite (`better-sqlite3`) |
| Auth | `bcryptjs` password hashes, JWT in an httpOnly cookie |
| Validation | `express-validator` |
| Email | Nodemailer |
| Security | `helmet`, `cors`, `express-rate-limit` |

## Getting started

Requires **Node.js 20**.

```bash
cd backend
npm install
cp .env.example .env     # Windows PowerShell: copy .env.example .env
```

Open `backend/.env` and set `JWT_SECRET`. Create one with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then start the site:

```bash
npm start        # or: npm run dev   (restarts when files change)
```

Open <http://localhost:3000>.

> **Windows:** `better-sqlite3` ships ready-made binaries for Node 20, so `npm install` normally just works. If it tries to compile and fails, install the "Desktop development with C++" tools from [Build Tools for Visual Studio](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022) and try again.

### Environment variables

Set these in `backend/.env` (template: `backend/.env.example`).

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | **yes** | Signs login cookies. At least 32 random characters. The server will not start without it. |
| `PORT` | no | Port to listen on (default `3000`). |
| `NODE_ENV` | no | Set to `production` when deployed: turns on secure cookies, HTTPS-only headers and hides error details. |
| `ALLOWED_ORIGIN` | no | The address the site is served from, for example `https://curry-time.onrender.com`. Used for the cross-site request check. |
| `TRUSTED_PROXY_HOPS` | no | Number of proxies in front of the app. Set `1` on Render so each visitor gets their own rate limit. |
| `DB_PATH` | no | Where the SQLite file lives (default `backend/data/curry_time.db`). |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | no | Outgoing email. For Gmail, turn on 2-step verification and create an [App Password](https://myaccount.google.com/apppasswords). |
| `RESTAURANT_EMAIL` | no | Where booking and contact emails are sent. |

## Admin

Nobody can sign up as an admin. Sign up on the website first, then promote that account from the `backend` folder:

```bash
npm run make-admin -- owner@example.com
```

Admins can then use the reservation API below (there is no admin web page yet).

## API

All routes are under `/api`. Errors look like `{ "success": false, "message": "..." }`.

| Method | Route | Who | What it does |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | anyone | Create an account and log in |
| POST | `/api/auth/login` | anyone | Log in |
| POST | `/api/auth/logout` | anyone | Log out |
| GET | `/api/auth/session` | anyone | The current user, or `user: null` (used by every page) |
| GET | `/api/auth/me` | logged in | The current user, or 401 |
| POST | `/api/contact` | anyone | Send a message |
| POST | `/api/reservations` | anyone | Request a table |
| GET | `/api/reservations/my` | logged in | My own requests |
| GET | `/api/reservations` | admin | All requests (`?date=YYYY-MM-DD&status=pending`) |
| PATCH | `/api/reservations/:id/status` | admin | Set `pending`, `confirmed` or `cancelled` |
| GET | `/healthz` | anyone | Health check for the host |

## Deploying (for example on Render)

1. Build command `cd backend && npm install`, start command `cd backend && npm start`.
2. Set `NODE_ENV=production`, `JWT_SECRET`, `ALLOWED_ORIGIN` (your site address) and `TRUSTED_PROXY_HOPS=1`. Add the `SMTP_*` and `RESTAURANT_EMAIL` values if you want emails.
3. Use `/healthz` as the health check path.
4. **Attach a persistent disk** and point `DB_PATH` at it. Without one, SQLite lives on temporary storage and accounts and bookings disappear on every redeploy.

## Project structure

```text
backend/
  server.js                 starts the server (refuses to run without a strong JWT_SECRET)
  scripts/make-admin.js     promote an account to admin
  src/
    app.js                  middleware, security headers, routes
    config/                 database.js, email.js, secret.js
    middleware/             auth, rate limits, validation, error handler
    controllers/            auth, contact, reservations
    routes/                 auth, contact, reservations, validators
    utils.js                HTML escaping for emails
frontend/
  *.html                    the eight pages
  css/style.css             shared styles
  js/                       nav, forms, toast, my bookings
  img/                      WebP photos and brand images
```

## Security

- **Passwords** are hashed with bcrypt (cost 12). Logging in takes the same time for unknown emails as for wrong passwords.
- **Login cookie** is `httpOnly` and `SameSite=Strict` (and `Secure` in production). Tokens are pinned to HS256 and expire after 7 days.
- **Checks on every input:** types, lengths, email, phone, date (not in the past, within a year), time slot and guest count are validated on the server. Nothing the visitor types is put into a database query directly.
- **Emails:** visitor text is escaped before it goes into an email, and line breaks are removed from subjects, so a visitor cannot inject links or extra headers.
- **Bookings page:** booking notes are escaped before they are shown.
- **Rate limits:** login and sign-up 10 per 15 minutes, contact 5 per hour, bookings 10 per hour, everything else 300 per 15 minutes.
- **Headers:** a strict Content-Security-Policy, no framing, no sniffing, no caching of API responses. Requests from other sites are refused.
- **Body size** is capped at 10 KB.

## Known limitations

- **Data on free hosting.** SQLite on a host without a persistent disk loses its data on redeploy.
- **No admin web page.** Admins work through the API (for example with Postman or curl).
- **Bookings are requests, not guaranteed tables.** There is no check for how many tables are free, no opening-hours logic and no way for a guest to cancel or change a request online.
- **Placeholders on the pages.** "Forgot password?", "Remember me", "Terms & Conditions" and "Privacy Policy" are not connected to anything yet. The gallery says more photos are coming soon.
- **No email verification and no password reset.**
- **Login cannot be revoked.** Logging out clears the cookie, but a copied token stays valid until it expires (7 days).
- **Rate limits are kept in memory.** They reset when the server restarts and are not shared between several servers.
- **Emails are sent once, without retry.** A failed email is logged but not queued.
- **The menu, prices and the numbers on the home page are fixed text in the HTML.** There is no menu editor. The "15+ years / 50+ items / 10k+ guests" figures should be checked by the owner before the site goes public.
- **Styles allow inline CSS** (`'unsafe-inline'` for styles in the Content-Security-Policy) because the pages contain inline `<style>` blocks.

## Possible improvements

**High priority**
- Move to a hosted database (Postgres) or attach a disk, so data survives deploys.
- Build a small admin page for bookings and messages.
- Add password reset by email and email verification.
- Check table availability and opening hours when a booking is requested, and let guests cancel.

**Medium priority**
- Replace the placeholder links (Terms, Privacy, Forgot password) with real pages.
- Move the inline styles into the shared stylesheet and tighten the CSP.
- Keep the menu in a data file or table so prices can be edited without touching HTML.
- Add automated tests and a CI check to the repository.

**Low priority**
- Store sessions on the server so logins can be revoked.
- Queue and retry emails.
- Add a sitemap, social preview images and structured data for search engines.
