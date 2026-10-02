# TradeJournal API Documentation

Comprehensive REST API specification for **TradeJournal: Forex Trading Journal & Performance Analytics**.

---

## 1. Overview & Base URL

- **Base URL**: `http://localhost:5000/api`
- **Response Format**: `application/json`
- **Authentication**: JWT Bearer token passed in the `Authorization` header:
  ```http
  Authorization: Bearer <jwt_access_token>
  ```

### Standard Response Envelopes

**Success Response (HTTP 200 / 201)**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response (HTTP 400 / 401 / 403 / 404 / 409 / 500)**:
```json
{
  "success": false,
  "message": "Descriptive human-readable error message"
}
```

---

## 2. Authentication APIs (`/api/auth`)

### 2.1 Register User
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "trader@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account registered successfully",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "_id": "674df...",
        "name": "Alex Rivera",
        "email": "trader@example.com",
        "avatar": "",
        "preferences": {
          "defaultCurrency": "USD",
          "defaultRiskReward": "1:2",
          "theme": "dark"
        }
      }
    }
  }
  ```

### 2.2 Login User
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "trader@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "_id": "674df...",
        "name": "Alex Rivera",
        "email": "trader@example.com",
        "avatar": ""
      }
    }
  }
  ```

### 2.3 Get Current User Session
- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Access**: Protected (Requires Bearer Token)

### 2.4 Update Profile
- **Method**: `PUT`
- **Endpoint**: `/api/auth/profile`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "name": "Alex Rivera, CMT",
    "avatar": "https://example.com/avatar.jpg",
    "preferences": {
      "defaultCurrency": "USD",
      "defaultRiskReward": "1:2.5",
      "theme": "dark"
    }
  }
  ```

### 2.5 Change Password
- **Method**: `PUT`
- **Endpoint**: `/api/auth/password`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "confirmNewPassword": "NewPassword123!"
  }
  ```

---

## 3. Trade APIs (`/api/trades`)

### 3.1 Create Trade
- **Method**: `POST`
- **Endpoint**: `/api/trades`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "instrument": "XAUUSD",
    "direction": "BUY",
    "status": "CLOSED",
    "entryPrice": 2650.50,
    "exitPrice": 2670.50,
    "entryDate": "2026-10-02T08:30:00.000Z",
    "entryTime": "08:30",
    "quantity": 0.20,
    "stopLoss": 2640.50,
    "takeProfit": 2670.50,
    "riskRewardRatio": "1:2",
    "profitLoss": 400.00,
    "result": "TP",
    "session": "London",
    "notes": "Entered after London liquidity sweep of previous day low.",
    "tags": ["Liquidity", "Breakout", "London Session"],
    "beforeTradeImage": "http://localhost:5000/uploads/trade-before.png",
    "afterTradeImage": "http://localhost:5000/uploads/trade-after.png"
  }
  ```

### 3.2 Get Trades (Filtered & Paginated)
- **Method**: `GET`
- **Endpoint**: `/api/trades`
- **Access**: Protected (Strictly filters by `req.user._id`)
- **Query Parameters**:
  - `page` (integer, default 1)
  - `limit` (integer, default 20)
  - `search` (string, searches instrument, tags, notes)
  - `instrument` (string, e.g. `XAUUSD`)
  - `direction` (`BUY` | `SELL`)
  - `result` (`TP` | `SL` | `BE` | `Manual Exit`)
  - `status` (`OPEN` | `CLOSED`)
  - `startDate`, `endDate` (ISO strings or YYYY-MM-DD)
  - `sortBy` (default `entryDate`), `sortOrder` (`desc` | `asc`)
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "trades": [ ... ],
      "pagination": {
        "total": 42,
        "page": 1,
        "pages": 3,
        "limit": 20
      }
    }
  }
  ```

### 3.3 Get Single Trade by ID
- **Method**: `GET`
- **Endpoint**: `/api/trades/:id`
- **Access**: Protected (Verifies ownership)

### 3.4 Update Trade
- **Method**: `PUT`
- **Endpoint**: `/api/trades/:id`
- **Access**: Protected (Verifies ownership)

### 3.5 Delete Trade
- **Method**: `DELETE`
- **Endpoint**: `/api/trades/:id`
- **Access**: Protected (Verifies ownership)

---

## 4. Daily P/L & Calendar APIs (`/api/daily-pnl`)

### 4.1 Save Manual Daily P/L
- **Method**: `POST`
- **Endpoint**: `/api/daily-pnl`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "date": "2026-10-02",
    "profitLoss": 90.00,
    "notes": "Good disciplined trading day."
  }
  ```

### 4.2 Get Monthly Calendar Aggregation
- **Method**: `GET`
- **Endpoint**: `/api/daily-pnl/calendar?month=2026-10`
- **Access**: Protected
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "month": "2026-10",
      "days": [
        {
          "date": "2026-10-02",
          "tradePnL": 90,
          "manualPnL": null,
          "effectivePnL": 90,
          "tradesCount": 2,
          "trades": [ ... ]
        }
      ]
    }
  }
  ```

### 4.3 Delete Manual Daily P/L
- **Method**: `DELETE`
- **Endpoint**: `/api/daily-pnl/:date`
- **Access**: Protected

---

## 5. Analytics APIs (`/api/analytics`)

### 5.1 Get Dashboard Analytics
- **Method**: `GET`
- **Endpoint**: `/api/analytics/dashboard`
- **Access**: Protected
- **Query Parameters**:
  - `range`: `today` | `week` | `month` | `last_month` | `3_months` | `year` | `all` | `custom`
  - `startDate`, `endDate` (if range = custom)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "range": "all",
      "metrics": {
        "totalTrades": 42,
        "totalPnL": 1245.00,
        "winRate": 64.3,
        "lossRate": 35.7,
        "profitFactor": 1.82,
        "averageWin": 85.00,
        "averageLoss": -42.00,
        "expectancy": 18.40,
        "maxDrawdown": 320.00,
        "currentStreak": { "type": "WIN", "count": 3 },
        "bestWinningStreak": 7,
        "equityCurve": [ ... ],
        "dailyPnL": [ ... ],
        "buyPerformance": { "trades": 24, "winRate": 66.7, "pnl": 820 },
        "sellPerformance": { "trades": 18, "winRate": 61.1, "pnl": 425 }
      },
      "instrumentAnalysis": [ ... ],
      "sessionAnalysis": [ ... ],
      "resultAnalysis": [ ... ],
      "recentTrades": [ ... ]
    }
  }
  ```

---

## 6. Screenshot Upload API (`/api/uploads`)

### 6.1 Upload Trade Screenshot
- **Method**: `POST`
- **Endpoint**: `/api/uploads/trade-image`
- **Access**: Protected
- **Content-Type**: `multipart/form-data`
- **Form Field**: `image` (File: PNG, JPG, JPEG, WEBP <= 5MB)
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
      "url": "http://localhost:5000/uploads/trade-17278912345.png",
      "filename": "trade-17278912345.png"
    }
  }
  ```
