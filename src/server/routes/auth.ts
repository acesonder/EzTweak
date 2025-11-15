import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database';

const router = express.Router();

// Register new user
router.post('/register',
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['client', 'staff', 'admin']),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, full_name } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run(
        'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, full_name || ''],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ message: 'Username or email already exists' });
            }
            return res.status(500).json({ message: 'Error creating user' });
          }

          const token = jwt.sign(
            { id: this.lastID, username, role },
            process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: this.lastID, username, email, role, full_name }
          });
        }
      );
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post('/login',
  body('username').trim().escape(),
  body('password').exists(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    db.get(
      'SELECT id, username, email, password, role, full_name, profile_image FROM users WHERE username = ?',
      [username],
      async (err, user: any) => {
        if (err) {
          return res.status(500).json({ message: 'Server error' });
        }

        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
          { expiresIn: '7d' }
        );

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            profile_image: user.profile_image
          }
        });
      }
    );
  }
);

export default router;
