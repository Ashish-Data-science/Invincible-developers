# 🏏 IPL Auction Strategy Decoder

> **Data storytelling project** — Uncover the winning strategies behind IPL auction spending using interactive visualisations.

[![Deploy](https://github.com/Ashish-Data-science/Invincible-developers/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ashish-Data-science/Invincible-developers/actions/workflows/deploy.yml)

---

## 🗂️ Project Structure

```
Invincible-developers/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD → GitHub Pages
│
├── frontend/                   # React + Vite + TailwindCSS + Recharts
│   ├── public/
│   │   └── data/               # ← Static JSON files served to the app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level views
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── data_pipeline/              # Python data processing
    ├── scripts/                # Individual processing scripts
    ├── raw_data/               # Raw CSVs / Excel (gitignored)
    ├── run_pipeline.py         # Master runner → writes JSON to frontend/public/data/
    └── requirements.txt
```

---

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Python Pipeline
```bash
cd data_pipeline
pip install -r requirements.txt
python run_pipeline.py
```

---

## 🌐 Deployment

Push to `main` → GitHub Actions automatically builds and deploys to:  
**`https://Ashish-Data-science.github.io/Invincible-developers/`**

> **First-time setup**: Go to **Settings → Pages → Source** and select **GitHub Actions**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS 3 |
| Charts | Recharts 2 |
| Icons | Lucide React |
| Data Pipeline | Python / Pandas / NumPy |
| Deployment | GitHub Actions + GitHub Pages |