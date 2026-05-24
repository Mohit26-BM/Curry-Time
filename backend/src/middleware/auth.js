const jwt = require('jsonwebtoken');
const db = require('../config/database');

function authenticate(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = db
      .prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?')
      .get(id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function optionalAuthenticate(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = db
      .prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?')
      .get(id);
    if (user) req.user = user;
  } catch { /* invalid token — treat as guest */ }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate, requireAdmin };
