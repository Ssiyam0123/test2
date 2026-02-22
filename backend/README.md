# Express Starter

**A minimal, modern starter template for building Express.js applications using Bun and Express.**

This repository provides a clean and scalable foundation for building REST APIs with Express, focusing on simplicity, best practices, and easy extensibility.

---

## 🚀 Features

* ⚡ **Bun runtime** (fast & modern)
* 🚂 **Express.js** for REST APIs
* 🧩 Modular folder structure
* 🌱 Environment variable support (`.env`)
* 🛡 Ready for middleware (auth, validation, logging)
* 🔌 Default plugged in databases (MongoDB)

---

## 📦 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Ssiyam0123/express-starter.git
cd express-starter
```

### 2️⃣ Install dependencies

```bash
bun install
```

### 3️⃣ Environment setup

```bash
cp .env.sample .env
```

Edit `.env` as needed:

```env
PORT=5000
NODE_ENV=development
```

---

## ▶️ Run the Server

```bash
bun run dev
```

Server will start at:

```
http://localhost:5000
```

---

## 🗂 Project Structure

```
.
├── src
│   ├── index.js          # App entry point
│   ├── lib/              # Library config
│   ├── routes/           # API routes
│   ├── models/           # Database models logic
│   ├── middlewares/      # Custom middlewares
├── .env.sample
├── package.json
├── tsconfig.json
└── bun.lock
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

### Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/books` | Create a new book (protected) |
| GET | `/api/books` | Get all books with pagination (protected) |
| GET | `/api/books/user` | Get books by logged-in user (protected) |
| DELETE | `/api/books/:id` | Delete a book by ID (protected) |


---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

MIT License © 2025 — Siyam

---

🚀 Happy building! This starter is designed to scale with your backend projects.
