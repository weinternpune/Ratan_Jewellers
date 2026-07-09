# Current Gold Rates - Updated July 9, 2026

## Live Market Rates (per gram in INR)

| Purity | Rate per Gram | Rate per 10g |
|--------|---------------|--------------|
| 24K (999) | ₹14,525 | ₹1,45,250 |
| 22K (916) | ₹13,314 | ₹1,33,140 |
| 18K (750) | ₹10,893 | ₹1,08,930 |
| 14K (585) | ₹8,349 | ₹83,490 |

## Calculation Method

The rates are calculated based on purity multipliers:

```
22K = 24K × 0.916 = 14,525 × 0.916 ≈ ₹13,314/g
18K = 24K × 0.750 = 14,525 × 0.750 ≈ ₹10,893/g
14K = 24K × 0.585 = 14,525 × 0.585 ≈ ₹8,349/g
```

## Where These Rates Are Used

### 1. **Home Page - Live Gold Rate Ticker**
- File: `frontend/src/components/home/LiveGoldRate.tsx`
- Default rate: 14,525 (24K)
- Auto-updates every 5 minutes from backend API
- Shows real-time price changes and trends

### 2. **Admin Dashboard - Invoice Creation**
- File: `frontend/src/app/admin/billing/page.tsx`
- Default gold rate field: 14,525
- Used for calculating jewellery prices
- Formula: (Weight × Gold Rate) + Making Charges

### 3. **Admin Store - Gold Rates**
- File: `frontend/src/store/adminStore.ts`
- Stored rates for all purities
- Used across admin dashboard

### 4. **UI Store - Current Gold Rate**
- File: `frontend/src/store/index.ts`
- Global state for current 24K rate: 14,525
- Updated via live API calls

### 5. **Backend API - Gold Rate Controller**
- File: `backend/src/controllers/goldRateController.ts`
- Fetches live rates from external APIs
- Caches rates with 5-minute expiry
- Calibrates API rates to match current market

## API Endpoints

### GET /api/gold-rates
Returns current gold rate

**Example Response:**
```json
{
  "success": true,
  "data": {
    "rate": 14525,
    "lastUpdated": "2026-07-09T10:30:00.000Z",
    "cached": false
  }
}
```

### POST /api/gold-rates/refresh
Forces refresh from external APIs

## External API Sources

1. **metals.live** - Primary source
2. **goldprice.org** - Fallback source
3. **Market calibration** - Adjusts API rates to match local market

## Update History

| Date | 24K Rate | Change | Notes |
|------|----------|--------|-------|
| Jul 9, 2026 | ₹14,525/g | Updated | Current India market rate |
| Jul 9, 2026 | ₹7,449/g | Old rate | Previous default |

## How to Update Rates Manually

If you need to manually update the gold rates:

### Backend (Default/Fallback Rate)
Edit: `backend/src/controllers/goldRateController.ts`
```typescript
const CURRENT_MARKET_RATES = {
  '24K': 14525,  // Change this value
  '22K': 13314,
  '18K': 10893,
  '14K': 8349
};
```

### Frontend (Initial Rate)
Edit: `frontend/src/store/index.ts`
```typescript
goldRate: 14525, // Change this value
```

## Testing

1. **Check Home Page**:
   - Visit `http://localhost:3000`
   - See live gold rates at bottom of hero section
   - Should show: 24K ₹14,525/g

2. **Check Admin Dashboard**:
   - Visit `http://localhost:3000/admin/billing`
   - Create new invoice
   - Gold Rate field should default to ₹14,525

3. **Test Live Updates**:
   - Wait 5 minutes or click refresh button
   - Rates should update from backend API
   - Check console for API calls

## Notes

- Rates auto-update every 5 minutes
- Backend caches rates to reduce API load
- If external APIs fail, uses current market rate as fallback
- All calculations use per-gram pricing
- Making charges are percentage-based on gold value
- **Current rates reflect India market prices as of July 2026**
