# Project 9 — Data Analytics & BI Dashboard

Full-stack business intelligence dashboard built for the Codec Technologies internship.
Visualizes sales data with KPIs, interactive charts, filters, CSV/Excel import, and CSV/PDF export.

**Tech stack:** React + Vite + Tailwind + Recharts (frontend) · Node.js + Express (backend) · PostgreSQL via Supabase (database)

---

## 1. Folder structure

```
bi-dashboard/
├── client/      → React frontend (deploy to Vercel)
└── server/      → Express API (deploy to Render)
```

Each folder is its own app with its own `package.json` — install and run them separately.

---

## 2. Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's created, go to **Project Settings → Database → Connection string → URI**. Copy it — this is your `DATABASE_URL`.
3. Go to the **SQL Editor** in Supabase, paste the contents of `server/schema.sql`, and run it. This creates the `products`, `orders`, `order_items`, and `imports` tables.

---

## 3. Backend setup (`server/`)

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
DATABASE_URL=<paste your Supabase connection string here>
PORT=5000
CLIENT_URL=http://localhost:5173
```

Seed sample data (so charts aren't empty on first run):

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

It should print `BI Dashboard API running on port 5000`. Test it at `http://localhost:5000/health`.

---

## 4. Frontend setup (`client/`)

```bash
cd client
npm install
cp .env.example .env
```

Open `.env` and confirm:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` — you should see KPIs, charts, and sample data.

---

## 5. Features implemented (vs PRD)

| Feature | Status |
|---|---|
| KPI cards (revenue, orders, AOV, top category, growth %) | ✅ |
| Revenue trend line chart | ✅ |
| Sales by category bar chart | ✅ |
| Revenue by region donut chart | ✅ |
| Top 10 products table (sortable) | ✅ |
| Date / category / region filters (sync across all charts) | ✅ |
| CSV import | ✅ |
| Excel (.xlsx) import | ✅ |
| Import validation + row skip summary | ✅ |
| Import history log | ✅ |
| CSV export | ✅ |
| PDF report export | ✅ |
| Dark / light mode | ✅ |
| JWT admin login | ⏸️ Marked optional/stretch in PRD — not built yet. Say the word and I'll add it using the same pattern as ExamShield. |
| Drag-and-drop column mapping UI for mismatched import headers | ⏸️ Simplified for now — the import checks for the required column names and tells you exactly which ones are missing/wrong, rather than a full visual mapping step. Listed as a fast v2 add-on. |

**Import file format:** one row = one product line in an order. Required columns:
`customer_name, order_date, region, category, product_name, price, quantity`.
Rows with the same customer + date + region are automatically grouped into one order.

---

## 6. Deployment (same pattern as ExamShield)

**Backend → Render**
1. Push this repo to GitHub.
2. Render → New → Web Service → connect the repo → set **Root Directory** to `server`.
3. Build command: `npm install` · Start command: `npm start`.
4. Add environment variables: `DATABASE_URL`, `PORT` (Render sets this automatically, you can leave your own as a fallback), `CLIENT_URL` (set this to your Vercel URL once you have it).

**Frontend → Vercel**
1. Vercel → New Project → import the repo → set **Root Directory** to `client`.
2. Framework preset: Vite.
3. Add environment variable: `VITE_API_URL` = your Render URL + `/api` (e.g. `https://your-app.onrender.com/api`).
4. Deploy.

After both are live, go back to Render and update `CLIENT_URL` to your real Vercel URL so CORS allows it.

---

## 7. Known gotchas to watch for (based on ExamShield experience)

- **Case sensitivity:** Vercel's build is Linux, so double-check import paths match file names exactly in case.
- **Render free tier cold starts:** first request after inactivity can take 20–30s — totally normal.
- **CORS:** if the frontend can't reach the API after deploy, it's almost always `CLIENT_URL` on the backend not matching the live Vercel URL exactly (no trailing slash).
- **Supabase connection from Render:** use the **Transaction pooler** connection string (port 6543) from Supabase if you hit connection limit errors on the free tier, instead of the direct connection (port 5432).
