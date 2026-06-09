# 🧪 How to Test the Consultation Request Fix

## 📋 Pre-Test Checklist

- [ ] Backend server running on `http://localhost:5000`
- [ ] Frontend server running on `http://localhost:3000`
- [ ] Both servers showing no errors in terminal
- [ ] Browser developer tools open (F12)

---

## 🎬 Test Scenario 1: Submit New Consultation

### Step 1: Navigate to Custom Jewellery Page
```
1. Open browser: http://localhost:3000
2. Look at top navigation bar
3. Click on "CUSTOM JEWELLERY" link
```

**Expected:** Page loads showing custom jewellery categories and consultation form

### Step 2: Fill Out Consultation Form
```
1. Scroll down to "Start Your Custom Design" section
2. Fill in form:
   Name:           John Doe
   Email:          john@example.com
   Phone:          +91 9876543210
   Category:       Select "Engagement Ring"
   Design Details: I want a beautiful diamond ring with gold band
```

**Expected:** All fields accept input, no errors

### Step 3: Submit Form
```
1. Click "Submit Consultation Request" button
2. Watch for toast notification
```

**Expected:** 
- ✅ Green success toast appears: "Request submitted! Our shop manager will contact you within 24 hours."
- ✅ Form fields clear automatically
- ✅ No error messages in console

### Step 4: Verify Backend Storage
```
1. Open file: backend/data/consultations.json
2. Look for your entry with name "John Doe"
```

**Expected:**
```json
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "category": "ring",
  "message": "I want a beautiful diamond ring with gold band\n\nMetal: Not specified\nBudget: Not specified",
  "status": "pending",
  "createdAt": "2026-06-09T..."
}
```

---

## 🎬 Test Scenario 2: View in Admin Panel

### Step 1: Login as Admin
```
1. Navigate to: http://localhost:3000/login
2. Enter admin credentials
3. Click "Login"
```

**Expected:** Redirects to admin dashboard or custom orders page

### Step 2: Navigate to Custom Orders
```
1. Look at left sidebar
2. Click on "Custom Orders" menu item
   (Should have Gem icon 💎)
```

**Expected:**
- Page loads
- Shows "Custom Jewellery" header
- Shows request count
- Shows "Last synced" timestamp

### Step 3: Find Your Request
```
1. Look in the requests list
2. Find entry with name "John Doe"
```

**Expected:**
- ✅ Request is visible in the list
- 🔵 Blue "New" badge on the right
- 🔴 Blue dot next to name (unread indicator)
- Shows: Name, Phone, Email, Category
- Shows: Submission date and time
- Shows: Request ID (like CJR-...)

### Step 4: View Request Details
```
1. Click on the John Doe request
2. Details panel slides in from right
```

**Expected:**
- ✅ Full details panel opens
- Shows all information:
  - Name: John Doe
  - Email: john@example.com
  - Phone: +91 9876543210
  - Category: ring
  - Metal: Not specified
  - Budget: Not specified
  - Status: new
  - Full description text
- Shows buttons:
  - Status update buttons (New, In Review, Replied, etc.)
  - Reply textarea
  - WhatsApp button
  - Send Reply button

### Step 5: Update Status
```
1. Click on "In Review" status button
2. Watch for toast notification
```

**Expected:**
- ✅ Toast: "Status updated"
- 🟡 Request badge changes from blue "New" to amber "In Review"
- Status persists after page refresh

### Step 6: Add Reply
```
1. Type in reply textarea: "Thank you for your inquiry. We'll contact you soon."
2. Click "Send Reply" button
```

**Expected:**
- ✅ Toast: "Reply sent"
- Reply appears in conversation section
- Shows your name and timestamp

---

## 🎬 Test Scenario 3: Cross-Browser Test

### Step 1: Submit in Browser A
```
1. Open Chrome
2. Navigate to: http://localhost:3000/custom-jewellery
3. Submit consultation form with name "Browser A Test"
```

**Expected:** Success toast appears

### Step 2: View in Browser B
```
1. Open Firefox (different browser)
2. Navigate to: http://localhost:3000/login
3. Login as admin
4. Go to Custom Orders
```

**Expected:**
- ✅ Request from Browser A is visible
- ✅ Shows "Browser A Test" in the list
- ✅ Proves backend persistence is working!

---

## 🎬 Test Scenario 4: Real-time Sync

### Step 1: Open Two Admin Panels
```
1. Open Tab 1: http://localhost:3000/admin/custom-jewellery (logged in as admin)
2. Open Tab 2: http://localhost:3000/admin/custom-jewellery (same browser, logged in)
```

**Expected:** Both tabs show the same requests

### Step 2: Submit New Request
```
1. Open Tab 3: http://localhost:3000/custom-jewellery
2. Submit a new consultation request
```

**Expected:**
- ✅ Within 1.5 seconds, both admin tabs show the new request
- ✅ "Last synced" timestamp updates
- ✅ Request count increases

### Step 3: Update Status in Tab 1
```
1. In Tab 1, click on a request
2. Change status to "In Review"
```

**Expected:**
- ✅ Tab 2 shows updated status within 1.5 seconds
- ✅ Both tabs stay synchronized

---

## 🎬 Test Scenario 5: Backend Failure Handling

### Step 1: Stop Backend Server
```
1. Go to terminal running backend
2. Press Ctrl+C to stop server
```

**Expected:** Backend stops

### Step 2: Submit Consultation
```
1. Navigate to: http://localhost:3000/custom-jewellery
2. Fill and submit form
```

**Expected:**
- ✅ Success toast still appears
- ✅ Request saved to localStorage
- ⚠️ Console shows: "Backend API error" (this is OK)
- ✅ Form submission doesn't fail

### Step 3: Restart Backend
```
1. In backend terminal: npm start
2. Wait for server to start
```

**Expected:** Server starts successfully

### Step 4: Check Admin Panel
```
1. Navigate to admin custom orders
2. Click "Refresh Now" button
```

**Expected:**
- ✅ Previously submitted requests still visible (from localStorage)
- ✅ Can submit new requests now

---

## 🎬 Test Scenario 6: Data Deduplication

### Step 1: Create Request Before Fix
```
1. Manually add entry to localStorage:
   - Open DevTools → Application → Local Storage
   - Find 'ratan-custom-jewellery' key
   - Add a request with ID "TEST-123"
```

### Step 2: Create Same Request in Backend
```
1. Manually add entry to backend/data/consultations.json:
   {
     "id": "TEST-123",
     "name": "Duplicate Test",
     ...
   }
```

### Step 3: Open Admin Panel
```
1. Navigate to: http://localhost:3000/admin/custom-jewellery
2. Look for "Duplicate Test"
```

**Expected:**
- ✅ Only ONE entry shown (not duplicated)
- ✅ System deduplicates by ID automatically

---

## ✅ Success Criteria

### Must Pass:
- [ ] Form submission works
- [ ] Success toast appears
- [ ] Data saved to backend file
- [ ] Request visible in admin panel
- [ ] Request has blue "New" badge
- [ ] Can view full details
- [ ] Can update status
- [ ] Can add replies
- [ ] Cross-browser visibility works
- [ ] Auto-refresh works (1.5s interval)
- [ ] Manual refresh button works
- [ ] WhatsApp button generates correct link
- [ ] No duplicate entries shown

### Should Pass:
- [ ] Form works when backend is down (localStorage fallback)
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Status updates persist across refreshes
- [ ] Replies are saved and displayed
- [ ] Unread badges work correctly
- [ ] Timestamps display correctly

---

## 🐛 Known Issues & Expected Behavior

### Issue: Request appears twice briefly
**Expected:** During auto-refresh, request might flash briefly if it exists in both localStorage and backend with slightly different data. System will deduplicate within 1.5 seconds.

### Issue: Status doesn't update immediately
**Expected:** Status updates take up to 1.5 seconds to sync due to auto-refresh interval. Click "Refresh Now" for immediate update.

### Issue: WhatsApp link has %0A characters
**Expected:** This is URL encoding for line breaks. WhatsApp will decode it properly.

---

## 📊 Test Results Template

```
✅ PASS | Form Submission
✅ PASS | Backend Storage
✅ PASS | Admin Visibility
✅ PASS | Status Update
✅ PASS | Reply System
✅ PASS | Cross-Browser
✅ PASS | Real-time Sync
✅ PASS | Backend Fallback
✅ PASS | Deduplication
✅ PASS | WhatsApp Integration

Total: 10/10 tests passed
Status: ✅ READY FOR PRODUCTION
```

---

## 🎯 Quick Validation (30 seconds)

If you're short on time, do this minimal test:

```bash
# 1. Start servers
cd backend && npm start &
cd frontend && npm run dev &

# 2. Submit form
# Visit: http://localhost:3000/custom-jewellery
# Fill form → Submit

# 3. Check admin
# Visit: http://localhost:3000/admin/custom-jewellery
# Login → See your request

# ✅ If request appears, fix is working!
```

---

## 🔍 Debugging Tips

### Console Commands:
```javascript
// Check localStorage data
JSON.parse(localStorage.getItem('ratan-custom-jewellery'))

// Force refresh
window.location.reload()

// Check API response
fetch('http://localhost:5000/api/custom-jewellery')
  .then(r => r.json())
  .then(console.log)
```

### Network Tab:
- Look for POST to `/api/custom-jewellery` after form submission
- Should return 201 status code
- Response should have `success: true`

### Console Tab:
- No red error messages
- May see "Backend API error" if backend is down (this is OK)
- Should see auto-refresh logs every 1.5 seconds

---

## 🎉 All Tests Passed?

Congratulations! The consultation request system is fully functional! 🎊

Next steps:
1. ✅ Mark issue as resolved
2. ✅ Deploy to staging environment
3. ✅ User acceptance testing
4. ✅ Production deployment

**System is ready for real customers!** 🚀
