import { Router } from 'express';
import { getCart, addToCart, updateCart, removeFromCart, emptyCart } from '../controllers/cart.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCart);
router.delete('/clear', emptyCart);
router.delete('/:productId', removeFromCart);

export default router;
