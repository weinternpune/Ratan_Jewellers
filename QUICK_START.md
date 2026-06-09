# Quick Start Guide - Testing Consultation Requests

## ✅ What Was Fixed

**Problem:** Consultation requests from navbar "Custom Jewellery" section weren't showing in admin panel.

**Solution:** Now requests are saved to both localStorage AND backend server, making them visible to all admins.

---

## 🚀 How to Test

### Step 1: Start Backend Server
```bash
cd backend
npm install
npm start
```
Backend should run at: `http://localhost:5000`

### Step 2: Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```
Frontend should run at: `http://localhost:3000`

### Step 3: Submit a Consultation Request

1. Open browser: `http://localhost:3000`
2. Click **"CUSTOM JEWELLERY"** in the top navigation bar
3. Scroll down to **"Start Your Custom Design"** section
4. Fill out the form:
   - **Name:** John Doe
   - **Email:** john@example.com
   - **Phone:** +91 9876543210
   - **Category:** Select "Engagement Ring"
   - **Design Details:** "I want a beautiful diamond ring with gold band"
5. Click **"Submit Consultation Request"**
6. You should see success message: ✅ "Request submitted! Our shop manager will contact you within 24 hours."

### Step 4: View in Admin Panel

#### Option A: Login as Superadmin
1. Go to: `http://localhost:3000/login`
2. Login with superadmin credentials
3. Click **"Custom Orders"** in the left sidebar
4. You should see your consultation request with:
   - 🔵 **"New"** status badge
   - All the details you entered
   - Phone, email, category information

#### Option B: Login as Store Manager
1. Go to: `http://localhost:3000/login`
2. Login with store manager credentials
3. Click **"Custom Orders"** in the left sidebar
4. You should see your consultation request

### Step 5: Manage the Request

1. Click on any request to open details panel
2. You can:
   - ✅ **Update Status** (New → In Review → Replied → Completed)
   - 💬 **Add Reply** to customer
   - 📱 **WhatsApp** direct contact button
   - 👁️ **View all details** (name, email, phone, category, description)

---

## 🎯 What to Check

### ✓ Frontend Form
- [ ] Form accepts all required fields
- [ ] Form shows success message after submission
- [ ] Form clears after successful submission

### ✓ Backend API
- [ ] Request appears in `backend/data/consultations.json`
- [ ] API endpoint responds with 201 status
- [ ] Data is correctly formatted

### ✓ Admin Panel
- [ ] Request appears in "Custom Orders" section
- [ ] Request shows "New" status
- [ ] All details are visible (name, email, phone, category, message)
- [ ] Can update status
- [ ] Can add replies
- [ ] WhatsApp button works

### ✓ Cross-Browser Test
- [ ] Submit request in Chrome
- [ ] Open admin panel in Firefox
- [ ] Request should be visible (proves backend persistence)

---

## 📝 Key URLs

| Page | URL | Description |
|------|-----|-------------|
| Home | `http://localhost:3000` | Main website |
| Custom Jewellery | `http://localhost:3000/custom-jewellery` | Consultation form page |
| Admin Login | `http://localhost:3000/login` | Login for admin/superadmin |
| Custom Orders | `http://localhost:3000/admin/custom-jewellery` | Admin panel for requests |
| Admin Consultations | `http://localhost:3000/admin/consultations` | Alternative view (backend-only) |

---

## 🔧 Troubleshooting

### Issue: "Failed to fetch" error when submitting
**Solution:** Make sure backend server is running at `http://localhost:5000`

### Issue: Request not showing in admin panel
**Solution:** 
1. Click the "Refresh Now" button in admin panel
2. Check browser console for errors
3. Verify backend server is running

### Issue: CORS error
**Solution:** Backend should have CORS enabled. Check `backend/src/server.ts` has:
```typescript
app.use(cors())
```

### Issue: Data not persisting after browser refresh
**Solution:** This is expected for localStorage-only data. Backend API ensures persistence.

---

## 👥 Test Users (Example)

You may need to create these or use existing credentials:

**Superadmin:**
- Email: admin@ratanjewellers.com
- Password: (check your database)

**Store Manager:**
- Email: manager@ratanjewellers.com
- Password: (check your database)

---

## 📊 Expected Data Flow

```
┌─────────────────┐
│  User Submits   │
│  Consultation   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Form Handler  │
│  (React State)  │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ↓          ↓
┌────────┐  ┌──────────┐
│LocalStr│  │ Backend  │
│(Zustand)  │   API    │
└────────┘  └─────┬────┘
                  │
                  ↓
            ┌───────────┐
            │consultations
            │   .json   │
            └─────┬─────┘
                  │
         ┌────────┴────────┐
         │                 │
         ↓                 ↓
    ┌────────┐      ┌──────────┐
    │ Admin  │      │  Other   │
    │Browser │      │ Admins   │
    └────────┘      └──────────┘
```

---

## ✨ New Features

1. **Dual Storage:** Saves to both localStorage and backend
2. **Real-time Updates:** Auto-refreshes every 1.5 seconds
3. **Cross-browser Visibility:** All admins can see all requests
4. **Status Tracking:** New → In Review → Replied → Completed → Rejected
5. **Reply System:** Add messages visible to customers
6. **WhatsApp Integration:** Quick contact button
7. **Unread Badges:** Red badges for new unread requests
8. **Manual Refresh:** Button to force immediate sync

---

## 🎉 Success Indicators

✅ Form submission shows success toast
✅ Request appears in admin "Custom Orders" within 1.5 seconds
✅ Backend file `consultations.json` contains the new request
✅ Request visible across different browsers/devices
✅ Status can be updated and changes persist
✅ Replies can be added and saved

---

## 📞 Support

If you encounter any issues:
1. Check both backend and frontend console logs
2. Verify backend server is running
3. Check network tab in browser DevTools
4. Review `CONSULTATION_FIX.md` for technical details
