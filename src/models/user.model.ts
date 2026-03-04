import pool from '../config/db';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  avatar?: string;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query('SELECT id, name, email, role, avatar, is_verified, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createUser = async (name: string, email: string, hashedPassword: string): Promise<User> => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
    [name, email, hashedPassword]
  );
  return result.rows[0];
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query('SELECT id, name, email, role, avatar, is_verified, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

export const updateUser = async (id: string, fields: Partial<User>): Promise<User | null> => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const result = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING id, name, email, role, avatar`,
    [...values, id]
  );
  return result.rows[0] || null;
};

export const deleteUser = async (id: string): Promise<void> => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
