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

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/ratan-jewellers.git
cd ratan-jewellers

# Backend
cd backend && cp .env.example .env && npm install
npx prisma generate && npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend && echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm install && npm run dev
```

Open: http://localhost:3000

## 🏗️ Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query, Framer Motion

**Backend:** Node.js, Express.js, TypeScript, Prisma ORM

**Database:** PostgreSQL (AWS RDS in production)

**Cloud:** AWS S3 (PDFs), CloudFront (CDN)

**Payments:** Razorpay (UPI, Cards, Net Banking, EMI, COD)

**Messaging:** Meta Business API (WhatsApp), Nodemailer (Email)

## 📖 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) — Full MilesWeb + GitHub setup
- Backend API runs on port `5000`
- Frontend runs on port `3000`
- Admin panel at `/admin/dashboard`

## 🔑 Default Admin Login

After seeding: `admin@ratanjewellers.com` / `Admin@1234!`
*(Change immediately in production)*

## 📁 Project Structure

```
ratan-jewellers/
├── frontend/     # Next.js 14 storefront + admin
├── backend/      # Express API + Prisma
└── docs/         # Deployment and setup guides
```

---
*Crafted with ❤️ for Ratan Jewellers*
