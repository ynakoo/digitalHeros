const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');

// POST /api/donations — record a donation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { charity_id, amount } = req.body;

    if (!charity_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Charity and a positive amount are required' });
    }

    const donation = await prisma.donation.create({
      data: {
        user_id: req.user.id,
        charity_id,
        amount: parseFloat(amount),
        status: 'completed'
      },
      include: { charity: { select: { name: true } } }
    });

    res.status(201).json({ donation });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/donations — user's donation history
router.get('/', authMiddleware, async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { user_id: req.user.id },
      include: { charity: { select: { name: true, image_url: true } } },
      orderBy: { created_at: 'desc' }
    });

    res.json({ donations });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/donations/stats — admin: contribution totals
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      include: { charity: { select: { name: true } } }
    });

    const totalDonations = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const byCharity = {};
    donations.forEach(d => {
      const name = d.charity?.name || 'Unknown';
      byCharity[name] = (byCharity[name] || 0) + parseFloat(d.amount);
    });

    res.json({ totalDonations, byCharity, count: donations.length });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
