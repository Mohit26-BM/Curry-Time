const { Router } = require('express');
const { body } = require('express-validator');
const { submit } = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { contactLimiter } = require('../middleware/rateLimiter');
const { text, email, phone } = require('./validators');

const router = Router();

router.post(
  '/',
  contactLimiter,
  [
    text('first_name', 'First name', 60),
    text('last_name', 'Last name', 60),
    email(),
    phone(),
    text('subject', 'Subject', 150),
    body('message')
      .isString().withMessage('Message must be at least 10 characters').bail()
      .trim()
      .isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
      .isLength({ max: 2000 }).withMessage('Message must be at most 2000 characters'),
  ],
  validate,
  submit
);

module.exports = router;
