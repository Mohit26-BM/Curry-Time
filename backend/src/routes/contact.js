const { Router } = require('express');
const { body } = require('express-validator');
const { submit } = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { contactLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post(
  '/',
  contactLimiter,
  [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  validate,
  submit
);

module.exports = router;
