import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get all orders (filtered by role)
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  let query = `
    SELECT o.*, 
           c.username as client_username, c.full_name as client_name,
           s.username as staff_username, s.full_name as staff_name
    FROM orders o
    LEFT JOIN users c ON o.client_id = c.id
    LEFT JOIN users s ON o.staff_id = s.id
  `;

  let params: any[] = [];

  if (userRole === 'client') {
    query += ' WHERE o.client_id = ?';
    params = [userId];
  } else if (userRole === 'staff') {
    query += ' WHERE o.staff_id = ? OR o.staff_id IS NULL';
    params = [userId];
  }

  query += ' ORDER BY o.created_at DESC';

  db.all(query, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching orders' });
    }
    res.json(orders);
  });
});

// Get single order with items
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const orderId = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  db.get(
    `SELECT o.*, 
            c.username as client_username, c.full_name as client_name,
            s.username as staff_username, s.full_name as staff_name
     FROM orders o
     LEFT JOIN users c ON o.client_id = c.id
     LEFT JOIN users s ON o.staff_id = s.id
     WHERE o.id = ?`,
    [orderId],
    (err, order: any) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching order' });
      }
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check permissions
      if (userRole === 'client' && order.client_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Get order items
      db.all(
        `SELECT oi.*, p.name, p.description, p.icon_url, p.color
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId],
        (err, items) => {
          if (err) {
            return res.status(500).json({ message: 'Error fetching order items' });
          }
          res.json({ ...order, items });
        }
      );
    }
  );
});

// Create order
router.post('/',
  authenticateToken,
  body('order_type').isIn(['delivery', 'pickup']),
  body('items').isArray({ min: 1 }),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { client_id, order_type, delivery_address, delivery_date, notes, items } = req.body;

    // Determine client_id based on role
    const finalClientId = userRole === 'client' ? userId : client_id;

    if (!finalClientId) {
      return res.status(400).json({ message: 'Client ID required' });
    }

    db.run(
      'INSERT INTO orders (client_id, staff_id, status, order_type, delivery_address, delivery_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [finalClientId, userRole === 'staff' || userRole === 'admin' ? userId : null, 'pending', order_type, delivery_address || '', delivery_date || null, notes || ''],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating order' });
        }

        const orderId = this.lastID;
        const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)');

        items.forEach((item: { product_id: number; quantity: number }) => {
          stmt.run(orderId, item.product_id, item.quantity);
        });

        stmt.finalize((err) => {
          if (err) {
            return res.status(500).json({ message: 'Error adding order items' });
          }
          res.status(201).json({ message: 'Order created', id: orderId });
        });
      }
    );
  }
);

// Update order status (staff/admin only)
router.patch('/:id/status',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  body('status').isIn(['pending', 'processing', 'completed', 'cancelled']),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const orderId = req.params.id;

    db.run(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, orderId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error updating order' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order status updated' });
      }
    );
  }
);

// Delete order
router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  const orderId = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  // Check if user can delete this order
  if (userRole === 'client') {
    db.get('SELECT client_id, status FROM orders WHERE id = ?', [orderId], (err, order: any) => {
      if (err || !order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      if (order.client_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (order.status !== 'pending') {
        return res.status(400).json({ message: 'Can only delete pending orders' });
      }

      db.run('DELETE FROM orders WHERE id = ?', [orderId], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error deleting order' });
        }
        res.json({ message: 'Order deleted' });
      });
    });
  } else {
    db.run('DELETE FROM orders WHERE id = ?', [orderId], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting order' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json({ message: 'Order deleted' });
    });
  }
});

export default router;
