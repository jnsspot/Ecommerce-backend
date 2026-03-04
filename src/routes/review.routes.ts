import { Router } from 'express';
import { listReviews, addReview, removeReview } from '../controllers/review.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/', listReviews);
router.post('/', authenticate, addReview);
router.delete('/:id', authenticate, authorizeAdmin, removeReview);

export default router;
