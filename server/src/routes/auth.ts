import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
    res.status(400).json({ error: 'Username must be 3-20 alphanumeric characters' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);

  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign({ id: result.lastInsertRowid, username }, secret, { expiresIn: '7d' });

  res.status(201).json({ token, username });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = db.prepare('SELECT id, username, password FROM users WHERE username = ?').get(username) as
    | { id: number; username: string; password: string }
    | undefined;

  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn: '7d' });

  res.json({ token, username: user.username });
});

export default router;
