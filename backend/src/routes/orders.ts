import { Router, RequestHandler } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController';

const router  = Router();
const auth    = authenticate as unknown as RequestHandler;

// Customer routes
router.post('/',          auth, placeOrder    as RequestHandler);
router.get('/my-orders',  auth, getMyOrders   as RequestHandler);
router.get('/:id',        auth, getOrderById  as RequestHandler);
router.patch('/:id/cancel', auth, cancelOrder as RequestHandler);

// Admin routes
router.get('/',           auth, authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER','SALES_STAFF') as RequestHandler, getAllOrders as RequestHandler);
router.put('/:id/status', auth, authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER') as RequestHandler, updateOrderStatus as RequestHandler);
router.delete('/:id',     auth, authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER') as RequestHandler, deleteOrder as RequestHandler);

export default router;