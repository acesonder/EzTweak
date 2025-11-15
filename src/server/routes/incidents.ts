import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Get all incidents (filtered by role)
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  let query = `
    SELECT i.*, 
           u.username as reporter_username, u.full_name as reporter_name
    FROM incidents i
    LEFT JOIN users u ON i.reporter_id = u.id
  `;

  let params: any[] = [];

  if (userRole === 'client') {
    query += ' WHERE i.reporter_id = ?';
    params = [userId];
  }

  query += ' ORDER BY i.created_at DESC';

  db.all(query, params, (err, incidents) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching incidents' });
    }
    res.json(incidents);
  });
});

// Get single incident
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const incidentId = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  db.get(
    `SELECT i.*, 
            u.username as reporter_username, u.full_name as reporter_name
     FROM incidents i
     LEFT JOIN users u ON i.reporter_id = u.id
     WHERE i.id = ?`,
    [incidentId],
    (err, incident: any) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching incident' });
      }
      if (!incident) {
        return res.status(404).json({ message: 'Incident not found' });
      }

      // Check permissions
      if (userRole === 'client' && incident.reporter_id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(incident);
    }
  );
});

// Create incident
router.post('/',
  authenticateToken,
  body('incident_type').notEmpty().trim().escape(),
  body('description').notEmpty().trim(),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reporterId = req.user?.id;
    const { incident_type, description, severity, location } = req.body;

    db.run(
      'INSERT INTO incidents (reporter_id, incident_type, description, severity, location, status) VALUES (?, ?, ?, ?, ?, ?)',
      [reporterId, incident_type, description, severity, location || '', 'reported'],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating incident' });
        }
        res.status(201).json({ message: 'Incident reported', id: this.lastID });
      }
    );
  }
);

// Update incident status (staff/admin only)
router.patch('/:id/status',
  authenticateToken,
  authorizeRoles('staff', 'admin'),
  body('status').isIn(['reported', 'investigating', 'resolved']),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const incidentId = req.params.id;

    db.run(
      'UPDATE incidents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, incidentId],
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error updating incident' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Incident not found' });
        }
        res.json({ message: 'Incident status updated' });
      }
    );
  }
);

// Delete incident
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  (req: Request, res: Response) => {
    db.run('DELETE FROM incidents WHERE id = ?', [req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting incident' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Incident not found' });
      }
      res.json({ message: 'Incident deleted' });
    });
  }
);

export default router;
