import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createReview, deleteReview, getProductReviews } from '../models/review.model';

export const listReviews = async (req: Request, res: Response): Promise<void> => {
  const reviews = await getProductReviews(req.params.productId as string);
  res.json({ reviews });
};

export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { rating, comment } = req.body;
  const review = await createReview(req.user!.id, req.params.productId as string, rating, comment);
  res.status(201).json({ message: 'Review submitted', review });
};

export const removeReview = async (req: AuthRequest, res: Response): Promise<void> => {
  await deleteReview(req.params.id as string);
  res.json({ message: 'Review deleted' });
};
