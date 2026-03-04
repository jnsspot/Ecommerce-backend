import pool from '../config/db';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment?: string;
  created_at: Date;
}

export const getProductReviews = async (productId: string): Promise<Review[]> => {
  const result = await pool.query(
    `SELECT r.*, u.name AS user_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
    [productId]
  );
  return result.rows;
};

export const createReview = async (userId: string, productId: string, rating: number, comment?: string): Promise<Review> => {
  const result = await pool.query(
    `INSERT INTO reviews (user_id, product_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, product_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
     RETURNING *`,
    [userId, productId, rating, comment]
  );
  return result.rows[0];
};

export const deleteReview = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
};
