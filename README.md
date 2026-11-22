# LeadFlow – Lead Manager

A small full-stack app for sales users to capture and track leads. Each user signs up, logs in and sees only their own leads.

**Stack:** React 19 + Vite (frontend) · Node.js + Express 5 (API) · MongoDB Atlas + Mongoose (database) · JWT + bcrypt (auth) · Playwright (API and UI tests)

**🔗 Live demo:** https://lead-manager-rho-rouge.vercel.app
**⚙️ API:** https://leadflow-api-sc92.onrender.com

> The API is on Render's free tier, so after a period of inactivity the first request can take ~30–50 seconds while the server wakes up.

## Features

### Core
- **Add a lead** with name, email, phone, company, source (dropdown) and status (New / Contacted / Qualified / Lost)
- **List leads** in a table with colour-coded status badges
- **Edit a lead** and update its status
- **Delete a lead**, with a confirmation step
- **Search** by name, email or company, and **filter** by status
- **Validation on both sides:** required fields, email format, Indian phone format, allowed source/status values

### Bonus
- **Authentication:** signup and login with JWT. Passwords are hashed with bcrypt. Every lead belongs to one user, and the API only returns or changes that user's leads.
- **Pagination** (10 per page) and **sorting** (newest, oldest, name A–Z, name Z–A)
- **Dashboard counts:** total leads and leads per status
- **Automated tests:** API tests plus end-to-end UI tests in Playwright
- Light and dark theme

## Project structure

```
lead-manager/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # authController, leadController
│   ├── middleware/auth.js        # JWT "protect" middleware
│   ├── models/                   # User, Lead (Lead.owner -> User)
│   ├── routes/                   # /api/auth, /api/leads
│   └── server.js
├── frontend/
│   └── src/
│       ├── App.jsx               # dashboard, table, modal, pagination
│       ├── AuthPage.jsx          # login / signup
│       └── services/api.js       # fetch wrapper and token handling
├── tests/                        # Playwright: api.spec.js plus UI specs
└── playwright.config.js
```

## Running locally

**You need:** Node.js 20 or newer, and a MongoDB Atlas cluster (or a local MongoDB).

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # then fill in MONGO_URI and JWT_SECRET
npm run dev                 # http://localhost:5000

# 2. Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

### Environment variables

| File | Variable | Description |
|---|---|---|
| backend/.env | `MONGO_URI` | MongoDB connection string |
| backend/.env | `JWT_SECRET` | Long random string used to sign tokens (required) |
| backend/.env | `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| backend/.env | `CLIENT_URL` | Deployed frontend URL(s), comma-separated, used for CORS |
| backend/.env | `PORT` | Default `5000` |
| frontend/.env | `VITE_API_URL` | API base URL, ending in `/api` |

## API reference

`Private` routes need the header `Authorization: Bearer <token>`.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | Public | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Private | The current user |
| GET | `/api/leads` | Private | The user's leads, newest first |
| POST | `/api/leads` | Private | Create a lead |
| PUT | `/api/leads/:id` | Private | Update a lead (only the user's own) |
| DELETE | `/api/leads/:id` | Private | Delete a lead (only the user's own) |

**Errors:** `400` validation error · `401` not logged in or bad token · `404` lead not found or owned by someone else · `409` email already registered

## Tests

Run these from the repo root. Playwright starts both dev servers itself if they aren't already running.

```bash
npm install
npx playwright install chromium   # first time only
npm test            # everything
npm run test:api    # API tests only (auth, CRUD, validation, per-user isolation)
npm run test:ui     # browser tests (auth flow, add/edit/delete, search, validation, pagination)
npm run report      # open the last HTML report
```

> The tests create throw-away users (`*@example.com`) in whichever database `MONGO_URI` points to. Use a separate dev or test database.

## Deployment (Render + Vercel)

**1. MongoDB Atlas:** under *Network Access*, allow `0.0.0.0/0` so Render can connect.

**2. Backend on Render** (New → Web Service, from this repo)
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (fill in after step 3)

**3. Frontend on Vercel** (New Project, from this repo)
- Root directory: `frontend` (Vercel detects Vite)
- Environment variable: `VITE_API_URL=https://<your-backend>.onrender.com/api`

**4. Connect them:** set `CLIENT_URL=https://<your-frontend>.vercel.app` on Render and redeploy. Then put both live links at the top of this README.

> Render's free tier sleeps when idle, so the first request after a break can take about 30 seconds.

## Design notes
- **Validation runs in three places:** the frontend for quick feedback, the controller for required fields, and the Mongoose schema as the source of truth.
- **Users can't touch each other's leads.** Every query filters on `owner: req.user._id`. Asking for another user's lead returns `404` rather than `403`, so the API doesn't reveal that the lead exists.
- **Clients can't change the owner.** Create and update only accept the editable fields; `owner` always comes from the token.
- **Pagination and sorting happen in the browser.** The dashboard counts need every lead anyway, and a single user's list is small.
