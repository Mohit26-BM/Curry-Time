const rateLimit = require('express-rate-limit');

const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    // Tests can turn the limits off; production never does.
    skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
  });

const apiLimiter         = make(15 * 60 * 1000, 300, 'Too many requests, please try again later');
const authLimiter        = make(15 * 60 * 1000,  10, 'Too many login attempts, please try again later');
const contactLimiter     = make(60 * 60 * 1000,   5, 'Message limit reached, please try again in an hour');
const reservationLimiter = make(60 * 60 * 1000,  10, 'Booking limit reached, please try again later or call us');

module.exports = { apiLimiter, authLimiter, contactLimiter, reservationLimiter };
