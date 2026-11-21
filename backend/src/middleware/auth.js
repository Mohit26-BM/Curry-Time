const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { getJwtSecret } = require('../config/secret');

const findUser = db.prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?');

function readToken(req) {
  const header = req.headers.authorization;
  return req.cookies?.token || (header && header.startsWith('Bearer ') ? header.slice(7) : null);
}

function userFromToken(token) {
  const { id } = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
  return findUser.get(id);
}

function authenticate(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const user = userFromToken(token);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function optionalAuthenticate(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const user = userFromToken(token);
    if (user) req.user = user;
  } catch { /* invalid token: treat as a guest */ }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate, requireAdmin };
