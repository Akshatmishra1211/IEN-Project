# INE Product Price Tracker & Scraper

Full-stack web application designed to search, track, and scrape product prices & stock over time from INE's hosted mock store ([https://demo.inelabteamdev.com/](https://demo.inelabteamdev.com/)). Built for the **INE Software Engineer Intern Assignment**.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-06b6d4)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-3b82f6)
![Scraper](https://img.shields.io/badge/Scraper-Playwright-10b981)
![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20PostgreSQL-3ecf8e)

---

## 🌟 Key Features

### Core Requirements
1. **Product Search & Selection**: Search products from INE's hosted mock store by partial/full product name, category, or SKU and track them with a single click.
2. **Reliable Scheduled Scraping**: Playwright-powered scraper equipped with **exponential backoff retries** (up to 3 attempts), cookie modal dismissal, hover interaction handling, and page shift detection.
3. **Price History & Audit Logs**: Interactive price history chart (Recharts) and an honest audit log table displaying timestamps, outcome status (`SUCCESS`, `RETRIED`, `FAILED`), duration in ms, and error details.
4. **Observable (Headed) Run Mode**: Support for running browser automation in visible/headed mode (`npm run scrape:headed`) for watching scraper behavior and creating screen recordings.

### Bonus Features Included
- 🔔 **Price-Drop & Back-In-Stock Alerts**: Configure target thresholds and email notifications.
- 📊 **Product Dashboard Metrics**: Aggregate stats on total tracked items, price drop counts, success rates, and last scraped timestamps.
- ⚡ **Page Structure Shift Detection**: Flags layout changes if target DOM elements shift.
- ⏰ **External Cron & GitHub Actions Scheduling**: Includes `.github/workflows/scrape_cron.yml` and `/api/cron/scrape-all` webhook endpoint.

---

## 🛠️ Software Setup & Installation Guide

### Prerequisites to Install
Before building the project, ensure you have the following installed on your machine:

1. **Node.js (v18.0.0 or higher)** & **npm**:
   - Download installer from [nodejs.org](https://nodejs.org/) or install via terminal:
     ```powershell
     winget install OpenJS.NodeJS.LTS
     ```
   - Verify installation:
     ```bash
     node -v
     npm -v
     ```
2. **Git**:
   - Verify Git installation:
     ```bash
     git --version
     ```

---

## 🚀 Quickstart: Running Locally

### Step 1: Install Project Dependencies
Run the following commands to install backend and frontend dependencies:

```bash
# 1. Install root & nested dependencies
npm run install:all

# 2. Install Playwright Chromium browser binaries
cd backend
npx playwright install chromium
```

---

### Step 2: Database Setup (Supabase)

1. Create a free project at [Supabase](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard and run the schema script located in:
   [`supabase/schema.sql`](file:///c:/Product%20Price%20Tracker/supabase/schema.sql)
3. Copy your project **URL** and **anon key** from Supabase Settings -> API.
4. Update `backend/.env`:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   CRON_SECRET=my_super_secret_cron_token_123
   ```

> *Note: If Supabase credentials are not provided initially, the app automatically runs in a local in-memory fallback mode for quick testing.*

---

### Step 3: Start Backend & Frontend

#### Terminal 1: Start Backend API & Scraper Server
```bash
cd backend
npm run start
# Running on http://localhost:5000
```

#### Terminal 2: Start Frontend Vite Dev Server
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🎥 Running the Observable (Headed) Scraper Demo

To observe the browser in visible headed mode (for screen recording):

```bash
# Run headed scraper CLI script (defaults to Product #155: Nordkraft Recovery Slide Mini)
npm run scrape:headed

# Or run against a custom Product ID:
node backend/src/scraper/headedRunner.js 344
```

You can also trigger a headed run directly from the UI dashboard by clicking **"Observable Run"** on any product card!

---

## ⏱️ Scraping Schedule & Cron Configuration

Because free-tier hosting (Render.com) puts idle containers to sleep, scraping is triggered via external HTTP cron hooks:

1. **cron-job.org**:
   - Create a free account on [cron-job.org](https://cron-job.org).
   - Add a job targeting: `https://your-render-app.onrender.com/api/cron/scrape-all`
   - Schedule: Every 2 hours (`0 */2 * * *`)
   - Add Header: `Authorization: Bearer my_super_secret_cron_token_123`

2. **GitHub Actions (Alternative Automated Schedule)**:
   - The repository includes `.github/workflows/scrape_cron.yml` which triggers automatically every 2 hours on GitHub servers!

---

## 🌐 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `SUPABASE_URL` | Supabase project URL | `https://...` |
| `SUPABASE_ANON_KEY` | Supabase public API key | `...` |
| `CRON_SECRET` | Bearer token to protect cron endpoint | `my_super_secret_cron_token_123` |

---

## 🚢 Deployment Guide

1. **Frontend (Vercel)**:
   - Connect your GitHub repository to [Vercel](https://vercel.com).
   - Set Root Directory to `frontend`.
   - Build Command: `npm run build`, Output Directory: `dist`.

2. **Backend (Render.com)**:
   - Create a new **Web Service** on [Render](https://render.com).
   - Set Root Directory to `backend`.
   - Build Command: `npm install && npx playwright install --with-deps chromium`
   - Start Command: `node src/index.js`
   - Add Environment Variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CRON_SECRET`).

---

## 📝 Design Note & Architecture Details
Read [`DESIGN_NOTE.md`](file:///c:/Product%20Price%20Tracker/DESIGN_NOTE.md) for an in-depth breakdown of anti-scraping bypass strategies, reliability trade-offs, and initial AI misconceptions & fixes.
