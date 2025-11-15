import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, (req: Request, res: Response) => {
  db.all('SELECT * FROM products ORDER BY name', (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching products' });
    }
    res.json(products);
  });
});

// Get single product
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching product' });
    }
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });
});

// Create product (staff/admin only)
router.post('/',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  body('name').notEmpty().trim().escape(),
  body('category').notEmpty().trim(),
  body('stock_quantity').isInt({ min: 0 }),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, stock_quantity, color, font_color, icon_url } = req.body;

    db.run(
      'INSERT INTO products (name, description, category, stock_quantity, color, font_color, icon_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', category, stock_quantity, color || '#4a90e2', font_color || '#ffffff', icon_url || ''],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating product' });
        }
        res.status(201).json({ message: 'Product created', id: this.lastID });
      }
    );
  }
);

// Update product (staff/admin only)
router.put('/:id',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  (req: Request, res: Response) => {
    const { name, description, category, stock_quantity, color, font_color, icon_url } = req.body;

    db.run(
      'UPDATE products SET name = ?, description = ?, category = ?, stock_quantity = ?, color = ?, font_color = ?, icon_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, category, stock_quantity, color, font_color, icon_url, req.params.id],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error updating product' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated' });
      }
    );
  }
);

// Delete product (admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req: Request, res: Response) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting product' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted' });
    });
  }
);

// Get user favorites
router.get('/favorites/list', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  db.all(
    `SELECT p.* FROM products p
     INNER JOIN user_favorites uf ON p.id = uf.product_id
     WHERE uf.user_id = ?`,
    [userId],
    (err, favorites) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching favorites' });
      }
      res.json(favorites);
    }
  );
});

// Add to favorites
router.post('/favorites/:productId', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  const productId = req.params.productId;

  db.run(
    'INSERT INTO user_favorites (user_id, product_id) VALUES (?, ?)',
    [userId, productId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ message: 'Already in favorites' });
        }
        return res.status(500).json({ message: 'Error adding to favorites' });
      }
      res.status(201).json({ message: 'Added to favorites' });
    }
  );
});

// Remove from favorites
router.delete('/favorites/:productId', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  const productId = req.params.productId;

  db.run(
    'DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error removing from favorites' });
      }
      res.json({ message: 'Removed from favorites' });
    }
  );
});

export default router;
