import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createOrder, getOrdersByUser, getOrderById, updateOrderStatus, getAllOrders } from '../models/order.model';
import { getCartItems, clearCart, getOrCreateCart } from '../models/cart.model';

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { shipping_address } = req.body;
    const cartItems = await getCartItems(userId);
    if (cartItems.length === 0) {
      res.status(400).json({ message: 'Cart is empty' });
      return;
    }
    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const items = cartItems.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      price: Number(i.price),
    }));
    const order = await createOrder(userId, total, shipping_address, items);
    const cart = await getOrCreateCart(userId);
    await clearCart(cart.id);
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const myOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await getOrdersByUser(req.user!.id);
  res.json({ orders });
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await getOrderById(req.params.id as string);
  if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
  if (order.user_id !== req.user!.id && req.user!.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  res.json({ order });
};

export const adminGetAllOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  const orders = await getAllOrders();
  res.json({ orders });
};

export const adminUpdateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await updateOrderStatus(req.params.id as string, req.body.status);
  if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
  res.json({ message: 'Order status updated', order });
};
