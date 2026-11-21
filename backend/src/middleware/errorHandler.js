function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err.stack || err.message);

  let message;
  if (status >= 500) message = 'An unexpected error occurred';
  else if (err.type === 'entity.parse.failed') message = 'Request body is not valid JSON';
  else if (err.type === 'entity.too.large') message = 'Request body is too large';
  else message = 'Bad request';

  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
