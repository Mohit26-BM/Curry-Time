const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

async function signup(req, res, next) {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const { lastInsertRowid: id } = db
      .prepare('INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)')
      .run(first_name, last_name, email, password_hash);

    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id, first_name, last_name, email, role: 'user' },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTS);
    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

function logout(_req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
}

function me(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { signup, login, logout, me };
