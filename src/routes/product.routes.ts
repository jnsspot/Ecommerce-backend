import { Router } from 'express';
import { listProducts, getProduct, search, addProduct, editProduct, removeProduct } from '../controllers/product.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.get('/', listProducts);
router.get('/search', search);
router.get('/:id', getProduct);
router.post('/', authenticate, authorizeAdmin, upload.array('images', 5), addProduct);
router.put('/:id', authenticate, authorizeAdmin, editProduct);
router.delete('/:id', authenticate, authorizeAdmin, removeProduct);

export default router;
