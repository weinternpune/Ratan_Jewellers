# 🔧 Fix "Request failed with status code 404" Error

## 🚨 Problem

After merging code, users get this error when clicking "Refresh from Market" in Gold Rates:

```
AxiosError: Request failed with status code 404
```

---

## ✅ Root Causes & Solutions

### **Cause 1: Backend Not Running** (Most Common)

**Symptoms:**
- 404 error on any API call
- "Route not found" in console
- Frontend loads but API calls fail

**Fix:**
```bash
# Check if backend is running
curl http://localhost:5000/health

# If fails, start backend
cd backend
npm run dev
```

**Explanation:** Frontend is running but can't reach backend on port 5000.

---

### **Cause 2: Backend Not Restarted After Pull**

**Symptoms:**
- Works for you but not for others after merge
- Old code still running in background

**Fix:**
```bash
# Stop backend completely (Ctrl+C in terminal)
cd backend

# Clear any cached files
rm -rf dist

# Restart with fresh compile
npm run dev
```

**Explanation:** TypeScript needs to recompile after pulling new changes.

---

### **Cause 3: Wrong Port or URL**

**Symptoms:**
- Backend running but still 404
- Console shows wrong API URL

**Fix:**
```bash
# Check backend port
cd backend
# Look at terminal output - should say "running on port 5000"

# Check frontend .env.local (if exists)
cd frontend
cat .env.local
# Should be: NEXT_PUBLIC_API_URL=http://localhost:5000/api

# If wrong, fix it:
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Restart frontend (MUST restart after env change)
npm run dev
```

---

### **Cause 4: Route Not Properly Registered**

**Symptoms:**
- Backend running
- Health check works: `curl http://localhost:5000/health` ✅
- But gold rates endpoint fails: `curl http://localhost:5000/api/gold-rates/all` ❌

**Fix - Verify Backend Routes:**

1. **Check route file exists:**
```bash
cd backend/src/routes
ls goldRates.ts
# Should exist
```

2. **Check route is registered in server.ts:**
```bash
cd backend/src
grep "gold-rates" server.ts
# Should show: app.use('/api/gold-rates', goldRateRoutes)
```

3. **If route missing, add it to server.ts:**
```typescript
import goldRateRoutes from './routes/goldRates';

// ... other code ...

app.use('/api/gold-rates', goldRateRoutes);
```

4. **Restart backend:**
```bash
cd backend
npm run dev
```

---

### **Cause 5: Dependencies Not Installed**

**Symptoms:**
- Backend throws errors on start
- Module not found errors

**Fix:**
```bash
# Backend dependencies
cd backend
rm -rf node_modules
npm install

# Frontend dependencies
cd frontend
rm -rf node_modules
npm install
```

---

## 🧪 Step-by-Step Testing

### Test 1: Backend Health
```bash
curl http://localhost:5000/health
```
**Expected:** `{"status":"ok",...}`
**If fails:** Backend not running - start it!

### Test 2: Gold Rates Endpoint
```bash
curl http://localhost:5000/api/gold-rates/all
```
**Expected:** `{"success":true,"data":{"rates":{...}}}`
**If fails:** Route not registered or controller error

### Test 3: Refresh Endpoint
```bash
curl -X POST http://localhost:5000/api/gold-rates/refresh
```
**Expected:** `{"success":true,"message":"Gold rates refreshed..."}`
**If fails:** Controller function error

### Test 4: Frontend Config
```bash
cd frontend
cat .env.local
# OR check browser console for config log
```
**Expected:** 
```
🔧 Frontend Configuration: {
  API URL: "http://localhost:5000/api",
  ...
}
```

---

## 🚀 Complete Reset (Nuclear Option)

If nothing works, do a complete reset:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Backend reset
cd backend
rm -rf node_modules dist
npm install
npm run dev

# 3. Frontend reset (NEW TERMINAL)
cd frontend
rm -rf node_modules .next
npm install
npm run dev

# 4. Test
# Visit: http://localhost:3000/admin/gold-rates
# Click "Refresh from Market"
```

---

## 🎯 For Users After Merge

When someone merges your code, tell them:

### Option 1: Use Startup Script (Easiest)
```bash
# Windows
START_EVERYTHING.bat

# The script will:
# - Install dependencies if needed
# - Create .env.local if missing
# - Start both servers
```

### Option 2: Manual Startup
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Wait for both to start, then test
```

### Option 3: Use README Instructions
```bash
# Follow README.md "Quick Start" section
# It has full step-by-step guide
```

---

## 📊 Checklist for Others After Merge

Share this checklist with anyone who merges your code:

- [ ] **Step 1:** Pull latest code: `git pull origin main`
- [ ] **Step 2:** Install backend deps: `cd backend && npm install`
- [ ] **Step 3:** Install frontend deps: `cd frontend && npm install`
- [ ] **Step 4:** Start backend: `cd backend && npm run dev`
- [ ] **Step 5:** Start frontend: `cd frontend && npm run dev`
- [ ] **Step 6:** Test backend: Open `http://localhost:5000/health`
- [ ] **Step 7:** Test frontend: Open `http://localhost:3000`
- [ ] **Step 8:** Test gold rates: Go to `/admin/gold-rates` and click "Refresh from Market"

If ALL steps work, no 404 error! ✅

---

## 🔍 Advanced Debugging

### Check Network Request

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Refresh from Market"
4. Look at the failed request

**Check URL:**
- ✅ Correct: `http://localhost:5000/api/gold-rates/refresh`
- ❌ Wrong: `http://localhost:3000/api/gold-rates/refresh` (missing backend)
- ❌ Wrong: `http://undefined/api/gold-rates/refresh` (env not loaded)

**Check Status:**
- `404` = Route not found (backend issue)
- `500` = Server error (controller issue)  
- `ERR_CONNECTION_REFUSED` = Backend not running
- `CORS error` = CORS not configured

### Check Console Logs

**Frontend Console (Browser):**
```
🔧 Frontend Configuration: {
  API URL: "http://localhost:5000/api"  ← Should be correct
}
```

**Backend Console (Terminal):**
```
🚀 Ratan Jewellers API running on port 5000
📊 Environment: development
🍃 Database: MongoDB
POST /api/gold-rates/refresh 404  ← If you see this, route missing!
POST /api/gold-rates/refresh 200  ← This is correct!
```

---

## 💡 Prevention

To avoid this for future merges:

### 1. **Document in README**
- Clear step-by-step setup
- Mention backend must be running

### 2. **Add to CONTRIBUTING.md**
```markdown
## After Pulling Changes

1. Stop servers (Ctrl+C)
2. Run `npm install` in both folders
3. Restart both servers
4. Test API endpoints
```

### 3. **Use Startup Script**
- Include `START_EVERYTHING.bat` in repo
- Tell contributors to use it

### 4. **Add Health Check Endpoint**
```typescript
// backend/src/server.ts
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    routes: {
      goldRates: '/api/gold-rates/*',
      auth: '/api/auth/*',
      // ...other routes
    }
  });
});
```

---

## ✅ Summary

**The 404 error after merge happens because:**

1. ❌ Backend not running
2. ❌ Backend not restarted after pull
3. ❌ Wrong API URL in frontend
4. ❌ Dependencies not installed
5. ❌ Routes not registered

**To fix:**

1. ✅ Start backend: `cd backend && npm run dev`
2. ✅ Start frontend: `cd frontend && npm run dev`
3. ✅ Test: Click "Refresh from Market"
4. ✅ Should work!

**To prevent:**

1. ✅ Use startup script
2. ✅ Document in README
3. ✅ Clear merge instructions
4. ✅ Test before pushing

---

**Created:** July 11, 2026  
**Status:** Complete troubleshooting guide  
**For:** Gold Rates 404 error after merge
