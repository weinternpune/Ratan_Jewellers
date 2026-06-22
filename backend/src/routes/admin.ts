import { Router } from 'express';
import {
  clearAllBillingData,
  getDashboardStats,
  getAllUsers,
  createStaffUser,
  getUserById,
  resetStaffPassword,
  deleteUser,
} from "../controllers/adminController";
import { authenticate, authorize } from '../middleware/auth';


const router = Router();
router.use(authenticate);

// Only Super Admin, Admin, and Store Manager can access these routes
router.delete('/clear-billing-data', authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER'), clearAllBillingData);
router.get('/dashboard-stats', authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF'), getDashboardStats);

router.get("/users", authorize("SUPER_ADMIN", "ADMIN"), getAllUsers);
router.post("/users", authorize("SUPER_ADMIN"), createStaffUser);
router.get("/users/:id", authorize("SUPER_ADMIN", "ADMIN"), getUserById);
router.post("/users/:id/reset-password", authorize("SUPER_ADMIN"), resetStaffPassword);

//delete route
router.delete("/users/:id", authorize("SUPER_ADMIN"), deleteUser);

export default router;
