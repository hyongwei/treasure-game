import { Router, Response } from 'express';
import db from '../database.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/scores — save a game result
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { score } = req.body;

  if (typeof score !== 'number') {
    res.status(400).json({ error: 'Score must be a number' });
    return;
  }

  const result = db
    .prepare('INSERT INTO scores (user_id, score) VALUES (?, ?)')
    .run(req.user!.id, score);

  const saved = db
    .prepare('SELECT id, score, played_at FROM scores WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(saved);
});

// GET /api/scores/me — get current user's score history
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const scores = db
    .prepare('SELECT id, score, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC')
    .all(req.user!.id);

  res.json(scores);
});

export default router;
