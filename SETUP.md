# Ratan Jewellers — Team Setup Guide

> Follow these steps every time you pull the code fresh.

---

## Step 1 — Backend .env

```bash
cd backend
cp .env.example .env
```

Fill in `backend/.env` (minimum required):

```env
MONGODB_URI=mongodb://localhost:27017/ratan_jewellers
JWT_SECRET=ratan-jewellers-secret-2025
JWT_REFRESH_SECRET=ratan-jewellers-refresh-2025
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Step 2 — Frontend .env

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 3 — Install & Seed

```bash
# Backend
cd backend
npm install
npm run seed      ← creates all accounts in your local MongoDB

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Step 4 — Start Backend

```bash
cd backend
npm run dev
```

---

## Login Credentials (after seed)

| Role              | Email                              | Password             |
|-------------------|------------------------------------|----------------------|
| SUPER_ADMIN       | superadmin@ratanjewellers.com      | SuperAdmin@2025#RJ   |
| SUPER_ADMIN       | rajesh@ratanjewellers.com          | SuperAdmin@2025#RJ   |
| ADMIN             | admin@ratanjewellers.com           | Admin@2025#RJ        |
| ADMIN             | priya@ratanjewellers.com           | Admin@2025#RJ        |
| STORE_MANAGER     | manager@ratanjewellers.com         | Manager@2025#RJ      |
| SALES_STAFF       | sales@ratanjewellers.com           | Sales@2025#RJ        |
| INVENTORY_MANAGER | inventory@ratanjewellers.com       | Inventory@2025#RJ    |
| CUSTOMER          | customer@ratanjewellers.com        | Customer@2025#RJ     |

**Admin Panel:** http://localhost:3000/admin/login  
**Store:** http://localhost:3000

---

## Common Issues

| Error | Fix |
|-------|-----|
| `secretOrPrivateKey must have a value` | `backend/.env` is missing — run `cp .env.example .env` |
| `Invalid email or password` | Run `npm run seed` to create accounts in your local DB |
| `Authentication required` on admin pages | Token mismatch — logout and login again |
| `MONGODB_URI not found` | Add `MONGODB_URI=mongodb://localhost:27017/ratan_jewellers` to `.env` |
