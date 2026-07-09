import { Router } from 'express';
import { getLiveGoldRate, refreshGoldRate, updateGoldRate, getAllRates } from '../controllers/goldRateController';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/gold-rates - Get current 24K gold rate
router.get('/', getLiveGoldRate);

// GET /api/gold-rates/all - Get all purity rates
router.get('/all', getAllRates);

// POST /api/gold-rates/refresh - Force refresh gold rate from external APIs
router.post('/refresh', refreshGoldRate);

// POST /api/gold-rates/update - Manually update gold rate (admin only)
router.post('/update', authenticate, updateGoldRate);

export default router;
