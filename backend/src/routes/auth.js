const { Router } = require('express');
const { body } = require('express-validator');
const { signup, login, logout, me, session } = require('../controllers/authController');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { text, email } = require('./validators');

const router = Router();

router.post(
  '/signup',
  authLimiter,
  [
    text('first_name', 'First name', 60),
    text('last_name', 'Last name', 60),
    email(),
    // bcrypt only reads the first 72 bytes, so longer passwords are refused instead of silently cut
    body('password')
      .isString().withMessage('Password must be at least 8 characters').bail()
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .custom((v) => Buffer.byteLength(v, 'utf8') <= 72).withMessage('Password must be at most 72 bytes'),
  ],
  validate,
  signup
);

router.post(
  '/login',
  authLimiter,
  [
    email(),
    body('password')
      .isString().withMessage('Password is required').bail()
      .notEmpty().withMessage('Password is required')
      .isLength({ max: 200 }).withMessage('Invalid email or password'),
  ],
  validate,
  login
);

router.post('/logout', logout);
router.get('/me', authenticate, me);
router.get('/session', optionalAuthenticate, session);

module.exports = router;
