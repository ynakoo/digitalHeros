const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// All admin routes require auth + admin role
router.use(authMiddleware, adminOnly);

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        include: { charity: { select: { name: true } } },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.profile.count({ where })
    ]);

    // Map to expected shape
    const mapped = users.map(u => ({ ...u, charities: u.charity }));

    res.json({ users: mapped, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users/:id — user detail with scores
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.profile.findUnique({
      where: { id: req.params.id },
      include: { charity: { select: { name: true, image_url: true } } }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const scores = await prisma.score.findMany({
      where: { user_id: req.params.id },
      orderBy: { played_date: 'desc' }
    });

    const winnings = await prisma.drawWinner.findMany({
      where: { user_id: req.params.id },
      include: { draw: { select: { draw_date: true } } },
      orderBy: { created_at: 'desc' }
    });

    // Map to expected shape
    const mappedUser = { ...user, charities: user.charity };
    const mappedWinnings = winnings.map(w => ({ ...w, draws: w.draw }));

    res.json({ user: mappedUser, scores, winnings: mappedWinnings });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:id — edit user
router.put('/users/:id', async (req, res) => {
  try {
    const { full_name, charity_id, charity_percentage, subscription_status, subscription_plan, role } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (charity_id !== undefined) updates.charity_id = charity_id || null;
    if (charity_percentage !== undefined) updates.charity_percentage = Math.max(charity_percentage, 10);
    if (subscription_status !== undefined) updates.subscription_status = subscription_status;
    if (subscription_plan !== undefined) updates.subscription_plan = subscription_plan;
    if (role !== undefined) updates.role = role;

    if (subscription_status === 'active') {
      updates.subscription_start = new Date();
      const end = new Date();
      if (subscription_plan === 'yearly') {
        end.setFullYear(end.getFullYear() + 1);
      } else {
        end.setMonth(end.getMonth() + 1);
      }
      updates.subscription_end = end;
    }

    const user = await prisma.profile.update({
      where: { id: req.params.id },
      data: updates
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:id/scores — admin edit user's scores
router.put('/users/:id/scores', async (req, res) => {
  try {
    const { scores } = req.body;

    if (!Array.isArray(scores)) {
      return res.status(400).json({ error: 'Scores must be an array' });
    }

    const results = [];
    for (const s of scores) {
      if (s.id) {
        const updated = await prisma.score.update({
          where: { id: s.id },
          data: { score: s.score, played_date: new Date(s.played_date) }
        });
        results.push(updated);
      } else {
        const created = await prisma.score.create({
          data: {
            user_id: req.params.id,
            score: s.score,
            played_date: new Date(s.played_date)
          }
        });
        results.push(created);
      }
    }

    res.json({ scores: results });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/reports — aggregate stats
router.get('/reports', async (req, res) => {
  try {
    const [totalUsers, activeSubscribers, totalDraws, publishedDraws] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { subscription_status: 'active' } }),
      prisma.draw.count(),
      prisma.draw.count({ where: { status: 'published' } })
    ]);

    // Total prize pool
    const draws = await prisma.draw.findMany({ select: { total_pool_amount: true } });
    const totalPrizePool = draws.reduce((sum, d) => sum + parseFloat(d.total_pool_amount || 0), 0);

    // Total winnings
    const winnersData = await prisma.drawWinner.findMany({
      select: { prize_amount: true, payment_status: true }
    });
    const totalWinnings = winnersData.reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);
    const totalPaid = winnersData
      .filter(w => w.payment_status === 'paid')
      .reduce((sum, w) => sum + parseFloat(w.prize_amount || 0), 0);

    // Charity donations
    const donationsData = await prisma.donation.findMany({ select: { amount: true } });
    const totalDonations = donationsData.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

    const charityFromSubs = activeSubscribers * 9.99 * 0.10;

    res.json({
      totalUsers,
      activeSubscribers,
      totalDraws,
      publishedDraws,
      totalPrizePool: parseFloat(totalPrizePool.toFixed(2)),
      totalWinnings: parseFloat(totalWinnings.toFixed(2)),
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      totalDonations: parseFloat(totalDonations.toFixed(2)),
      estimatedCharityContributions: parseFloat((totalDonations + charityFromSubs).toFixed(2))
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/winners — all winners
router.get('/winners', async (req, res) => {
  try {
    const winners = await prisma.drawWinner.findMany({
      include: {
        user: { select: { full_name: true, email: true } },
        draw: { select: { draw_date: true, draw_month: true, draw_year: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    // Map to expected shape
    const mapped = winners.map(w => ({
      ...w,
      profiles: w.user,
      draws: w.draw
    }));

    res.json({ winners: mapped });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/draws — all draws (including non-published)
router.get('/draws', async (req, res) => {
  try {
    const draws = await prisma.draw.findMany({
      orderBy: { draw_date: 'desc' }
    });

    res.json({ draws });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
