# 💰 FinanceAI — AI-Powered Personal Finance Dashboard

A full-stack personal finance dashboard with **AI-powered insights**, smart transaction categorization, budget tracking, and interactive charts.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## 🚀 Features

### Core
- 🔐 **JWT Authentication** — Secure login & registration with bcrypt password hashing
- 💳 **Transaction Management** — Full CRUD with pagination, filtering, and sorting
- 🎯 **Budget Tracking** — Set monthly limits per category with real-time progress bars
- 📊 **Interactive Charts** — Pie (spending by category), Line (monthly trends), Bar (income vs expenses)

### AI-Powered ✨
- 🧠 **Smart Categorization** — Auto-categorizes transactions using keyword-based ML engine (Swiggy → Food, Uber → Transport, etc.)
- 📈 **Monthly Spending Comparison** — Analyzes current vs previous month with % change
- 🏆 **Category Analysis** — Identifies highest/lowest spending categories
- 🎉 **Behavioral Insights** — Weekend vs weekday spending patterns
- 🚨 **Anomaly Detection** — Flags unusually large transactions (3x average)
- 🔮 **Spending Forecast** — Predicts next month expenses based on 3-month average
- ✅ **Trend Tracking** — Per-category % change vs previous month

### Design
- 🌙 **Premium Dark Mode** — Glassmorphism cards, subtle gradients, smooth animations
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile
- ⚡ **Fast & Modern** — Built with Vite for instant HMR and fast builds

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Recharts, React Router |
| Backend | Node.js, Express |
| Database | SQLite (PostgreSQL-compatible schema) |
| Auth | JWT + bcrypt |
| Styling | Vanilla CSS with design tokens |

---

## 📁 Project Structure

```
finance-dashboard/
├── client/                  # React Frontend
│   └── src/
│       ├── components/      # Navbar, ProtectedRoute
│       ├── context/         # AuthContext (JWT state)
│       ├── pages/           # Dashboard, Transactions, Budgets, Login, Register
│       ├── api.js           # API utility with auth headers
│       ├── App.jsx          # Root component with routing
│       └── index.css        # Design system
├── server/                  # Express Backend
│   ├── routes/              # auth, transactions, budgets, accounts, insights
│   ├── services/            # categorizer, insights engine
│   ├── middleware/          # JWT auth middleware
│   ├── scripts/             # generateData.js (seed script)
│   ├── db.js                # SQLite setup + schema
│   └── server.js            # Express entry point
└── docs/                    # Documentation
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/finance-dashboard.git
cd finance-dashboard

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Seed the Database

```bash
cd server
node scripts/generateData.js
```

This creates 3 demo users with 200-500 realistic transactions each.

### 3. Start the App

**Terminal 1 — Backend:**
```bash
cd server
node server.js
# 🚀 API running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# ⚡ App running on http://localhost:5173
```

### 4. Login

```
Email: omesh@demo.com
Password: password123
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login & get JWT token |

### Transactions (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (paginated) |
| POST | `/api/transactions` | Add transaction (auto-categorized) |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Budgets (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get budgets with spent amounts |
| POST | `/api/budgets` | Set/update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### Accounts (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts` | List accounts |
| GET | `/api/accounts/balance` | Get balance + monthly summary |

### Insights (🔒 Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | Get AI-generated insights |

---

## 🏗️ Architecture

```
┌─────────────┐     HTTP/JWT      ┌─────────────┐     SQL      ┌──────────┐
│   React      │ ◄──────────────► │   Express    │ ◄──────────► │  SQLite  │
│   Frontend   │                  │   Backend    │              │    DB    │
│              │                  │              │              │          │
│  • Recharts  │                  │  • Auth MW   │              │  Users   │
│  • Router    │                  │  • Routes    │              │  Txns    │
│  • AuthCtx   │                  │  • Services  │              │  Budgets │
└─────────────┘                  └─────────────┘              └──────────┘
                                       │
                                 ┌─────┴─────┐
                                 │  Services  │
                                 │            │
                                 │ Categorizer│
                                 │ Insights   │
                                 └────────────┘
```

---

## 🚀 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Backend | Render / Railway | Set env vars: `JWT_SECRET`, `DATABASE_URL` |
| Database | Neon / Supabase | Migrate SQLite schema to PostgreSQL |
| Frontend | Vercel | Set `VITE_API_URL` env var |

---

## 📜 License

MIT
