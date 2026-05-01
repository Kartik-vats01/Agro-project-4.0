# 🌾 Agro-Project 4.0 — Crop Recommendation System

![Python](https://img.shields.io/badge/Python-3.9+-blue?style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

> An intelligent crop recommendation system that helps farmers and agronomists make data-driven decisions based on soil parameters and climate conditions.

---

## 📁 Project Structure
Agro-project-4.0/
│
├── .vscode/
│   └── tasks.json
│
├── Agricredentials/
│   └── Agricredentials.sqlproj       # Database project file
│
├── backend/                          # Node.js backend (API layer)
│   ├── middleware/
│   │   └── auth.js                   # Authentication middleware
│   ├── models/
│   │   └── User.js                   # User database model
│   ├── routes/
│   │   └── auth.js                   # Auth routes (login/register)
│   ├── .env.example                  # Environment variable template
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js                     # Backend entry point
│
├── client/                           # Frontend (HTML/CSS/JS)
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── main.js
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── script.js
│   └── style.css
│
└── server/                           # Core recommendation server
├── middleware/
│   └── auth.js
├── routes/
│   ├── auth.js
│   ├── dashboard.js
│   └── db.js                     # Database connection
├── index.js
├── init.sql                      # Database initialization script
└── server.js                     # Main server entry point
---

## 🧱 Architecture Overview

The project follows a **3-layer architecture**:

| Layer | Folder | Role |
|---|---|---|
| Frontend | `client/` | HTML/CSS/JS user interface |
| API Backend | `backend/` | Authentication & user management |
| Core Server | `server/` | Crop recommendation logic & DB |

---

## ✨ Features

- 🌱 **Smart Crop Recommendations** — Predicts the best crop based on soil & climate inputs
- 🔐 **User Authentication** — Secure login & registration system
- 🗄️ **SQL Database** — Persistent storage via initialized SQL schema
- 📊 **Dashboard** — Visual results and recommendation history
- 🖥️ **Multi-page Frontend** — Dedicated pages for login, register, dashboard, and home
- 🔁 **Version 4.0** — Upgraded architecture over prior versions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | SQL (via `init.sql` + `.sqlproj`) |
| Auth | JWT / Middleware-based |
| Dev Tools | VS Code, npm |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm
- SQL Server or compatible SQL database
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Agro-project-4.0.git
cd Agro-project-4.0

# 2. Setup Backend
cd backend
cp .env.example .env        # Fill in your environment variables
npm install
node server.js

# 3. Setup Core Server (in a new terminal)
cd ../server
npm install                 # if package.json exists
node server.js

# 4. Open the Frontend
# Open client/index.html in your browser
# OR serve it via Live Server in VS Code
```

### Environment Variables (`backend/.env`)

```env
PORT=5000
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=agro_db
JWT_SECRET=your_jwt_secret_key
```

---

## 🗄️ Database Setup

Run the initialization script to create required tables:

```bash
# Using SQL Server CLI or your DB client, execute:
server/init.sql
```

Or open `Agricredentials/Agricredentials.sqlproj` in **Visual Studio** to manage the database project directly.

---

## 🌐 Pages

| Page | File | Description |
|---|---|---|
| Home | `client/index.html` | Landing page |
| Login | `client/login.html` | User login |
| Register | `client/register.html` | New user signup |
| Dashboard | `client/dashboard.html` | Crop recommendations & results |

---

## 🔐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login & receive JWT token |
| GET | `/api/dashboard` | Get crop recommendations (protected) |

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [Kartik Sharma](https://github.com/kartik-vats01)

---

> *Agro-Project 4.0 — Empowering farmers with data-driven decisions* 🌾
