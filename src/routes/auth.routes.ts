import { Router } from 'express';
import { register, login, getMe, registerValidation } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
