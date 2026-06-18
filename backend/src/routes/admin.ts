import { Router } from 'express';
import {
  clearAllBillingData,
  getDashboardStats,
  getAllUsers,
} from "../controllers/adminController";
import { authenticate, authorize } from '../middleware/auth';


const router = Router();
router.use(authenticate);

// Only Super Admin, Admin, and Store Manager can access these routes
router.delete('/clear-billing-data', authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER'), clearAllBillingData);
router.get('/dashboard-stats', authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF'), getDashboardStats);

router.get("/users", authorize("SUPER_ADMIN", "ADMIN"), getAllUsers);

export default router;