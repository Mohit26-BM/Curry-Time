const { body } = require('express-validator');

// Reusable field rules with length limits, so nothing oversized reaches the database or an email.
const text = (field, label, max) =>
  body(field)
    .isString().withMessage(`${label} is required`).bail()
    .trim()
    .notEmpty().withMessage(`${label} is required`)
    .isLength({ max }).withMessage(`${label} must be at most ${max} characters`);

const optionalText = (field, label, max) =>
  body(field)
    .optional({ values: 'falsy' })
    .isString().withMessage(`${label} must be text`).bail()
    .trim()
    .isLength({ max }).withMessage(`${label} must be at most ${max} characters`);

const email = () =>
  body('email')
    .isString().withMessage('Valid email is required').bail()
    .trim()
    .isLength({ max: 254 }).withMessage('Valid email is required').bail()
    .isEmail().withMessage('Valid email is required')
    // lower-case only: the default would also strip dots from Gmail addresses
    .customSanitizer((v) => v.toLowerCase());

const phone = () =>
  optionalText('phone', 'Phone number', 20)
    .matches(/^[0-9+()\-\s]{6,20}$/).withMessage('Phone number may contain only digits, spaces, + ( ) and -');

module.exports = { text, optionalText, email, phone };
