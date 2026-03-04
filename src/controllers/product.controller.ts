import { Request, Response } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '../models/product.model';
import { getProductReviews } from '../models/review.model';

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const category_id = req.query.category_id as string | undefined;
  const products = await getAllProducts(limit, offset, category_id);
  res.json({ products });
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await getProductById(req.params.id as string);
  if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
  const reviews = await getProductReviews(product.id);
  res.json({ product: { ...product, reviews } });
};

export const search = async (req: Request, res: Response): Promise<void> => {
  const q = req.query.q as string;
  if (!q) { res.status(400).json({ message: 'Query param q is required' }); return; }
  const products = await searchProducts(q);
  res.json({ products });
};

export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map((f) => `/uploads/${f.filename}`) : [];
    const product = await createProduct({ ...req.body, images, is_active: true });
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const editProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await updateProduct(req.params.id as string, req.body);
  if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
  res.json({ message: 'Product updated', product });
};

export const removeProduct = async (req: Request, res: Response): Promise<void> => {
  await deleteProduct(req.params.id as string);
  res.json({ message: 'Product deleted' });
};
