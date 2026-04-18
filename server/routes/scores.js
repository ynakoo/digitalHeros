const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const subscriberOnly = require('../middleware/subscriberOnly');

// GET /api/scores — fetch user's scores (max 5, desc by date)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const scores = await prisma.score.findMany({
      where: { user_id: req.user.id },
      orderBy: { played_date: 'desc' },
      take: 5
    });

    res.json({ scores });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/scores — add a new score
router.post('/', authMiddleware, subscriberOnly, async (req, res) => {
  try {
    const { score, played_date } = req.body;

    // Validate score range
    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45 (Stableford format)' });
    }

    if (!played_date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const dateObj = new Date(played_date);

    // Check for duplicate date
    const existing = await prisma.score.findUnique({
      where: {
        user_id_played_date: {
          user_id: req.user.id,
          played_date: dateObj
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'A score already exists for this date. Please edit or delete it.' });
    }

    // Check current score count
    const allScores = await prisma.score.findMany({
      where: { user_id: req.user.id },
      orderBy: { played_date: 'asc' }
    });

    // If already 5 scores, delete the oldest
    if (allScores.length >= 5) {
      await prisma.score.delete({
        where: { id: allScores[0].id }
      });
    }

    // Insert new score
    const newScore = await prisma.score.create({
      data: {
        user_id: req.user.id,
        score: parseInt(score),
        played_date: dateObj
      }
    });

    res.status(201).json({ score: newScore });
  } catch (err) {
    console.error('Score create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/scores/:id — edit a score
router.put('/:id', authMiddleware, subscriberOnly, async (req, res) => {
  try {
    const { score, played_date } = req.body;

    // Validate ownership
    const existing = await prisma.score.findFirst({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Score not found' });
    }

    if (score && (score < 1 || score > 45)) {
      return res.status(400).json({ error: 'Score must be between 1 and 45' });
    }

    // Check date conflict if date is changing
    if (played_date && new Date(played_date).toISOString() !== existing.played_date.toISOString()) {
      const dateCheck = await prisma.score.findFirst({
        where: {
          user_id: req.user.id,
          played_date: new Date(played_date),
          NOT: { id: req.params.id }
        }
      });

      if (dateCheck) {
        return res.status(400).json({ error: 'A score already exists for this date' });
      }
    }

    const updates = {};
    if (score) updates.score = parseInt(score);
    if (played_date) updates.played_date = new Date(played_date);

    const updated = await prisma.score.update({
      where: { id: req.params.id },
      data: updates
    });

    res.json({ score: updated });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/scores/:id
router.delete('/:id', authMiddleware, subscriberOnly, async (req, res) => {
  try {
    const existing = await prisma.score.findFirst({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Score not found' });
    }

    await prisma.score.delete({ where: { id: req.params.id } });
    res.json({ message: 'Score deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
