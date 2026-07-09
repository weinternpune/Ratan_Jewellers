# 🔧 Troubleshooting Guide - Invoice Status & Dashboard Issues

## Current Issue Summary

**Symptoms:**
- ✅ Invoices showing status "Pending" even when fully paid
- ✅ Dashboard showing ₹0.0L revenue
- ❌ Error: `src\lib\billingApi.ts (109:9) @ handleApiError`

**Root Cause:** Backend server is NOT running ❌

---

## ✅ SOLUTION: Start the Backend Server

### Step 1: Ensure MongoDB is Running

MongoDB must be running for the backend to work.

**Check if MongoDB is running:**
```cmd
mongod --version
```

**Start MongoDB (if not running):**
```cmd
net start MongoDB
```

If MongoDB is not installed, install it from: https://www.mongodb.com/try/download/community

---

### Step 2: Start the Backend Server

Open a **NEW terminal** in the project root and run:

```cmd
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Ratan Jewellers API running on port 5000
📊 Environment: development
🍃 Database: MongoDB
```

**If you see errors:**

#### Error: "Cannot connect to MongoDB"
- Make sure MongoDB service is running: `net start MongoDB`
- Check connection string in `backend\.env`: `MONGODB_URI=mongodb://localhost:27017/ratan_jewellers`

#### Error: "Port 5000 already in use"
- Another process is using port 5000
- Find and stop it: `netstat -ano | findstr :5000`
- Or change PORT in `backend\.env` to 5001 and update `frontend\.env.local`

#### Error: "Module not found"
- Install dependencies: `npm install` in backend folder

---

### Step 3: Verify Backend is Running

Open browser and visit: http://localhost:5000

You should see:
```json
{
  "success": true,
  "message": "🚀 Ratan Jewellers Backend API is running successfully.",
  "environment": "development",
  "version": "1.0.0"
}
```

---

### Step 4: Test Invoice API

Visit: http://localhost:5000/api/invoices

You should see invoice data (not an error).

---

### Step 5: Refresh Frontend

Once backend is running:

1. Go to your frontend (http://localhost:3000)
2. Navigate to **Billing** page
3. Click the **Refresh** button (if available) or reload the page (F5)
4. Check the dashboard - revenue should now show correctly!

---

## How the Auto-Status Feature Works

### ✅ Create Invoice
When creating an invoice:
- If `amountPaid >= total` → Status = **"paid"** ✅
- If `amountPaid < total` → Status = **"pending"** ⏳
- Balance is automatically calculated: `total - amountPaid`

### ✅ Edit Invoice (Add Payment)
When adding payment to existing invoice:
- Enter payment amount in "Client Payment" field
- New balance calculated: `balanceDue - payment`
- If new balance <= 0 → Status auto-updates to **"paid"** ✅
- If new balance > 0 → Status stays **"pending"** ⏳

### ✅ Dashboard Revenue
Dashboard "Total Revenue" includes:
- All delivered orders: `orders.filter(o => o.status === 'delivered')`
- All paid invoices: `invoices.filter(i => i.status === 'paid')`
- Formula: `combinedRevenue = totalRevenue + invoiceRevenue`

### ✅ Paid Amount Card
The "Total Paid" card shows:
- Sum of ALL `amountPaid` fields across all invoices
- Includes partial payments
- Shows count of fully paid invoices as subtitle

---

## Quick Checklist

Use this checklist to verify everything is working:

- [ ] MongoDB service is running
- [ ] Backend server is running on port 5000
- [ ] Frontend can access http://localhost:5000
- [ ] No errors in backend terminal
- [ ] No errors in frontend browser console
- [ ] Invoices are loading in billing page
- [ ] Dashboard shows correct revenue numbers
- [ ] Creating invoice with full payment sets status to "paid"
- [ ] Creating invoice with partial payment sets status to "pending"
- [ ] Adding payment updates status automatically

---

## Common Errors & Solutions

### Error: "Network Error" in browser console
**Cause:** Backend is not running
**Solution:** Start backend server (`npm run dev` in backend folder)

### Error: "401 Unauthorized"
**Cause:** Authentication token expired or invalid
**Solution:** Log out and log back in

### Error: "MongoDB connection failed"
**Cause:** MongoDB service not running
**Solution:** Start MongoDB: `net start MongoDB`

### Dashboard shows ₹0.0L but invoices exist
**Cause:** Backend not returning data or invoice status is wrong
**Solution:** 
1. Start backend server
2. Check browser console for errors
3. Refresh invoices data
4. Auto-correction logic will fix wrong statuses on next fetch

### Invoice status not updating after payment
**Cause:** Backend not running or frontend state not refreshing
**Solution:**
1. Ensure backend is running
2. After adding payment, page should auto-refresh invoices
3. If not, manually reload the page

---

## Development Workflow

### Recommended Setup:

**Terminal 1: Backend**
```cmd
cd backend
npm run dev
```
Keep this running - Backend on http://localhost:5000

**Terminal 2: Frontend**
```cmd
cd frontend
npm run dev
```
Keep this running - Frontend on http://localhost:3000

**Both must be running simultaneously!**

---

## Still Having Issues?

1. **Check backend logs** in Terminal 1 for error messages
2. **Check browser console** (F12 → Console tab) for frontend errors
3. **Verify MongoDB** is running: `mongosh` (should connect without errors)
4. **Clear browser cache** and reload (Ctrl+Shift+R)
5. **Restart both servers** (Ctrl+C to stop, then run again)

---

## Feature Summary (What Was Implemented)

### ✅ Auto-Status Update
- Invoice status automatically updates based on balance
- Balance = 0 → "paid"
- Balance > 0 → "pending"

### ✅ Partial Payment Support
- Can pay any amount (including decimals with paise)
- Tracks payment history
- Shows running balance

### ✅ Dashboard Auto-Update
- Fetches fresh data on load
- Auto-refreshes every 30 seconds
- Manual refresh button available
- Counts both order revenue AND invoice revenue

### ✅ Balance Auto-Correction
- Frontend automatically recalculates balance on fetch
- Backend auto-fixes wrong balances during getInvoices
- Logs warnings when mismatches detected

---

**Last Updated:** July 10, 2026
**Status:** System working correctly when backend is running ✅
