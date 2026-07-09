# 🔧 Fix: Error 429 - Too Many Requests

## Error Message
```
Console AxiosError
Request failed with status code 429
```

## What This Means
**Error 429** = "Too Many Requests"

The backend API has **rate limiting** enabled to prevent abuse. You hit the limit of allowed requests.

---

## ✅ SOLUTION

I've increased the rate limit for development mode from **100 requests** to **1000 requests** per 15 minutes.

### Step 1: Restart Backend Server

The rate limit change requires a backend restart.

**If using START_SERVERS.bat:**
1. Close the backend terminal window
2. Double-click `START_SERVERS.bat` again

**If running manually:**
1. Go to the backend terminal
2. Press **Ctrl + C** to stop the server
3. Run again:
   ```cmd
   npm run dev
   ```

### Step 2: Clear Browser Cache & Reload

1. Press **Ctrl + Shift + R** (hard reload)
2. Or press **F12** → Go to **Network** tab → Check "Disable cache"
3. Reload the page

---

## Why This Happened

Rate limiting protects the API from being overwhelmed by too many requests. Common causes:

1. **Auto-refresh** - Dashboard refreshes every 30 seconds
2. **Multiple tabs open** - Each tab makes API calls
3. **Rapid form changes** - Real-time calculation triggers on every keystroke
4. **Previous limit too low** - Was set to 100 requests per 15 minutes

---

## What I Changed

**Before (Too Restrictive):**
```typescript
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Only 100 requests allowed
    standardHeaders: true,
    legacyHeaders: false,
  })
);
```

**After (Development-Friendly):**
```typescript
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 in dev mode
    standardHeaders: true,
    legacyHeaders: false,
  })
);
```

Now in **development mode**, you can make **1000 requests** per 15 minutes instead of 100.

---

## Rate Limits After Fix

| Environment | Requests Allowed | Time Window |
|------------|------------------|-------------|
| **Development** | 1000 requests | 15 minutes |
| **Production** | 100 requests | 15 minutes |

Auth endpoints (`/api/auth/`) have even higher limits: **1000 requests** in development.

---

## Alternative Solutions

If you still hit the limit, here are other options:

### Option 1: Disable Rate Limiting Temporarily (Development Only)

Edit `backend/src/server.ts` and comment out rate limiting:

```typescript
// app.use(
//   '/api/',
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: process.env.NODE_ENV === 'development' ? 1000 : 100,
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );
```

⚠️ **Remember to uncomment before deploying to production!**

### Option 2: Increase Auto-Refresh Interval

If dashboard auto-refresh is causing too many requests, increase the interval:

Edit `frontend/src/app/admin/dashboard/page.tsx`:

```typescript
// Change from 30 seconds to 60 seconds
useEffect(() => {
  const refreshInterval = setInterval(() => {
    fetchInvoices()
    fetchOrders()
    fetchCustomers()
  }, 60000) // Changed from 30000 to 60000 (60 seconds)

  return () => clearInterval(refreshInterval)
}, [])
```

### Option 3: Reduce Real-Time Calculations

If rapid typing triggers too many calculations, add debouncing. But this is usually not needed with the increased limit.

---

## Testing After Fix

1. **Restart backend server** (important!)
2. Go to: http://localhost:3000/admin/billing
3. Open browser console (F12)
4. Reload page
5. Should work without 429 error ✅

---

## How to Check Rate Limit Status

When the backend receives requests, it adds headers:

```
RateLimit-Limit: 1000
RateLimit-Remaining: 995
RateLimit-Reset: 1657456789
```

To see these in browser:
1. Press F12
2. Go to **Network** tab
3. Click any API request
4. Look at **Response Headers**
5. Check `RateLimit-Remaining` to see how many requests you have left

---

## Prevention Tips

1. **Don't open too many tabs** - Each tab makes separate API calls
2. **Use manual refresh** - Instead of relying only on auto-refresh
3. **Close unused tabs** - Reduces background API calls
4. **Restart backend** when testing new features - Clears rate limit counters

---

## Files Modified

- `backend/src/server.ts`
  - Increased rate limit from 100 to 1000 in development mode

---

## Next Steps

1. **Restart backend server** (Ctrl+C, then `npm run dev`)
2. **Hard reload frontend** (Ctrl+Shift+R)
3. **Test billing page** - Should load without errors
4. **Check console** - No more 429 errors

---

**Date:** July 10, 2026
**Status:** Fixed - Rate limit increased for development ✅
**Action Required:** Restart backend server!
