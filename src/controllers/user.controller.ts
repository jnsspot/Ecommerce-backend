import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getAllUsers, findUserById, updateUser, deleteUser } from '../models/user.model';

export const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await getAllUsers();
  res.json({ users });
};

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await findUserById(req.params.id as string);
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  res.json({ user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  const file = req.file;
  const fields: Record<string, string> = {};
  if (name) fields.name = name;
  if (file) fields.avatar = `/uploads/${file.filename}`;
  const user = await updateUser(req.user!.id, fields);
  res.json({ message: 'Profile updated', user });
};

export const adminDeleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  await deleteUser(req.params.id as string);
  res.json({ message: 'User deleted' });
};
