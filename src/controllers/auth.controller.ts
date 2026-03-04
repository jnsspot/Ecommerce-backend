import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { createUser, findUserByEmail, findUserById } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middlewares/auth.middleware';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  const { name, email, password } = req.body;
  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await createUser(name, email, hashed);
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({ message: 'Registered successfully', token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
