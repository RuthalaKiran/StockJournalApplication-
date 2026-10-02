# TradeJournal

> **Forex Trading Journal & Performance Analytics**  
> A professional, full-stack trading journal web application designed for active forex and market traders to record, analyze, and optimize execution performance.

---

## 1. Project Overview

**TradeJournal** provides an institutional-grade trading terminal experience. It replaces messy spreadsheets and disjointed notes with a centralized, data-driven system.

Key benefits:
- **Trade Execution Logging**: Record entry/exit prices, position sizing, stop loss, take profit, automated Risk-to-Reward calculations, session tags, and trade notes.
- **Before & After Screenshots**: Upload high-resolution chart setups and execution results with zoom lightbox previews.
- **Dynamic Interactive Calendar**: Color-coded daily trading calendar with automated trade aggregation and manual reconciliation.
- **Performance Analytics Terminal**: Equity curves, win/loss distributions, profit factor, expectancy, peak-to-trough maximum drawdown, and streak counters.
- **Strict Data Isolation & Security**: Every query is strictly isolated to the authenticated user using JWT and bcrypt.

---

## 2. Key Features

- **Trading Instruments**: Built-in support for major forex pairs (`EURUSD`, `GBPUSD`, `USDJPY`, `XAUUSD`, etc.), crypto (`BTCUSD`, `ETHUSD`), plus Custom Instrument support.
- **Automated R:R Engine**: Automatically computes risk-to-reward ratio from price levels in standard `1:X` ratio notation (e.g. `1:2`, `1:1.5`), with manual override.
- **Outcome Badges**:
  - `TP` (Take Profit) → Green
  - `SL` (Stop Loss) → Red
  - `BE` (Break Even) → Amber
  - `Manual Exit` → Blue
- **Calendar P/L Color Logic**:
  - `P/L > 0` → Light Green background
  - `P/L < 0` → Light Red background
  - `P/L = 0` → Light Orange background
  - No P/L → Default calendar background
- **Executive KPI Dashboard**: Total P/L, Win Rate %, Loss Rate %, Profit Factor, Average Win, Average Loss, Expectancy per trade, Maximum Drawdown, and current winning/losing streaks.
- **Dark & Light Mode**: Default dark trading terminal with persistent light mode toggle.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS (custom dark terminal color palette)
- **Routing**: React Router DOM (protected layout architecture)
- **Charts**: Recharts (Area equity curve, daily bar chart, win/loss donut)
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT request/response interceptors

### Backend
- **Runtime**: Node.js v22
- **Web Framework**: Express.js REST API
- **Authentication**: JSON Web Token (JWT) with bcryptjs password hashing
- **File Uploads**: Multer with file type/size validation and Cloudinary / local static fallback
- **Database**: MongoDB Atlas with Mongoose ODM

---

## 4. Architecture & Folder Structure

```text
StockJournalApplication/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB Atlas connection
│   │   │   └── cloudinary.js       # Optional Cloudinary storage config
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, profile, password
│   │   │   ├── tradeController.js      # CRUD, filters, pagination
│   │   │   ├── dailyPnlController.js   # Manual P/L & calendar aggregation
│   │   │   ├── analyticsController.js  # KPI & chart calculations
│   │   │   └── uploadController.js     # Image upload handling
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT extraction & user attachment
│   │   │   ├── uploadMiddleware.js     # Multer file filter (PNG/JPG <= 5MB)
│   │   │   └── errorMiddleware.js      # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.js                 # User schema with bcrypt hooks
│   │   │   ├── Trade.js                # Trade schema with compound indexes
│   │   │   └── DailyPnL.js             # Unique compound index (userId + date)
│   │   ├── routes/                     # REST API route endpoints
│   │   ├── utils/
│   │   │   ├── calculations.js         # Win rate, expectancy, drawdown math
│   │   │   └── jwt.js                  # Token generation & verification
│   │   ├── scripts/
│   │   │   └── seed.js                 # Development sample data generator
│   │   ├── app.js                      # Express application configuration
│   │   └── server.js                   # Server bootstrap
│   ├── tests/
│   │   └── api.test.js                 # Calculation & unit tests
│   ├── uploads/                        # Local static image storage directory
│   ├── .env.example
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # Toast, Modal, Lightbox, Badge, ImageUpload
│   │   │   └── layout/                 # Top Navbar, Fixed Sidebar, AppLayout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User session & auth state
│   │   │   └── ThemeContext.jsx        # Persistent dark/light theme state
│   │   ├── pages/
│   │   │   ├── auth/                   # Login, Register
│   │   │   ├── Dashboard.jsx           # KPI metrics, equity curve, recent trades
│   │   │   ├── Journals.jsx            # All historical trades table & filters
│   │   │   ├── NewTrade.jsx            # 7-section trade entry & edit form
│   │   │   ├── TradeDetails.jsx        # Trade showcase with screenshot lightbox
│   │   │   ├── Calendar.jsx            # Monthly calendar with dynamic P/L colors
│   │   │   └── Settings.jsx            # Profile, password, preferences
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx      # Unauthenticated route protection
│   │   ├── services/                   # Axios API service clients
│   │   ├── App.jsx                     # Application routing definitions
│   │   ├── main.jsx                    # Vite React entrypoint
│   │   └── index.css                   # Tailwind styles and custom scrollbars
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── API.md                              # Complete REST API documentation
├── README.md                           # Documentation & setup guide
├── .gitignore
├── .env.example
└── package.json                        # Root workspace scripts
```

---

## 5. Environment Variables

Create `.env` inside `Backend/` based on `Backend/.env.example`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Atlas connection URI
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.bxn2nfj.mongodb.net/tradejournal?retryWrites=true&w=majority&appName=Cluster0

# JWT Authentication
JWT_SECRET=supersecretjwtkey_tradejournal_forex_2026_change_in_production
JWT_EXPIRES_IN=7d

# Optional Cloudinary Image Storage
# If left blank, screenshots will be saved locally in Backend/uploads/ and served via static URL
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 6. Installation & Quick Start

### 6.1 Install Dependencies
From the project root:
```bash
npm run install:all
```
Or individually:
```bash
cd Backend && npm install
cd ../Frontend && npm install
```

### 6.2 Configure MongoDB Atlas
In `Backend/.env`, replace `<db_username>` and `<db_password>` with your real MongoDB Atlas credentials:
```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.bxn2nfj.mongodb.net/tradejournal?retryWrites=true&w=majority&appName=Cluster0
```

### 6.3 Optional: Seed Demo Trades
To populate the database with 10–15 sample trades (XAUUSD, EURUSD, BTCUSD, etc.), run:
```bash
npm run seed
```
Demo account created:
- **Email**: `demo@tradejournal.com`
- **Password**: `Password123!`

### 6.4 Running the Application

**Option A — Running services in separate terminals (Recommended)**:

Terminal 1 (Backend API):
```bash
cd Backend
npm run dev
```
*Backend runs on `http://localhost:5000`*

Terminal 2 (Frontend Client):
```bash
cd Frontend
npm run dev
```
*Frontend runs on `http://localhost:5173`*

**Option B — Root workspace commands**:
```bash
npm run dev:backend
npm run dev:frontend
```

---

## 7. Running Backend Calculation Tests

```bash
cd Backend
npm test
```
Verifies:
- Accurate R:R calculation (`1:2`, `1:1.5`)
- Win rate & loss rate percentages
- Profit factor calculation
- Mathematical expectancy per trade
- Maximum peak-to-trough drawdown calculation

---

## 8. Screenshot Upload Setup

1. **Local Static Storage (Default, Zero Config)**:
   - When Cloudinary environment variables are blank, screenshots are safely validated and stored in `Backend/uploads/`.
   - Served statically via `http://localhost:5000/uploads/<filename>`.
2. **Cloudinary (Production Cloud Storage)**:
   - Add your Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) in `Backend/.env`.
   - Uploads automatically route to Cloudinary with secure CDN URLs.

---

## 9. Production Build

To build the client bundle for production:
```bash
cd Frontend
npm run build
```
Generates optimized static assets in `Frontend/dist/`.

---

## 10. Future Extension Points

Designed with clean modular services and schemas ready for:
- TradingView chart widget embeds
- Direct broker / MetaTrader 4/5 API trade sync
- Live market price feeds via WebSockets
- Economic news calendar overlays on the monthly calendar
- AI Trade Reasoning Analysis using Google Gemini
- CSV/PDF journal export
