# 🛡️ GuardAI – Content Moderation

Real-time AI content moderation powered by Claude AI, deployed on Vercel.

---

## 📁 Project Structure

```
guardai/
├── index.html          ← Frontend UI
├── api/
│   └── predict.js      ← Vercel serverless function (calls Anthropic API)
├── vercel.json         ← Vercel routing config
├── .gitignore
├── .env.example        ← Environment variable template
└── README.md
```

---

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/guardai.git
git push -u origin main
```

### Step 2 — Import in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `guardai` repo
4. Leave all build settings as default (no framework needed)
5. Click **Deploy**

### Step 3 — Add your Anthropic API Key

1. In Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your key from [console.anthropic.com](https://console.anthropic.com))
   - **Environment:** Production + Preview + Development
3. Click **Save**
4. Go to **Deployments** → click the 3-dot menu on your latest deploy → **Redeploy**

---

## 💻 Run Locally

```bash
npm i -g vercel     # install Vercel CLI once
cp .env.example .env.local
# edit .env.local and paste your real API key
vercel dev          # starts at http://localhost:3000
```

---

## ⚙️ How It Works

1. User types text → browser POSTs to `/api/predict`
2. `/api/predict` (serverless function) forwards request to Anthropic Claude API using your **server-side** API key (never exposed to the browser)
3. Claude returns a structured JSON moderation result
4. Frontend renders the verdict, risk score ring, and per-category breakdown

---

## 🔑 Getting an Anthropic API Key

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-`)
