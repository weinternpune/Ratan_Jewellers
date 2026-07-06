# Backend Setup Guide

## 🚀 First Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

**Required Environment Variables:**
```env
MONGODB_URI=mongodb://localhost:27017/ratan_jewellers
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Create Admin Users (IMPORTANT!)
```bash
npm run seed:staff
```

This creates 6 staff accounts:
- 1 Super Admin
- 1 Admin
- 1 Store Manager
- 1 Inventory Manager
- 2 Sales Staff

### 4. Start Server
```bash
npm run dev
```

Server will run on: http://localhost:5000

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run seed:staff` | Create all staff users |
| `npm run seed:all` | Seed products + staff |

---

## 🔑 Default Credentials

### Super Admin (Full Access)
- **Email:** uttamkumar86830@gmail.com
- **Password:** SuperAdmin@2025#RJ

### Admin
- **Email:** priya@ratanjewellers.com
- **Password:** Admin@2025#RJ

### Store Manager
- **Email:** suresh@ratanjewellers.com
- **Password:** Manager@2025#RJ

### Inventory Manager
- **Email:** anita@ratanjewellers.com
- **Password:** Inventory@2025#RJ

### Sales Staff 1
- **Email:** vikram@ratanjewellers.com
- **Password:** Sales@2025#RJ

### Sales Staff 2
- **Email:** kavya@ratanjewellers.com
- **Password:** Sales2@2025#RJ

---

## 🛠️ Common Issues & Solutions

### Issue: Login returns 401 Unauthorized
**Solution:** Run `npm run seed:staff` to create users

### Issue: MongoDB connection failed
**Solution:** 
1. Make sure MongoDB is running locally
2. Check MONGODB_URI in .env file
3. Or use MongoDB Atlas connection string

### Issue: CORS error on frontend
**Solution:** 
1. Make sure backend is running on port 5000
2. Check FRONTEND_URL in .env is http://localhost:3000

### Issue: "User not found" error
**Solution:** Database is empty. Run `npm run seed:staff`

---

## 🔐 Security Notes

⚠️ **Production Deployment:**
1. Change all default passwords immediately
2. Use strong JWT secrets (generate with: `openssl rand -base64 32`)
3. Enable HTTPS
4. Set NODE_ENV=production
5. Use MongoDB Atlas or secure MongoDB instance
6. Configure proper CORS origins

---

## 📞 Support

For issues or questions, contact: uttamkumar86830@gmail.com
