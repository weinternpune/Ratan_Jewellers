# 🎯 START HERE - Quick Setup Guide

## ⚠️ Current Issue

Your dashboard shows **₹0.0L revenue** and invoice status is **"Pending"** because:

```
❌ Backend server is NOT running
❌ Frontend cannot fetch data from backend
❌ MongoDB might not be started
```

---

## ✅ SOLUTION (3 Easy Steps)

### Step 1: Start MongoDB

Open **Command Prompt as Administrator** and run:
```cmd
net start MongoDB
```

**If MongoDB is not installed:**
- Download: https://www.mongodb.com/try/download/community
- Install and then run the command above

---

### Step 2: Start Both Servers

**EASIEST WAY:**

Just **double-click** this file in Windows Explorer:
```
START_SERVERS.bat
```

This will open 2 terminal windows:
1. Backend Server (http://localhost:5000)
2. Frontend Server (http://localhost:3000)

**Keep both windows open!** ⚠️

---

**MANUAL WAY (if bat file doesn't work):**

**Terminal 1:**
```cmd
cd backend
npm run dev
```

**Terminal 2:**
```cmd
cd frontend  
npm run dev
```

---

### Step 3: Test It's Working

Open browser and go to:

**Backend Check:**
```
http://localhost:5000
```
Should show: "Ratan Jewellers Backend API is running successfully" ✅

**Frontend Check:**
```
http://localhost:3000/admin/billing
```
Should load invoices and show correct data ✅

---

## 📊 Expected Results After Fix

### Dashboard (http://localhost:3000/admin/dashboard)
- ✅ Total Revenue shows correct amount (not ₹0.0L)
- ✅ All cards display real data
- ✅ No errors in browser console
- ✅ Auto-refreshes every 30 seconds

### Billing (http://localhost:3000/admin/billing)  
- ✅ Invoices load correctly
- ✅ Status shows "paid" for fully paid invoices
- ✅ Status shows "pending" for partial payments
- ✅ Balance calculated correctly
- ✅ Can add payments and status auto-updates

---

## 🎯 Quick Test Cases

### Test 1: Create Fully Paid Invoice
1. Go to Billing → Click "+ Create Invoice"
2. Enter:
   - Customer Name: "Test Customer"
   - Phone: "9876543210"
   - Amount: ₹50,000
   - Client Payment: ₹52,500 (full amount with GST)
3. Click "Create Invoice"

**Expected:**
- ✅ Status = "paid"
- ✅ Balance = ₹0
- ✅ Dashboard revenue increases by ₹52,500

---

### Test 2: Create Partial Payment Invoice
1. Create Invoice → Billing page
2. Enter:
   - Customer: "Test Customer 2"
   - Amount: ₹100,000
   - Client Payment: ₹50,000 (partial)
3. Click "Create Invoice"

**Expected:**
- ✅ Status = "pending"
- ✅ Balance = ₹53,000 (₹103,000 - ₹50,000)
- ✅ Can edit later to add more payment

---

### Test 3: Add Payment to Pending Invoice
1. Find invoice with "pending" status
2. Click "Edit" button
3. Enter payment amount in "Client Payment" field
4. Click "Pay Full" to auto-fill exact balance
5. Click "Update Invoice"

**Expected:**
- ✅ Status changes to "paid" automatically
- ✅ Balance becomes ₹0
- ✅ Payment history updated
- ✅ Dashboard revenue increases

---

## 🔧 Troubleshooting

### Error: "MongoDB is not running"
```cmd
net start MongoDB
```

### Error: "Port 5000 is already in use"
Find and kill the process:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Error: "npm: command not found"
Install Node.js from: https://nodejs.org/

### Error: "Module not found"
Install dependencies:
```cmd
cd backend
npm install

cd ../frontend
npm install
```

### Dashboard still shows ₹0
1. Make sure backend is running (check http://localhost:5000)
2. Clear browser cache (Ctrl+Shift+Del)
3. Reload page (F5)
4. Check browser console for errors (F12)

---

## 📁 Important Files

### Quick Start
- **START_SERVERS.bat** - Double-click to start everything

### Documentation
- **FIX_INSTRUCTIONS.md** - Detailed fix explanation
- **TROUBLESHOOTING_GUIDE.md** - Common errors and solutions
- **DASHBOARD_AUTO_UPDATE.md** - How dashboard updates work
- **CURRENT_GOLD_RATES.md** - Gold rate information

### Configuration
- **backend/.env** - Backend configuration
- **frontend/.env.local** - Frontend configuration (if exists)

---

## 🎓 How Features Work

### Auto-Status Update
- Invoice status automatically based on balance
- Balance = 0 → "paid"
- Balance > 0 → "pending"
- Updates when you add payment

### Dashboard Revenue
- **Total Revenue** = Delivered Orders + Paid Invoices
- **Total Paid** = Sum of all payments (including partial)
- Auto-refreshes every 30 seconds
- Manual refresh button available

### Balance Calculation
- Automatic: `balance = total - amountPaid`
- Auto-corrects wrong balances from database
- Real-time updates when you type

### Payment Tracking
- Supports decimal amounts (paise)
- "Pay Full" button auto-fills exact balance
- Payment history tracked for each invoice
- Shows running balance

---

## ✅ Success Checklist

Before you say "it's working":

- [ ] MongoDB service is running
- [ ] Backend terminal shows "API running on port 5000"
- [ ] Frontend terminal shows "Ready on http://localhost:3000"
- [ ] http://localhost:5000 shows success message
- [ ] http://localhost:3000/admin/billing loads invoices
- [ ] Dashboard shows correct revenue (not ₹0.0L)
- [ ] No errors in browser console
- [ ] Can create invoice with full payment → status = "paid"
- [ ] Can create invoice with partial payment → status = "pending"
- [ ] Can edit invoice to add payment → status updates to "paid"

---

## 🎉 You're Done!

Once all servers are running:

1. Go to: http://localhost:3000
2. Login with your credentials
3. Navigate to **Dashboard** → See correct revenue ✅
4. Navigate to **Billing** → Create/edit invoices ✅
5. Test auto-status updates ✅

---

## 💡 Pro Tips

1. **Always keep both servers running** while working on the project
2. **Check backend logs** if something doesn't work (Terminal 1)
3. **Check browser console** for frontend errors (F12 → Console)
4. **Dashboard auto-refreshes** every 30 seconds - just wait!
5. **Use "Pay Full" button** when editing invoices for exact balance

---

## 📞 Need More Help?

Read these files in order:
1. **FIX_INSTRUCTIONS.md** ← Start here for detailed steps
2. **TROUBLESHOOTING_GUIDE.md** ← If you get errors
3. **DASHBOARD_AUTO_UPDATE.md** ← How dashboard works

---

**Last Updated:** July 10, 2026  
**Status:** All features working when servers are running ✅  
**Next Step:** 👉 Double-click **START_SERVERS.bat**
