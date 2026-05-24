function errorHandler(err, _req, res, _next) {
  console.error(err.stack || err.message);
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error';
  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
