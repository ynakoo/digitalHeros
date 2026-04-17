const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/winners/me — current user's winnings
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const winnings = await prisma.drawWinner.findMany({
      where: { user_id: req.user.id },
      include: {
        draw: { select: { draw_date: true, draw_month: true, draw_year: true, winning_numbers: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    // Map to match frontend expected shape
    const mapped = winnings.map(w => ({ ...w, draws: w.draw }));

    const totalWon = winnings.reduce((sum, w) => sum + parseFloat(w.prize_amount), 0);

    res.json({ winnings: mapped, totalWon });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/winners/:id/upload-proof — upload proof image URL
router.post('/:id/upload-proof', authMiddleware, async (req, res) => {
  try {
    const { proof_image_url } = req.body;

    if (!proof_image_url) {
      return res.status(400).json({ error: 'Proof image URL is required' });
    }

    // Verify ownership
    const winner = await prisma.drawWinner.findFirst({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!winner) return res.status(404).json({ error: 'Winner record not found' });

    const updated = await prisma.drawWinner.update({
      where: { id: req.params.id },
      data: { proof_image_url }
    });

    res.json({ winner: updated });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/winners/:id/verify — admin approve/reject
router.put('/:id/verify', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { verification_status } = req.body;

    if (!['approved', 'rejected'].includes(verification_status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const updated = await prisma.drawWinner.update({
      where: { id: req.params.id },
      data: { verification_status },
      include: { user: { select: { full_name: true, email: true } } }
    });

    res.json({ winner: { ...updated, profiles: updated.user } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/winners/:id/payout — admin mark as paid
router.put('/:id/payout', authMiddleware, adminOnly, async (req, res) => {
  try {
    const updated = await prisma.drawWinner.update({
      where: { id: req.params.id },
      data: { payment_status: 'paid' },
      include: { user: { select: { full_name: true, email: true } } }
    });

    res.json({ winner: { ...updated, profiles: updated.user } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
