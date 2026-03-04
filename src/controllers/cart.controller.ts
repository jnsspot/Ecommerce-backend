import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getOrCreateCart, getCartItems, addCartItem, updateCartItem, removeCartItem, clearCart } from '../models/cart.model';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await getCartItems(req.user!.id);
  const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  res.json({ items, total });
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { product_id, quantity = 1 } = req.body;
  const cart = await getOrCreateCart(req.user!.id);
  const item = await addCartItem(cart.id, product_id, quantity);
  res.status(201).json({ message: 'Item added to cart', item });
};

export const updateCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { product_id, quantity } = req.body;
  const cart = await getOrCreateCart(req.user!.id);
  const item = await updateCartItem(cart.id, product_id, quantity);
  if (!item) { res.status(404).json({ message: 'Cart item not found' }); return; }
  res.json({ message: 'Cart updated', item });
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await getOrCreateCart(req.user!.id);
  await removeCartItem(cart.id, req.params.productId as string);
  res.json({ message: 'Item removed from cart' });
};

export const emptyCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const cart = await getOrCreateCart(req.user!.id);
  await clearCart(cart.id);
  res.json({ message: 'Cart cleared' });
};
