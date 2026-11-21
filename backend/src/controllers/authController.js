const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { getJwtSecret } = require('../config/secret');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// A real hash to compare against when the email is unknown, so a login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

function issueToken(res, id) {
  const token = jwt.sign({ id }, getJwtSecret(), { expiresIn: '7d', algorithm: 'HS256' });
  res.cookie('token', token, { ...COOKIE_OPTS, maxAge: WEEK_MS });
}

async function signup(req, res, next) {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    let id;
    try {
      ({ lastInsertRowid: id } = db
        .prepare('INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)')
        .run(first_name, last_name, email, password_hash));
    } catch (err) {
      // two sign-ups with the same email at the same moment
      if (String(err.code).startsWith('SQLITE_CONSTRAINT')) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }
      throw err;
    }

    issueToken(res, Number(id));
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: Number(id), first_name, last_name, email, role: 'user' },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const matches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !matches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    issueToken(res, user.id);
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
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ success: true, message: 'Logged out successfully' });
}

// Used by every page to ask who is logged in. A visitor who is not logged in gets a normal answer (user: null), not an error.
function session(req, res) {
  res.json({ success: true, user: req.user || null });
}

function me(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { signup, login, logout, me, session };
