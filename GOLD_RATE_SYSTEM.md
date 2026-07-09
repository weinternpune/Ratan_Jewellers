# Live Gold Rate System

## Overview
The system automatically fetches live gold rates from external APIs and displays them on the home page with automatic updates.

## Features

### 1. **Automatic Rate Fetching**
- Fetches live gold rates from external APIs every 5 minutes
- Converts USD per ounce to INR per gram
- Displays rates for 24K, 22K, 18K, and 14K gold

### 2. **Backend Caching**
- Backend API caches gold rates for 5 minutes
- Reduces API calls to external services
- Provides fallback rates if external APIs are unavailable

### 3. **Manual Refresh**
- Users can manually refresh rates using the refresh button
- Button shows spinning animation during fetch

### 4. **Price Trend Display**
- Shows if gold rate is going up (green) or down (red)
- Displays absolute change and percentage change
- Updates in real-time

## API Endpoints

### GET /api/gold-rates
Returns current gold rate (cached or live)

**Response:**
```json
{
  "success": true,
  "data": {
    "rate": 6520,
    "lastUpdated": "2026-07-09T10:30:00.000Z",
    "cached": false
  }
}
```

### POST /api/gold-rates/refresh
Forces a fresh fetch from external APIs

**Response:**
```json
{
  "success": true,
  "message": "Gold rate refreshed successfully",
  "data": {
    "rate": 6525,
    "lastUpdated": "2026-07-09T10:35:00.000Z"
  }
}
```

## External APIs Used

### 1. **metals.live API**
- Endpoint: `https://api.metals.live/v1/spot/gold`
- Free tier available
- Returns USD per ounce

### 2. **goldprice.org API (Fallback)**
- Endpoint: `https://data-asg.goldprice.org/dbXRates/USD`
- Unofficial API
- Returns gold rates in various formats

## Conversion Formula

```
INR per gram = (USD per ounce × INR-USD rate) / 31.1035

Where:
- 1 troy ounce = 31.1035 grams
- Current USD-INR rate ≈ 83 (hardcoded, should be dynamic)
```

## Auto-Update Schedule

| Update Type | Frequency | Trigger |
|-------------|-----------|---------|
| Automatic   | Every 5 minutes | Timer in component |
| Backend Cache Refresh | Every 5 minutes | First request after cache expiry |
| Manual | On-demand | User clicks refresh button |

## Display Format

The home page shows:
- **24K (999)**: ₹6,520/g
- **22K (916)**: ₹5,972/g
- **18K (750)**: ₹4,890/g
- **14K (585)**: ₹3,814/g

## How It Works

1. **Component Mount**: Frontend fetches initial gold rate from backend
2. **Backend Processing**: 
   - Checks cache (< 5 minutes old → return cached)
   - If cache expired → fetch from external APIs
   - Update cache and return fresh rate
3. **Frontend Display**: 
   - Shows all purity levels with calculated rates
   - Displays trend (up/down) and change percentage
   - Shows last updated time
4. **Auto-Update**: 
   - Timer triggers fetch every 5 minutes
   - Updates UI with new rates
   - Compares with previous rate to show trend

## Error Handling

- If external APIs fail → use cached rate
- If both APIs fail → fallback to random variation (for demo)
- User sees warning "Using cached rate" in console
- Rate continues to display (never shows error to user)

## Future Improvements

1. **Dynamic USD-INR Conversion**: Use real-time currency API
2. **Multiple Metal Support**: Add Silver, Platinum rates
3. **Historical Data**: Store and display price history charts
4. **Price Alerts**: Notify users when rates reach target price
5. **Regional Rates**: Support different cities (Mumbai, Delhi, etc.)
6. **Admin Control**: Allow admin to set custom rates if APIs fail

## Installation

### Backend
```bash
cd backend
npm install axios  # If not already installed
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

The gold rates will automatically start updating on the home page!

## Testing

1. Visit home page: `http://localhost:3000`
2. Check console for API call logs
3. Click refresh button to manually update
4. Wait 5 minutes to see automatic update
5. Check backend console for cache logs

## Configuration

To change update frequency, edit:
- `frontend/src/components/home/LiveGoldRate.tsx` (line 63)
- Change `300000` (5 minutes) to your desired interval in milliseconds

To change USD-INR conversion rate:
- `backend/src/controllers/goldRateController.ts` (lines 18, 34)
- Update the `83` value to current exchange rate
