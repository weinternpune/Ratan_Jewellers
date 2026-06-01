import { Router } from 'express';
import { getSalesDashboard, getInventoryAnalytics, getCustomerAnalytics } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
const router = Router();
router.use(authenticate, authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER'));
router.get('/sales', getSalesDashboard);
router.get('/inventory', getInventoryAnalytics);
router.get('/customers', getCustomerAnalytics);
export default router;
