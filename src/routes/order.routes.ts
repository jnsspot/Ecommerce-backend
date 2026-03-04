import { Router } from 'express';
import { placeOrder, myOrders, getOrder, adminGetAllOrders, adminUpdateOrderStatus } from '../controllers/order.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', placeOrder);
router.get('/my', myOrders);
router.get('/:id', getOrder);

// Admin routes
router.get('/', authorizeAdmin, adminGetAllOrders);
router.patch('/:id/status', authorizeAdmin, adminUpdateOrderStatus);

export default router;
