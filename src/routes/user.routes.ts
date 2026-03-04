import { Router } from 'express';
import { listUsers, getUser, updateProfile, adminDeleteUser } from '../controllers/user.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', updateProfile); // will be GET /users/profile
router.put('/profile', upload.single('avatar'), updateProfile);
router.get('/', authorizeAdmin, listUsers);
router.get('/:id', authorizeAdmin, getUser);
router.delete('/:id', authorizeAdmin, adminDeleteUser);

export default router;
