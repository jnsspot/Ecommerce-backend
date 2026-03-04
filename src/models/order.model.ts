import pool from '../config/db';

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_address: object;
  stripe_payment_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export const createOrder = async (
  userId: string,
  total: number,
  shippingAddress: object,
  items: OrderItem[],
  stripePaymentId?: string
): Promise<Order> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, shipping_address, stripe_payment_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, total, JSON.stringify(shippingAddress), stripePaymentId]
    );
    const order: Order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const result = await pool.query(
    `SELECT o.*, json_agg(json_build_object(
       'product_id', oi.product_id,
       'quantity', oi.quantity,
       'price', oi.price,
       'name', p.name
     )) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.user_id = $1
     GROUP BY o.id ORDER BY o.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const result = await pool.query(
    `SELECT o.*, json_agg(json_build_object(
       'product_id', oi.product_id,
       'quantity', oi.quantity,
       'price', oi.price,
       'name', p.name
     )) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE o.id = $1
     GROUP BY o.id`,
    [id]
  );
  return result.rows[0] || null;
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<Order | null> => {
  const result = await pool.query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const result = await pool.query(
    `SELECT o.*, u.name AS user_name, u.email AS user_email
     FROM orders o
     LEFT JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return result.rows;
};
