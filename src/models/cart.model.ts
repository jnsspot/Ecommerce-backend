import pool from '../config/db';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product_name?: string;
  price?: number;
  images?: string[];
}

export const getOrCreateCart = async (userId: string): Promise<{ id: string }> => {
  let result = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (result.rows.length === 0) {
    result = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  }
  return result.rows[0];
};

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const result = await pool.query(
    `SELECT ci.*, p.name AS product_name, p.price, p.images
     FROM carts c
     JOIN cart_items ci ON ci.cart_id = c.id
     JOIN products p ON p.id = ci.product_id
     WHERE c.user_id = $1`,
    [userId]
  );
  return result.rows;
};

export const addCartItem = async (cartId: string, productId: string, quantity: number): Promise<CartItem> => {
  const result = await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, product_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
     RETURNING *`,
    [cartId, productId, quantity]
  );
  return result.rows[0];
};

export const updateCartItem = async (cartId: string, productId: string, quantity: number): Promise<CartItem | null> => {
  const result = await pool.query(
    `UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *`,
    [quantity, cartId, productId]
  );
  return result.rows[0] || null;
};

export const removeCartItem = async (cartId: string, productId: string): Promise<void> => {
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
};

export const clearCart = async (cartId: string): Promise<void> => {
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
};
