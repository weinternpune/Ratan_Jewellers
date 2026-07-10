# 🥇 Gold Rate System Setup Guide

## Overview
The gold rate system allows automatic refresh from live market APIs and manual updates. This guide ensures the "Refresh from Market" button works for everyone who pulls your code.

## Why "Route not found" Error Happens

When others pull your code and click **"Refresh from Market"**, they get a 404 error because:
1. Frontend doesn't know the backend URL
2. Missing `.env.local` file in frontend directory
3. `NEXT_PUBLIC_API_URL` environment variable not set

## ✅ Global Fix Applied

### Files Created/Modified:

1. **`frontend/.env.local`** (Created)
   - Contains: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
   - This file is git-ignored (won't be pushed to repo)

2. **`frontend/.env.example`** (Created)
   - Template file that WILL be committed to git
   - Others copy this to `.env.local`

3. **`frontend/.gitignore`** (Updated)
   - Ignores `.env.local` but allows `.env.example`
   - Prevents accidentally committing sensitive data

4. **`frontend/SETUP.md`** (Created)
   - Detailed setup instructions
   - Troubleshooting guide

5. **`README.md`** (Updated)
   - Added `.env.local` setup step
   - Added common issues section

## 🚀 How Others Should Setup (After Pulling Code)

### Step 1: Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # If not already done
npm run dev             # Backend runs on port 5000
```

### Step 2: Frontend Setup
```bash
cd frontend
npm install

# IMPORTANT: Create .env.local file
cp .env.example .env.local

# OR manually create with this content:
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### Step 3: Start Frontend
```bash
npm run dev   # Frontend runs on port 3000
```

### Step 4: Test Gold Rates
1. Go to: http://localhost:3000/admin/gold-rates
2. Click **"Refresh from Market"** button
3. Should see success message and updated rates

## 🔍 Verification Checklist

After setup, verify:
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] `.env.local` exists in frontend directory
- [ ] `.env.local` contains: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
- [ ] Can access: http://localhost:3000/admin/gold-rates
- [ ] "Refresh from Market" button works without errors

## 🐛 Troubleshooting

### Error: "Request failed with status code 404"
**Problem:** Frontend can't find the backend API

**Solutions:**
```bash
# 1. Check .env.local exists
ls frontend/.env.local

# 2. Verify content
cat frontend/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 3. Restart frontend (required after creating/editing .env)
cd frontend
# Press Ctrl+C to stop
npm run dev
```

### Error: "Route not found"
**Problem:** Backend route not registered or backend not running

**Solutions:**
```bash
# 1. Check backend is running
curl http://localhost:5000/health
# Should return: {"status":"ok"}

# 2. Check gold rate route
curl http://localhost:5000/api/gold-rates/all
# Should return: {"success":true,"data":{...}}

# 3. If backend not running
cd backend
npm run dev
```

### Environment Variables Not Working
**Problem:** Next.js not picking up new .env changes

**Solutions:**
```bash
# 1. Delete .next build cache
cd frontend
rm -rf .next

# 2. Restart dev server
npm run dev

# 3. Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### CORS Errors
**Problem:** Backend blocking frontend requests

**Solution:** Backend already configured for CORS, but verify:
```javascript
// backend/src/server.ts should have:
app.use(cors({
  origin: true,
  credentials: true
}));
```

## 🌐 API Endpoints

The gold rate system uses these endpoints:

1. **GET /api/gold-rates/all**
   - Fetches all purity rates (24K, 22K, 18K, 14K)
   - No authentication required
   - Returns cached rates (updates every 5 minutes)

2. **POST /api/gold-rates/refresh**
   - Forces immediate refresh from market APIs
   - No authentication required
   - Tries 4 API sources in sequence

3. **POST /api/gold-rates/update**
   - Manual rate update by admin
   - Requires authentication
   - Calculates all purities from 24K rate

## 🔗 External APIs Used

The backend tries these APIs in order (fallback chain):

1. **GoldAPI.io** - India-specific gold rates
2. **metals-api.com** - Global metals market
3. **metals.live** - Real-time precious metals
4. **goldprice.org** - Gold price data

If all fail, uses hardcoded market rates from `CURRENT_MARKET_RATES`.

## 📝 Important Notes

### For Developers Pulling Code:
- ✅ `.env.example` will be in the repo
- ✅ Copy it to `.env.local` before starting
- ✅ Restart dev server after creating `.env.local`

### For Project Owner (You):
- ✅ `.env.local` is git-ignored (won't be pushed)
- ✅ `.env.example` is committed (others see template)
- ✅ Backend routes are already global
- ✅ No local-only code exists

### Production Deployment:
Update `.env.local` (or create `.env.production.local`):
```
NEXT_PUBLIC_API_URL=https://api.ratanjewellers.com/api
```

## ✨ Features Working Now

- ✅ Automatic rate refresh every 5 minutes (backend)
- ✅ Manual refresh button (frontend)
- ✅ Manual update with admin auth
- ✅ All purities calculated from 24K
- ✅ Fallback to market rates if APIs fail
- ✅ Success/error toast notifications
- ✅ Loading states and animations

## 🎯 Summary

The "Route not found" error is now **GLOBALLY FIXED** because:

1. Created `.env.example` (committed to git)
2. Updated `.gitignore` to allow `.env.example`
3. Created setup documentation
4. Updated main README with instructions
5. Backend routes already existed globally

**Everyone who pulls your code** will see `.env.example` and know to copy it to `.env.local`!

---

**Last Updated:** July 11, 2026  
**Status:** ✅ Global Fix Applied
