import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

const staffRoles = ["SALES_STAFF", "INVENTORY_MANAGER", "STORE_MANAGER", "ADMIN", "SUPER_ADMIN"] as const;

router.get("/", authorize(...staffRoles), getCustomers);

router.get("/:id", authorize(...staffRoles), getCustomerById);

// edit and delete 
router.put("/:id", authorize(...staffRoles), updateCustomer);
router.delete("/:id", authorize("ADMIN", "SUPER_ADMIN", "STORE_MANAGER"), deleteCustomer);

export default router;
