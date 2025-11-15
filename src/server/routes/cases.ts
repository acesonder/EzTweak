import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get all cases (filtered by role)
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  let query = `
    SELECT c.*, 
           client.username as client_username, client.full_name as client_name,
           staff.username as staff_username, staff.full_name as staff_name
    FROM cases c
    LEFT JOIN users client ON c.client_id = client.id
    LEFT JOIN users staff ON c.staff_id = staff.id
  `;

  let params: any[] = [];

  if (userRole === 'client') {
    query += ' WHERE c.client_id = ?';
    params = [userId];
  } else if (userRole === 'staff') {
    query += ' WHERE c.staff_id = ?';
    params = [userId];
  }

  query += ' ORDER BY c.created_at DESC';

  db.all(query, params, (err, cases) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching cases' });
    }
    res.json(cases);
  });
});

// Get single case with notes
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  db.get(
    `SELECT c.*, 
            client.username as client_username, client.full_name as client_name,
            staff.username as staff_username, staff.full_name as staff_name
     FROM cases c
     LEFT JOIN users client ON c.client_id = client.id
     LEFT JOIN users staff ON c.staff_id = staff.id
     WHERE c.id = ?`,
    [caseId],
    (err, caseData: any) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching case' });
      }
      if (!caseData) {
        return res.status(404).json({ message: 'Case not found' });
      }

      // Check permissions
      if (userRole === 'client' && caseData.client_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (userRole === 'staff' && caseData.staff_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Get case notes
      db.all(
        `SELECT cn.*, u.username, u.full_name
         FROM case_notes cn
         JOIN users u ON cn.staff_id = u.id
         WHERE cn.case_id = ?
         ORDER BY cn.created_at DESC`,
        [caseId],
        (err, notes) => {
          if (err) {
            return res.status(500).json({ message: 'Error fetching case notes' });
          }
          res.json({ ...caseData, notes });
        }
      );
    }
  );
});

// Create case (staff/admin only)
router.post('/',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  body('client_id').isInt(),
  body('title').notEmpty().trim().escape(),
  body('status').isIn(['open', 'in_progress', 'closed']),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const staffId = req.user?.id;
    const { client_id, title, description, status, priority } = req.body;

    db.run(
      'INSERT INTO cases (client_id, staff_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, staffId, title, description || '', status, priority || 'medium'],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating case' });
        }
        res.status(201).json({ message: 'Case created', id: this.lastID });
      }
    );
  }
);

// Update case
router.put('/:id',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  (req: Request, res: Response) => {
    const caseId = req.params.id;
    const { title, description, status, priority } = req.body;

    db.run(
      'UPDATE cases SET title = ?, description = ?, status = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, status, priority, caseId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error updating case' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Case not found' });
        }
        res.json({ message: 'Case updated' });
      }
    );
  }
);

// Add case note
router.post('/:id/notes',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  body('note').notEmpty().trim(),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const caseId = req.params.id;
    const staffId = req.user?.id;
    const { note, is_private } = req.body;

    db.run(
      'INSERT INTO case_notes (case_id, staff_id, note, is_private) VALUES (?, ?, ?, ?)',
      [caseId, staffId, note, is_private ? 1 : 0],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error adding case note' });
        }
        res.status(201).json({ message: 'Case note added', id: this.lastID });
      }
    );
  }
);

// Delete case
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req: Request, res: Response) => {
    db.run('DELETE FROM cases WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting case' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Case not found' });
      }
      res.json({ message: 'Case deleted' });
    });
  }
);

export default router;
