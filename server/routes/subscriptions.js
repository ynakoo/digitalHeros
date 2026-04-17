const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/subscriptions/status — current user's subscription
router.get('/status', authMiddleware, async (req, res) => {
  try {
    res.json({
      subscription_status: req.user.subscription_status,
      subscription_plan: req.user.subscription_plan,
      subscription_start: req.user.subscription_start,
      subscription_end: req.user.subscription_end
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/subscriptions/plans — static plan info
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'monthly',
        name: 'Monthly',
        price: 9.99,
        interval: 'month',
        features: [
          'Enter golf scores',
          'Monthly draw participation',
          'Charity contribution (10%+ of fee)',
          'Full dashboard access',
          'Winner verification & payouts'
        ]
      },
      {
        id: 'yearly',
        name: 'Yearly',
        price: 99.99,
        interval: 'year',
        savings: '17%',
        features: [
          'All Monthly features',
          '2 months free',
          'Priority support',
          'Early draw results access'
        ]
      }
    ]
  });
});

// PUT /api/subscriptions/admin-toggle — admin set subscription status
router.put('/admin-toggle', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { user_id, subscription_status, subscription_plan } = req.body;

    if (!user_id || !subscription_status) {
      return res.status(400).json({ error: 'User ID and subscription status are required' });
    }

    const updates = { subscription_status };

    if (subscription_plan) updates.subscription_plan = subscription_plan;

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
      where: { id: user_id },
      data: updates
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
