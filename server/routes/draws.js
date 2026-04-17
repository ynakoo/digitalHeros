const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const { generateRandomNumbers, generateAlgorithmicNumbers, determineWinners } = require('../lib/drawEngine');
const { calculatePrizePool, calculatePrizes } = require('../lib/prizeCalculator');

// GET /api/draws — list published draws
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [draws, total] = await Promise.all([
      prisma.draw.findMany({
        where: { status: 'published' },
        orderBy: { draw_date: 'desc' },
        skip,
        take: limit
      }),
      prisma.draw.count({ where: { status: 'published' } })
    ]);

    res.json({ draws, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/draws/:id — single draw with winners
router.get('/:id', async (req, res) => {
  try {
    const draw = await prisma.draw.findUnique({
      where: { id: req.params.id }
    });

    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    const winners = await prisma.drawWinner.findMany({
      where: { draw_id: draw.id },
      include: { user: { select: { full_name: true, email: true } } },
      orderBy: { match_type: 'asc' }
    });

    const prizePool = await prisma.prizePool.findUnique({
      where: { draw_id: draw.id }
    });

    // Map winners to match frontend expected shape
    const mappedWinners = winners.map(w => ({
      ...w,
      profiles: w.user
    }));

    res.json({ draw, winners: mappedWinners, prizePool });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/draws — create new draw (admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { draw_type = 'random' } = req.body;
    const now = new Date();

    // Count active subscribers
    const activeSubscribers = await prisma.profile.count({
      where: { subscription_status: 'active' }
    });

    // Get last draw's jackpot rollover
    const lastDraw = await prisma.draw.findFirst({
      orderBy: { draw_date: 'desc' }
    });

    let jackpotRollover = 0;
    if (lastDraw) {
      const lastPool = await prisma.prizePool.findUnique({
        where: { draw_id: lastDraw.id }
      });

      const lastWinners = await prisma.drawWinner.count({
        where: { draw_id: lastDraw.id, match_type: 'match_5' }
      });

      if (lastWinners === 0 && lastPool) {
        jackpotRollover = parseFloat(lastPool.match_5_pool) || 0;
      }
    }

    const prizePool = calculatePrizePool(activeSubscribers, jackpotRollover);

    // Generate winning numbers
    let winningNumbers;
    if (draw_type === 'algorithmic') {
      const allScores = await prisma.score.findMany({ select: { score: true } });
      winningNumbers = generateAlgorithmicNumbers(allScores, 5);
    } else {
      winningNumbers = generateRandomNumbers(5);
    }

    const draw = await prisma.draw.create({
      data: {
        draw_date: now,
        draw_month: now.getMonth() + 1,
        draw_year: now.getFullYear(),
        status: 'pending',
        draw_type,
        winning_numbers: winningNumbers,
        total_pool_amount: prizePool.totalPool,
        jackpot_rollover: jackpotRollover,
        active_subscribers: activeSubscribers
      }
    });

    // Create prize pool record
    await prisma.prizePool.create({
      data: {
        draw_id: draw.id,
        match_5_pool: prizePool.match_5_pool,
        match_4_pool: prizePool.match_4_pool,
        match_3_pool: prizePool.match_3_pool,
        jackpot_carried: jackpotRollover
      }
    });

    res.status(201).json({ draw, prizePool });
  } catch (err) {
    console.error('Create draw error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper: get subscribers with scores
async function getSubscribersWithScores() {
  const subscribers = await prisma.profile.findMany({
    where: { subscription_status: 'active' },
    select: { id: true, full_name: true, email: true }
  });

  const usersWithScores = [];
  for (const sub of subscribers) {
    const scores = await prisma.score.findMany({
      where: { user_id: sub.id },
      orderBy: { played_date: 'desc' },
      take: 5,
      select: { score: true }
    });

    if (scores.length > 0) {
      usersWithScores.push({ ...sub, scores });
    }
  }
  return usersWithScores;
}

// POST /api/draws/:id/simulate — run simulation (admin)
router.post('/:id/simulate', authMiddleware, adminOnly, async (req, res) => {
  try {
    const draw = await prisma.draw.findUnique({ where: { id: req.params.id } });
    if (!draw) return res.status(404).json({ error: 'Draw not found' });

    const usersWithScores = await getSubscribersWithScores();
    const winners = determineWinners(draw.winning_numbers, usersWithScores);

    const prizePool = await prisma.prizePool.findUnique({ where: { draw_id: draw.id } });
    const poolData = prizePool || { match_5_pool: 0, match_4_pool: 0, match_3_pool: 0 };
    const { results, newJackpotRollover } = calculatePrizes(poolData, winners);

    // Update draw status to simulated
    await prisma.draw.update({
      where: { id: draw.id },
      data: { status: 'simulated' }
    });

    res.json({
      draw,
      winningNumbers: draw.winning_numbers,
      winners,
      prizeBreakdown: results,
      newJackpotRollover,
      totalParticipants: usersWithScores.length
    });
  } catch (err) {
    console.error('Simulate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/draws/:id/publish — publish draw results (admin)
router.post('/:id/publish', authMiddleware, adminOnly, async (req, res) => {
  try {
    const draw = await prisma.draw.findUnique({ where: { id: req.params.id } });
    if (!draw) return res.status(404).json({ error: 'Draw not found' });
    if (draw.status === 'published') return res.status(400).json({ error: 'Draw already published' });

    const usersWithScores = await getSubscribersWithScores();
    const winners = determineWinners(draw.winning_numbers, usersWithScores);

    const prizePool = await prisma.prizePool.findUnique({ where: { draw_id: draw.id } });
    const poolData = prizePool || { match_5_pool: 0, match_4_pool: 0, match_3_pool: 0 };
    const { results, newJackpotRollover } = calculatePrizes(poolData, winners);

    // Insert winner records
    for (const winner of results) {
      await prisma.drawWinner.create({
        data: {
          draw_id: draw.id,
          user_id: winner.user_id,
          match_type: winner.match_type,
          matched_numbers: winner.matched_numbers,
          prize_amount: winner.prize_amount,
          verification_status: 'pending',
          payment_status: 'pending'
        }
      });
    }

    // Update draw status
    await prisma.draw.update({
      where: { id: draw.id },
      data: { status: 'published', published_at: new Date() }
    });

    res.json({
      message: 'Draw published successfully',
      winnersCount: results.length,
      newJackpotRollover
    });
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
