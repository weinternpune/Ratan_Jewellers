import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController";

const router = Router();

router.get("/", getCustomers);

router.get("/:id", getCustomerById);

// edit and delete 
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
