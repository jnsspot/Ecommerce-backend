import pool from '../config/db';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  created_at: Date;
}

export const getAllCategories = async (): Promise<Category[]> => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createCategory = async (name: string, description?: string, image?: string): Promise<Category> => {
  const result = await pool.query(
    'INSERT INTO categories (name, description, image) VALUES ($1, $2, $3) RETURNING *',
    [name, description, image]
  );
  return result.rows[0];
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category | null> => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const result = await pool.query(
    `UPDATE categories SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0] || null;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
};
