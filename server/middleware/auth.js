const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_development_only');

    // Fetch user profile from Prisma
    const profile = await prisma.profile.findUnique({
      where: { id: decoded.userId },
      include: { charity: { select: { name: true, image_url: true } } }
    });

    if (!profile) {
      return res.status(401).json({ error: 'User profile not found' });
    }

    // Don't leak password in req.user
    const { password, ...safeProfile } = profile;

    req.user = {
      ...safeProfile,
      accessToken: token
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
