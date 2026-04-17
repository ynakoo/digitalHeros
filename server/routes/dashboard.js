const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');

// GET /api/dashboard/summary — aggregated dashboard data
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Scores
    const scores = await prisma.score.findMany({
      where: { user_id: userId },
      orderBy: { played_date: 'desc' },
      take: 5
    });

    // Charity info
    let charity = null;
    if (req.user.charity_id) {
      charity = await prisma.charity.findUnique({
        where: { id: req.user.charity_id },
        select: { id: true, name: true, image_url: true }
      });
    }

    // Winnings
    const winnings = await prisma.drawWinner.findMany({
      where: { user_id: userId },
      include: { draw: { select: { draw_date: true, draw_month: true, draw_year: true } } },
      orderBy: { created_at: 'desc' }
    });

    const totalWon = winnings.reduce((sum, w) => sum + parseFloat(w.prize_amount), 0);

    // Map to expected shape
    const mappedWinnings = winnings.map(w => ({ ...w, draws: w.draw }));

    // Recent published draws
    const publishedDraws = await prisma.draw.findMany({
      where: { status: 'published' },
      select: { id: true, draw_date: true, draw_month: true, draw_year: true, status: true },
      orderBy: { draw_date: 'desc' },
      take: 5
    });

    // Upcoming draw
    const pendingDraw = await prisma.draw.findFirst({
      where: { NOT: { status: 'published' } },
      select: { id: true, draw_date: true },
      orderBy: { draw_date: 'desc' }
    });

    res.json({
      subscription: {
        status: req.user.subscription_status,
        plan: req.user.subscription_plan,
        start: req.user.subscription_start,
        end: req.user.subscription_end
      },
      scores,
      charity: {
        ...charity,
        percentage: req.user.charity_percentage
      },
      winnings: {
        records: mappedWinnings,
        totalWon
      },
      draws: {
        recent: publishedDraws,
        upcoming: pendingDraw || null
      }
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
