const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Refuse to start with a missing or weak signing secret
const { getJwtSecret } = require('./src/config/secret');
try {
  getJwtSecret();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Curry Time server running at http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
