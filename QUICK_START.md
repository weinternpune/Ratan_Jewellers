# ⚡ Quick Start Guide - Ratan Jewellers

## 🎯 Setup in 3 Minutes

### 1️⃣ Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env     # Only if .env doesn't exist
npm run seed:staff       # Create admin users
npm run dev              # Runs on :5000
```

### 2️⃣ Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev              # Auto-connects to :5000
```

**✨ No .env.local needed!** Auto-configuration works out of the box.

### 3️⃣ Login
- **URL:** http://localhost:3000/admin/dashboard
- **Email:** uttamkumar86830@gmail.com
- **Password:** SuperAdmin@2025#RJ

---

## 🚨 Common Errors & Instant Fixes

### ❌ "Login Error 401"
```bash
# Missing admin users
cd backend
npm run seed:staff
```

### ❌ "Cannot connect to MongoDB"
```bash
# Check backend/.env file
# Must have: MONGODB_URI=mongodb://localhost:27017/ratan-jewellers
# Or MongoDB Atlas connection string
```

### ❌ "CORS Error"
```bash
# Backend not running
cd backend
npm run dev
```

### ❌ "Custom Backend Port/URL"
```bash
# Only needed if backend is NOT on localhost:5000
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local
npm run dev   # Must restart
```

---

## 📋 Checklist Before Starting

- [ ] Node.js 18+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Backend running on port 5000
- [ ] Frontend auto-connects (no manual config!)
- [ ] Admin users seeded
- [ ] Both servers running simultaneously

---

## 🔑 All Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | uttamkumar86830@gmail.com | SuperAdmin@2025#RJ |
| Admin | priya@ratanjewellers.com | Admin@2025#RJ |
| Store Manager | suresh@ratanjewellers.com | Manager@2025#RJ |
| Inventory Manager | amit@ratanjewellers.com | Inventory@2025#RJ |
| Sales Staff | deepak@ratanjewellers.com | Sales@2025#RJ |

---

## 🎨 What You Get

✅ Full e-commerce storefront  
✅ Admin dashboard with analytics  
✅ Inventory management  
✅ GST billing & invoices  
✅ Live gold rates  
✅ Customer CRM  
✅ Order management  
✅ WhatsApp integration  
✅ Razorpay payments  

---

## 📱 URLs

- **Storefront:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin/dashboard
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

---

## 🆘 Still Having Issues?

1. Read: `GOLD_RATE_SETUP.md` for gold rates issues
2. Read: `frontend/SETUP.md` for frontend issues
3. Read: `backend/SETUP.md` for backend issues
4. Check: `README.md` for full documentation

---

**💡 Pro Tip:** Always restart the dev server after editing `.env` files!
