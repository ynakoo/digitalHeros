const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const crypto = require('crypto');
const Razorpay = require('razorpay');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}
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
        price: 999,
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
        price: 9999,
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

// GET /api/subscriptions/razorpay/key
router.get('/razorpay/key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST /api/subscriptions/razorpay/create-order
router.post('/razorpay/create-order', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body; // 'monthly' or 'yearly'
    if (!razorpay) return res.status(500).json({ error: 'Razorpay is not configured' });

    let amount; // in cents/paise
    if (planId === 'monthly') {
      amount = 99900; // ₹999.00 equivalent
    } else if (planId === 'yearly') {
      amount = 999900; // ₹9999.00 equivalent
    } else {
      return res.status(400).json({ error: 'Invalid planId' });
    }

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });

    res.json({ order_id: order.id });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/subscriptions/razorpay/verify
router.post('/razorpay/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Determine end date
    const start = new Date();
    const end = new Date();
    if (planId === 'yearly') {
      end.setFullYear(end.getFullYear() + 1);
    } else {
      end.setMonth(end.getMonth() + 1);
    }

    const user = await prisma.profile.update({
      where: { id: req.user.id },
      data: {
        subscription_status: 'active',
        subscription_plan: planId,
        subscription_start: start,
        subscription_end: end
      }
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
