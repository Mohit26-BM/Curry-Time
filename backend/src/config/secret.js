// The JWT signing secret must exist and be long enough, or logins would be forgeable.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || /^(change|your|secret|example)/i.test(secret)) {
    throw new Error('JWT_SECRET is missing or too weak. Set a random value of at least 32 characters in backend/.env');
  }
  return secret;
}

module.exports = { getJwtSecret };
