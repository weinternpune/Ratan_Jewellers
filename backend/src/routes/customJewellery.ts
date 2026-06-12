import { Router, RequestHandler } from 'express';
import { createRequest, getRequests } from '../controllers/customJewelleryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const auth   = authenticate as unknown as RequestHandler;

router.post('/',  createRequest as RequestHandler);
router.get('/',   auth, authorize('ADMIN','SUPER_ADMIN','STORE_MANAGER') as unknown as RequestHandler, getRequests as RequestHandler);

export default router;
