const { Router } = require('express');
const { body } = require('express-validator');
const { create, list, listMine, updateStatus } = require('../controllers/reservationController');
const { authenticate, requireAdmin, optionalAuthenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = Router();

router.post(
  '/',
  optionalAuthenticate,
  [
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('date').isDate().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20'),
    body('special_requests').optional().trim(),
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
  [body('status').isIn(['pending', 'confirmed', 'cancelled']).withMessage('Invalid status')],
  validate,
  updateStatus
);

module.exports = router;
