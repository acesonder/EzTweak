import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get all referrals (filtered by role)
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  let query = `
    SELECT r.*, 
           client.username as client_username, client.full_name as client_name,
           staff.username as staff_username, staff.full_name as staff_name
    FROM referrals r
    LEFT JOIN users client ON r.client_id = client.id
    LEFT JOIN users staff ON r.staff_id = staff.id
  `;

  let params: any[] = [];

  if (userRole === 'client') {
    query += ' WHERE r.client_id = ?';
    params = [userId];
  } else if (userRole === 'staff') {
    query += ' WHERE r.staff_id = ?';
    params = [userId];
  }

  query += ' ORDER BY r.created_at DESC';

  db.all(query, params, (err, referrals) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching referrals' });
    }
    res.json(referrals);
  });
});

// Get single referral
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const referralId = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  db.get(
    `SELECT r.*, 
            client.username as client_username, client.full_name as client_name,
            staff.username as staff_username, staff.full_name as staff_name
     FROM referrals r
     LEFT JOIN users client ON r.client_id = client.id
     LEFT JOIN users staff ON r.staff_id = staff.id
     WHERE r.id = ?`,
    [referralId],
    (err, referral: any) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching referral' });
      }
      if (!referral) {
        return res.status(404).json({ message: 'Referral not found' });
      }

      // Check permissions
      if (userRole === 'client' && referral.client_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (userRole === 'staff' && referral.staff_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(referral);
    }
  );
});

// Create referral (staff/admin only)
router.post('/',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  body('client_id').isInt(),
  body('service_provider').notEmpty().trim().escape(),
  body('service_type').notEmpty().trim().escape(),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const staffId = req.user?.id;
    const { client_id, service_provider, service_type, notes } = req.body;

    db.run(
      'INSERT INTO referrals (client_id, staff_id, service_provider, service_type, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, staffId, service_provider, service_type, 'pending', notes || ''],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating referral' });
        }
        res.status(201).json({ message: 'Referral created', id: this.lastID });
      }
    );
  }
);

// Update referral status
router.patch('/:id/status',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  body('status').isIn(['pending', 'accepted', 'completed', 'declined']),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, outcome } = req.body;
    const referralId = req.params.id;

    db.run(
      'UPDATE referrals SET status = ?, outcome = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, outcome || null, referralId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error updating referral' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Referral not found' });
        }
        res.json({ message: 'Referral updated' });
      }
    );
  }
);

// Delete referral
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req: Request, res: Response) => {
    db.run('DELETE FROM referrals WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting referral' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Referral not found' });
      }
      res.json({ message: 'Referral deleted' });
    });
  }
);

export default router;
