// The JWT signing secret must exist and be long enough, or logins would be forgeable.
// Error messages say what is wrong but never print the value.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret === undefined) {
    throw new Error('JWT_SECRET is not set. Add an environment variable named exactly JWT_SECRET (on Render: Environment tab, then save).');
  }
  if (secret !== secret.trim()) {
    throw new Error('JWT_SECRET has a space or line break at the start or end. Paste the value again without it.');
  }
  if (secret.length < 32) {
    throw new Error(`JWT_SECRET is only ${secret.length} characters long. It needs at least 32; use a random value.`);
  }
  if (/^(change[-_ ]?me|your[-_ ]|put[-_ ]|example[-_ ]|placeholder)/i.test(secret)) {
    throw new Error('JWT_SECRET looks like a placeholder (for example "change-me" or "your-secret"). Use a random value.');
  }
  return secret;
}

module.exports = { getJwtSecret };
