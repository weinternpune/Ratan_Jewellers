import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { placeOrder, getMyOrders, getOrderById, cancelOrder } from '../controllers/orderController';

const router  = Router();
const auth    = authenticate as unknown as RequestHandler;

router.post('/',          auth, placeOrder    as RequestHandler);
router.get('/my-orders',  auth, getMyOrders   as RequestHandler);
router.get('/:id',        auth, getOrderById  as RequestHandler);
router.patch('/:id/cancel', auth, cancelOrder as RequestHandler);

export default router;