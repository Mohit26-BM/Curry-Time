const rateLimit = require('express-rate-limit');

const make = (windowMs, max, message) =>
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message: { success: false, message } });

const apiLimiter     = make(15 * 60 * 1000, 100, 'Too many requests, please try again later');
const authLimiter    = make(15 * 60 * 1000,  10, 'Too many login attempts, please try again later');
const contactLimiter = make(60 * 60 * 1000,   5, 'Message limit reached, please try again in an hour');

module.exports = { apiLimiter, authLimiter, contactLimiter };
