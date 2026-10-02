# Render Deployment Guide: TradeJournal

This guide explains how to deploy the **TradeJournal: Forex Trading Journal & Analytics Application** to [Render](https://render.com) with **automated CI/CD deployment** linked directly to your GitHub `main` branch.

Every time you commit and push to `main`, Render will automatically detect the changes, trigger a fresh build, and deploy the updated application.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   GitHub Repository (main)  |
                      +--------------+--------------+
                                     |
                          git push (Webhook trigger)
                                     |
               +---------------------+---------------------+
               |                                           |
               v                                           v
   +-----------------------+                   +-----------------------+
   |  Render Static Site   |                   |   Render Web Service  |
   | (tradejournal-frontend)|                   | (tradejournal-backend)|
   |      React + Vite     |                   |    Node.js / Express  |
   +-----------+-----------+                   +-----------+-----------+
               |                                           |
               +---- Axios Requests (/api/*) ------------->+
                                                           |
                                                           v
                                              +------------------------+
                                              |  MongoDB Atlas Cluster |
                                              +------------------------+
```

---

## Step 1: Push Your Code to GitHub

Your local git repository has already been initialized and committed on the `main` branch.

1. Go to [GitHub](https://github.com/new) and create a new repository:
   - **Repository name**: `StockJournalApplication` (or `TradeJournal`)
   - Choose **Public** or **Private**
   - **Do NOT** initialize with a README, .gitignore, or license (these already exist locally)
   - Click **Create repository**

2. In your terminal / PowerShell at `e:\StockJournalApplication`, run:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/StockJournalApplication.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy to Render

You can deploy using either the **Automated Blueprint (`render.yaml`)** (Recommended) or the **Manual Dashboard Setup**.

### Option A: Render Blueprint (Recommended - 1 Click)

A `render.yaml` configuration is already included in the root directory.

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click the blue **New +** button in the top right corner and select **Blueprint**.
3. Connect your GitHub account and select your `StockJournalApplication` repository.
4. Render will inspect `render.yaml` and configure:
   - `tradejournal-backend` (Node Web Service)
   - `tradejournal-frontend` (Static Site with SPA rewrites)
5. Under Environment Variables, Render will ask for `MONGODB_URI`:
   - Paste your MongoDB Atlas connection string:
     ```env
     mongodb+srv://kiranruthalakiran_db_user:Hexyg5fi5tclFi1y@cluster0.bxn2nfj.mongodb.net/tradejournal?retryWrites=true&w=majority&appName=Cluster0
     ```
6. Click **Apply**.
7. Render will build and deploy both services automatically!

---

### Option B: Manual Dashboard Setup (Step-by-Step)

If you prefer to configure each service manually via the Render UI:

#### 1. Deploy the Backend Web Service

1. On the Render Dashboard, click **New +** -> **Web Service**.
2. Select your GitHub repository (`StockJournalApplication`).
3. Fill in the service details:
   - **Name**: `tradejournal-backend`
   - **Region**: Choose the region closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced Settings**:
   - **Auto-Deploy**: `Yes` (Triggered automatically on push to `main`)
   - **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add the following keys:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Render maps port dynamically |
   | `MONGODB_URI` | `mongodb+srv://kiranruthalakiran_db_user:Hexyg5fi5tclFi1y@cluster0.bxn2nfj.mongodb.net/tradejournal?retryWrites=true&w=majority&appName=Cluster0` | Your Atlas database URI |
   | `JWT_SECRET` | `supersecretjwtkey_tradejournal_forex_2026_change_in_production` | Secure random string |
   | `JWT_EXPIRES_IN` | `7d` | Token expiration |
   | `CLIENT_URL` | `https://tradejournal-frontend.onrender.com` | (Update with your frontend URL once created) |
6. Click **Create Web Service**.
7. Wait 2-3 minutes. When deployment finishes, copy your backend URL:
   `https://tradejournal-backend.onrender.com`

---

#### 2. Deploy the Frontend Static Site

1. On the Render Dashboard, click **New +** -> **Static Site**.
2. Select your GitHub repository (`StockJournalApplication`).
3. Fill in the service details:
   - **Name**: `tradejournal-frontend`
   - **Branch**: `main`
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Expand **Advanced Settings**:
   - **Auto-Deploy**: `Yes` (Triggered automatically on push to `main`)
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://tradejournal-backend.onrender.com/api` |
   *(Replace with your actual backend URL from Step 1, with `/api` at the end)*
6. Under **Redirects / Rewrites**, click **Add Rule**:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
   *(This ensures refreshing pages like `/dashboard`, `/journals`, and `/calendar` never 404)*
7. Click **Create Static Site**.

---

## Step 3: Verifying the Live Deployment

1. **Backend Health Check**:
   Open in your browser:
   `https://tradejournal-backend.onrender.com/api/health`
   You should see:
   ```json
   {
     "success": true,
     "message": "TradeJournal API is healthy and operational"
   }
   ```

2. **Frontend Application**:
   Open:
   `https://tradejournal-frontend.onrender.com`
   - Sign in with:
     - **Email**: `demo@tradejournal.com`
     - **Password**: `Password123!`
     *(Or sign in with `kiranruthalakiran@gmail.com`)*
   - Test recording a trade, viewing the calendar, and changing themes.

---

## Step 4: Automatic CI/CD Workflow

Once connected, your deployment is **100% automated**:

```bash
# 1. Make code changes in VS Code
# 2. Stage and commit
git add .
git commit -m "Enhance trade metrics and charts"

# 3. Push to GitHub main branch
git push origin main
```

* Render will detect the push via GitHub Webhook.
* Render will automatically trigger a new build and deploy both frontend and backend seamlessly.
* Zero downtime deployment with status updates in your Render dashboard.
