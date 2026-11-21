// Gives an existing account the admin role, so it can list and update reservations.
// Usage: npm run make-admin -- someone@example.com
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../src/config/database');

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email) {
  console.error('Usage: npm run make-admin -- <email of an existing account>');
  process.exit(1);
}

const { changes } = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
if (changes === 0) {
  console.error(`No account found for ${email}. Sign up on the website first, then run this again.`);
  process.exit(1);
}
console.log(`${email} is now an admin.`);
