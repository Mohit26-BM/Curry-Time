const { Router } = require('express');
const { body, param } = require('express-validator');
const { create, list, listMine, updateStatus } = require('../controllers/reservationController');
const { authenticate, requireAdmin, optionalAuthenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { reservationLimiter } = require('../middleware/rateLimiter');
const { text, optionalText, email, phone } = require('./validators');

const router = Router();

const TIME_FORMAT = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
const DAY = 24 * 60 * 60 * 1000;

// Dates are checked against the calendar. One day of slack covers time zones; one year is the booking horizon.
function validBookingDate(value) {
  const asked = Date.parse(`${value}T00:00:00Z`);
  const now = Date.now();
  return asked >= now - 2 * DAY && asked <= now + 366 * DAY;
}

router.post(
  '/',
  reservationLimiter,
  optionalAuthenticate,
  [
    text('first_name', 'First name', 60),
    text('last_name', 'Last name', 60),
    email(),
    phone(),
    body('date')
      .isString().withMessage('Valid date is required').bail()
      .isISO8601({ strict: true, strictSeparator: true }).withMessage('Valid date is required').bail()
      .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Valid date is required').bail()
      .custom(validBookingDate).withMessage('Choose a date from today up to one year ahead'),
    body('time')
      .isString().withMessage('Time is required').bail()
      .trim()
      .matches(TIME_FORMAT).withMessage('Choose a valid time, for example 7:30 PM'),
    body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20').toInt(),
    optionalText('special_requests', 'Special requests', 500),
  ],
  validate,
  create
);

router.get('/my', authenticate, listMine);
router.get('/', authenticate, requireAdmin, list);

router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  [
    param('id').isInt({ min: 1 }).withMessage('Invalid reservation id'),
    body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid status'),
  ],
  validate,
  updateStatus
);

module.exports = router;
