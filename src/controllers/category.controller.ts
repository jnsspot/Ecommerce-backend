import { Request, Response } from 'express';
import { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../models/category.model';

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await getAllCategories();
  res.json({ categories });
};

export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await getCategoryById(req.params.id as string);
  if (!category) { res.status(404).json({ message: 'Category not found' }); return; }
  res.json({ category });
};

export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const file = req.file;
    const image = file ? `/uploads/${file.filename}` : undefined;
    const category = await createCategory(name, description, image);
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const editCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await updateCategory(req.params.id as string, req.body);
  if (!category) { res.status(404).json({ message: 'Category not found' }); return; }
  res.json({ message: 'Category updated', category });
};

export const removeCategory = async (req: Request, res: Response): Promise<void> => {
  await deleteCategory(req.params.id as string);
  res.json({ message: 'Category deleted' });
};
