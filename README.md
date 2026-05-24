# Curry Time — Restaurant Website

A full-stack restaurant website for **Curry Time**, an authentic Indian restaurant in Faridabad, Haryana.
The frontend is plain HTML/CSS; the backend is a production-ready Node.js/Express API with SQLite, JWT auth, and email notifications.

---

## Project Structure

```text
Curry Time/
├── frontend/                   # Static site served by Express
│   ├── css/style.css
│   ├── img/
│   ├── js/
│   │   ├── toast.js            # Toast notification utility
│   │   ├── nav.js              # Auth-aware navbar (shows name / My Bookings / logout)
│   │   ├── contact.js          # Contact form → POST /api/contact
│   │   ├── auth.js             # Login & signup → /api/auth/*
│   │   ├── reservation-form.js # Book-a-table form → POST /api/reservations
│   │   └── my-reservations.js  # Protected reservations page (redirects if not logged in)
│   ├── index.html
│   ├── menu.html
│   ├── gallery.html
│   ├── about.html
│   ├── contact.html            # Includes book-a-table section (#book-table)
│   ├── login.html
│   ├── signup.html
│   └── my-reservations.html   # Protected — shows logged-in user's bookings
│
├── backend/
│   ├── server.js               # Entry point
│   ├── package.json
│   ├── .env.example            # Copy to .env and fill in values
│   └── src/
│       ├── app.js              # Express app (middleware + routes)
│       ├── config/
│       │   ├── database.js     # SQLite setup & schema init
│       │   └── email.js        # Nodemailer transporter
│       ├── middleware/
│       │   ├── auth.js         # JWT cookie authentication
│       │   ├── errorHandler.js
│       │   ├── rateLimiter.js  # Per-route rate limits
│       │   └── validate.js     # express-validator helper
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── contactController.js
│       │   └── reservationController.js
│       └── routes/
│           ├── auth.js         # /api/auth/*
│           ├── contact.js      # /api/contact
│           └── reservations.js # /api/reservations
│
└── README.md
```

---

## API Reference

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Login, sets httpOnly cookie |
| POST | `/api/auth/logout` | — | Clear cookie |
| GET | `/api/auth/me` | Cookie | Get current user |
| POST | `/api/contact` | — | Submit contact form (saves to DB + sends email) |
| POST | `/api/reservations` | — | Request a table (saves to DB + sends email; links to user if logged in) |
| GET | `/api/reservations/my` | Cookie | Get current user's reservations |
| GET | `/api/reservations` | Admin | List all reservations |
| PATCH | `/api/reservations/:id/status` | Admin | Update reservation status |

---

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

> **Windows note:** `better-sqlite3` uses native bindings. If `npm install` fails, install
> [Build Tools for Visual Studio](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
> (select "Desktop development with C++") then retry.

### 2. Configure environment

```bash
cd backend
copy .env.example .env  
```

Open [backend/.env.example](backend/.env.example) and fill in:

| Variable | Description |
| -------- | ----------- |
| `JWT_SECRET` | Random 64-char hex (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail [App Password](https://myaccount.google.com/apppasswords) (16 chars, requires 2FA) |
| `RESTAURANT_EMAIL` | Where contact/reservation emails are delivered |

### 3. Run

```bash
npm run dev    # development — auto-reload via nodemon
npm start      # production
```

Visit **<http://localhost:3000>** — Express serves both the frontend and the API from the same origin.

---

## Database

SQLite is created automatically at `backend/data/curry_time.db` on first run — no migrations needed.

**Tables:** `users` · `reservations` · `contact_messages`

---

## Security

- `helmet` — secure HTTP headers + CSP
- `cors` — origin-locked, credentials enabled
- `express-rate-limit` — auth: 10/15 min · contact: 5/hr · general API: 100/15 min
- `bcryptjs` — passwords hashed at cost factor 12
- JWT stored in `httpOnly; SameSite=Strict` cookies (XSS-safe)
- `express-validator` — server-side validation on every endpoint
- Request body capped at 10 KB

---

## Restaurant Info

| | |
| - | - |
| **Address** | F-89/23, Eros Gardens, Faridabad 121001, Haryana |
| **Phone** | 0129-4244444 / 011-40665555 |
| **Email** | <CurryTimes26@gmail.com> |
| **Hours** | Daily, 11:00 AM – 11:00 PM |
| **Est.** | 2008 |
