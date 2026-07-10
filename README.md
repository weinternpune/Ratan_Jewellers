# 💎 Ratan Jewellers — Digital Commerce Platform

A complete, production-grade digital commerce platform for a luxury jewellery store. Built with Next.js 14, Node.js, PostgreSQL, and all integrations.

## 🌟 Features

| Module | Status | Description |
|--------|--------|-------------|
| 🛍️ Storefront | ✅ | Luxury homepage, product listing, detail pages |
| 🛒 E-Commerce | ✅ | Cart, wishlist, checkout, Razorpay payment |
| 📋 GST Billing | ✅ | Auto-invoice, PDF generation, WhatsApp delivery |
| 📦 Inventory | ✅ | Stock management, barcode, low-stock alerts |
| 👥 CRM | ✅ | Customer profiles, loyalty points, communications |
| 📊 Analytics | ✅ | Revenue, inventory, customer dashboards |
| 💬 WhatsApp | ✅ | Meta Business API with retry + SMS fallback |
| 🔐 Auth | ✅ | JWT, role-based access, refresh tokens |
| 🔑 Admin | ✅ | Full admin panel with 6 user roles |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/ratan-jewellers.git
cd ratan-jewellers
```

### Step 2: Backend Setup
```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Create admin users (IMPORTANT!)
npm run seed:staff

# Start backend server
npm run dev
```

**Backend will run on:** http://localhost:5000

### Step 3: Frontend Setup (new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start frontend (No .env.local needed! Auto-connects to localhost:5000)
npm run dev
```

**Frontend will run on:** http://localhost:3000

**✨ AUTO-CONFIG:** Frontend automatically connects to `localhost:5000`. No manual `.env.local` setup needed!  
**⚙️ OPTIONAL:** Create `.env.local` only if using custom backend URL:
```bash
# Optional: Only if backend is NOT on localhost:5000
cp .env.example .env.local
# Edit .env.local with your custom backend URL
```

### Step 4: Login
- **Super Admin:** uttamkumar86830@gmail.com / SuperAdmin@2025#RJ
- **Admin Panel:** http://localhost:3000/admin/dashboard
- **Store Front:** http://localhost:3000

## 📝 Important Setup Notes

⚠️ **MUST RUN:** `npm run seed:staff` in backend to create admin users before first login!

✅ **All Staff Accounts Created:**
- Super Admin, Admin, Store Manager, Inventory Manager, Sales Staff

🔧 **Common Issues:**
- **Login Error 401:** Run `npm run seed:staff` in backend
- **CORS Error:** Make sure backend is running on port 5000
- **MongoDB Connection:** Check MONGODB_URI in backend/.env
- **Custom Backend Port:** Create `frontend/.env.local` with your backend URL

## 🏗️ Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query, Framer Motion

**Backend:** Node.js, Express.js, TypeScript, Mongoose ODM

**Database:** MongoDB (local or MongoDB Atlas)

**Cloud:** AWS S3 (PDFs), CloudFront (CDN)

**Payments:** Razorpay (UPI, Cards, Net Banking, EMI, COD)

**Messaging:** Meta Business API (WhatsApp), Nodemailer (Email)

## 📖 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) — Full MilesWeb + GitHub setup
- Backend API runs on port `5000`
- Frontend runs on port `3000`
- Admin panel at `/admin/dashboard`

## 🔑 Default Login Credentials

After running `npm run seed:staff`, use these credentials:

**Super Admin (Full Access):**
- Email: `uttamkumar86830@gmail.com`
- Password: `SuperAdmin@2025#RJ`

**Admin:**
- Email: `priya@ratanjewellers.com`
- Password: `Admin@2025#RJ`

**Store Manager:**
- Email: `suresh@ratanjewellers.com`
- Password: `Manager@2025#RJ`

*(Change passwords immediately in production)*

## 📁 Project Structure

```
ratan-jewellers/
├── frontend/     # Next.js 14 storefront + admin
├── backend/      # Express API + Prisma
└── docs/         # Deployment and setup guides
```

---
*Crafted with ❤️ for Ratan Jewellers*
