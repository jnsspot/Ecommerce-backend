import pool from '../config/db';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category_id?: string;
  images?: string[];
  sku?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export const getAllProducts = async (
  limit = 20,
  offset = 0,
  category_id?: string
): Promise<Product[]> => {
  let query = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = TRUE
  `;
  const params: (string | number)[] = [];

  if (category_id) {
    params.push(category_id);
    query += ` AND p.category_id = $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name,
      COALESCE(AVG(r.rating), 0) AS avg_rating,
      COUNT(r.id) AS review_count
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN reviews r ON r.product_id = p.id
     WHERE p.id = $1 GROUP BY p.id, c.name`,
    [id]
  );
  return result.rows[0] || null;
};

export const createProduct = async (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const { name, description, price, stock, category_id, images, sku } = data;
  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock, category_id, images, sku)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, description, price, stock, category_id, images, sku]
  );
  return result.rows[0];
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product | null> => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const result = await pool.query(
    `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0] || null;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM products WHERE id = $1', [id]);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const result = await pool.query(
    `SELECT * FROM products WHERE is_active = TRUE AND (name ILIKE $1 OR description ILIKE $1) ORDER BY created_at DESC`,
    [`%${query}%`]
  );
  return result.rows;
};
