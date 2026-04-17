const subscriberOnly = (req, res, next) => {
  if (!req.user || req.user.subscription_status !== 'active') {
    return res.status(403).json({ error: 'Active subscription required' });
  }
  next();
};

module.exports = subscriberOnly;
