const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

// Helper to generate tokens
const generateTokens = (userId) => {
  const access_token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
  const refresh_token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  return { access_token, refresh_token };
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, charity_id, charity_percentage } = req.body;
    // console.log("hii");

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user already exists
    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create profile via Prisma
    const profile = await prisma.profile.create({
      data: {
        full_name,
        email,
        password: hashedPassword,
        charity_id: charity_id || null,
        charity_percentage: Math.max(charity_percentage || 10, 10),
        subscription_status: 'none',
        role: 'user'
      },
      include: { charity: { select: { name: true, image_url: true } } }
    });

    // Generate tokens
    const tokens = generateTokens(profile.id);

    // Filter out password before sending
    const { password: _, ...safeProfile } = profile;

    res.status(201).json({
      user: safeProfile,
      session: tokens
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Fetch profile via Prisma
    const profile = await prisma.profile.findUnique({
      where: { email },
      include: { charity: { select: { name: true, image_url: true } } }
    });

    if (!profile) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, profile.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const tokens = generateTokens(profile.id);

    // Filter out password
    const { password: _, ...safeProfile } = profile;

    res.json({
      user: safeProfile,
      session: tokens
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is already safely stripped of password by the middleware
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { full_name, charity_id, charity_percentage, avatar_url } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (charity_id !== undefined) updates.charity_id = charity_id || null;
    if (charity_percentage !== undefined) updates.charity_percentage = Math.max(charity_percentage, 10);
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const profile = await prisma.profile.update({
      where: { id: req.user.id },
      data: updates,
      include: { charity: { select: { name: true, image_url: true } } }
    });

    const { password: _, ...safeProfile } = profile;

    res.json({ user: safeProfile });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
