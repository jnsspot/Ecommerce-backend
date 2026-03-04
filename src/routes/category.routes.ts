import { Router } from 'express';
import { listCategories, getCategory, addCategory, editCategory, removeCategory } from '../controllers/category.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, authorizeAdmin, upload.single('image'), addCategory);
router.put('/:id', authenticate, authorizeAdmin, editCategory);
router.delete('/:id', authenticate, authorizeAdmin, removeCategory);

export default router;
