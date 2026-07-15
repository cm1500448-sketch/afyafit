const requireRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) return next();
  res.status(403).json({ error: `Access denied. ${role} role required.` });
};

const requireAnyRole = (roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  res.status(403).json({ error: 'Access denied.' });
};

module.exports = { requireRole, requireAnyRole };
