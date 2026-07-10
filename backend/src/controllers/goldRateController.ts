import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

// Cache for gold rates (in-memory)
let cachedGoldRate: {
  rate: number;
  lastUpdated: Date;
} = {
  rate: 14525, // Default 24K rate per gram (updated to current India market rate)
  lastUpdated: new Date()
};

// Current market rates per gram (INR) - Updated to current India gold prices
const CURRENT_MARKET_RATES = {
  '24K': 14525,   // Current India market rate ₹14,525/g
  '22K': 13314,   // Current India market rate ₹13,314/g  
  '18K': 10893,   // Current India market rate ₹10,893/g
  '14K': 8349     // Current India market rate ₹8,349/g
};

// Fetch live gold rate from external API
async function fetchLiveGoldRate(): Promise<number | null> {
  try {
    // Method 1: Try GoldAPI.io (India specific rates)
    // Note: Free tier available, need API key for production
    // For now, using public endpoints
    const response = await axios.get('https://www.goldapi.io/api/XAU/INR', {
      timeout: 5000,
      headers: {
        'x-access-token': process.env.GOLD_API_KEY || 'goldapi-demo-key'
      }
    });
    
    if (response.data && response.data.price_gram_24k) {
      const ratePerGram = Math.round(response.data.price_gram_24k);
      console.log('✅ Gold rate fetched from GoldAPI.io:', ratePerGram);
      return ratePerGram;
    }
  } catch (error) {
    console.log('GoldAPI.io failed, trying alternative...');
  }

  try {
    // Method 2: Try metals-api.com (supports INR)
    const response = await axios.get('https://metals-api.com/api/latest', {
      timeout: 5000,
      params: {
        access_key: process.env.METALS_API_KEY || 'demo',
        base: 'XAU',
        symbols: 'INR'
      }
    });
    
    if (response.data && response.data.rates && response.data.rates.INR) {
      // Convert per troy ounce to per gram
      const inrPerOunce = response.data.rates.INR;
      const inrPerGram = Math.round(inrPerOunce / 31.1035);
      console.log('✅ Gold rate fetched from metals-api.com:', inrPerGram);
      return inrPerGram;
    }
  } catch (error) {
    console.log('metals-api.com failed, trying global APIs...');
  }

  try {
    // Method 3: Try metals.live API (global prices)
    const response = await axios.get('https://api.metals.live/v1/spot/gold', {
      timeout: 5000
    });
    
    if (response.data && response.data[0]?.price) {
      const usdPerOunce = response.data[0].price;
      // Convert USD per ounce to INR per gram
      // Get live USD to INR rate or use approximate 83
      const usdToInr = 83; // Can fetch live exchange rate from forex API
      const inrPerGram = (usdPerOunce * usdToInr) / 31.1035;
      const calculatedRate = Math.round(inrPerGram);
      
      console.log('✅ Gold rate calculated from metals.live:', calculatedRate);
      return calculatedRate;
    }
  } catch (error) {
    console.log('metals.live API failed, trying another...');
  }

  try {
    // Method 4: Try goldprice.org unofficial API
    const response = await axios.get('https://data-asg.goldprice.org/dbXRates/USD', {
      timeout: 5000
    });
    
    if (response.data && response.data.items) {
      const goldData = response.data.items.find((item: any) => item.curr === 'XAU');
      if (goldData) {
        const usdPerOunce = parseFloat(goldData.xauPrice);
        const usdToInr = 83;
        const inrPerGram = (usdPerOunce * usdToInr) / 31.1035;
        const calculatedRate = Math.round(inrPerGram);
        
        console.log('✅ Gold rate calculated from goldprice.org:', calculatedRate);
        return calculatedRate;
      }
    }
  } catch (error) {
    console.log('goldprice.org API failed');
  }

  console.log('⚠️ All APIs failed, using market rate');
  return null;
}

export const getLiveGoldRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if cache is fresh (< 5 minutes old)
    const now = new Date();
    const cacheAge = now.getTime() - cachedGoldRate.lastUpdated.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (cacheAge < fiveMinutes) {
      // Return cached rate
      return res.json({
        success: true,
        data: {
          rate: cachedGoldRate.rate,
          lastUpdated: cachedGoldRate.lastUpdated,
          cached: true
        }
      });
    }

    // Fetch fresh rate
    const liveRate = await fetchLiveGoldRate();

    if (liveRate) {
      cachedGoldRate = {
        rate: liveRate,
        lastUpdated: now
      };

      return res.json({
        success: true,
        data: {
          rate: liveRate,
          lastUpdated: now,
          cached: false
        }
      });
    } else {
      // Return current market rate as fallback
      cachedGoldRate = {
        rate: CURRENT_MARKET_RATES['24K'],
        lastUpdated: now
      };
      
      return res.json({
        success: true,
        data: {
          rate: CURRENT_MARKET_RATES['24K'],
          lastUpdated: now,
          cached: true,
          warning: 'Using current market rate - external APIs unavailable'
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

export const refreshGoldRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const liveRate = await fetchLiveGoldRate();

    if (liveRate) {
      cachedGoldRate = {
        rate: liveRate,
        lastUpdated: new Date()
      };

      // Update all purity rates based on the fetched 24K rate
      CURRENT_MARKET_RATES['24K'] = liveRate;
      CURRENT_MARKET_RATES['22K'] = Math.round(liveRate * 0.916);
      CURRENT_MARKET_RATES['18K'] = Math.round(liveRate * 0.750);
      CURRENT_MARKET_RATES['14K'] = Math.round(liveRate * 0.585);

      return res.json({
        success: true,
        message: 'Gold rates refreshed successfully from market',
        data: {
          rates: CURRENT_MARKET_RATES,
          lastUpdated: cachedGoldRate.lastUpdated
        }
      });
    } else {
      // Return current market rate
      cachedGoldRate = {
        rate: CURRENT_MARKET_RATES['24K'],
        lastUpdated: new Date()
      };
      
      return res.json({
        success: true,
        message: 'Using current market rates - external APIs unavailable',
        data: {
          rates: CURRENT_MARKET_RATES,
          lastUpdated: cachedGoldRate.lastUpdated
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

// Manual update of gold rates (admin only)
export const updateGoldRate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rate } = req.body;
    
    if (!rate || rate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gold rate'
      });
    }

    // Update cache with manual rate
    cachedGoldRate = {
      rate: Math.round(rate),
      lastUpdated: new Date()
    };

    // Also update market rates reference
    CURRENT_MARKET_RATES['24K'] = Math.round(rate);
    CURRENT_MARKET_RATES['22K'] = Math.round(rate * 0.916);
    CURRENT_MARKET_RATES['18K'] = Math.round(rate * 0.750);
    CURRENT_MARKET_RATES['14K'] = Math.round(rate * 0.585);

    return res.json({
      success: true,
      message: 'Gold rates updated successfully',
      data: {
        rates: CURRENT_MARKET_RATES,
        lastUpdated: cachedGoldRate.lastUpdated
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all purity rates
export const getAllRates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.json({
      success: true,
      data: {
        rates: CURRENT_MARKET_RATES,
        lastUpdated: cachedGoldRate.lastUpdated
      }
    });
  } catch (err) {
    next(err);
  }
};
