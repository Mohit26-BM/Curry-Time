const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const reservationRoutes = require('./routes/reservations');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Behind a reverse proxy (Render, Nginx) every visitor would look like the proxy and share one
// rate limit. Set TRUSTED_PROXY_HOPS to the number of proxies in front of the app (Render: 1).
const proxyHops = parseInt(process.env.TRUSTED_PROXY_HOPS || '0', 10);
if (proxyHops > 0) app.set('trust proxy', proxyHops);

app.use(
  helmet({
    // HSTS only makes sense (and is only safe) on https
    hsts: isProduction,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        // only force https in production; on http://localhost it would break the page
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || `http://localhost:${process.env.PORT || 3000}`,
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Health check for the hosting platform
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// API responses can hold personal data, so browsers and proxies must not keep copies
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Defence in depth on top of SameSite cookies: a state-changing API call must come from this site
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    let ok = false;
    try { ok = new URL(origin).host === req.headers.host; } catch { ok = false; }
    if (!ok && origin !== process.env.ALLOWED_ORIGIN) {
      return res.status(403).json({ success: false, message: 'Cross-site request refused' });
    }
  }
  next();
});

// Serve the static frontend
const FRONTEND_DIR = path.join(__dirname, '../../frontend');
app.use(express.static(FRONTEND_DIR));

// API routes
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Clean URL routing for HTML pages
const pages = ['menu', 'gallery', 'about', 'contact', 'login', 'signup', 'my-reservations'];
pages.forEach((page) => {
  app.get(`/${page}`, (_req, res) => res.sendFile(path.join(FRONTEND_DIR, `${page}.html`)));
  app.get(`/${page}.html`, (_req, res) => res.sendFile(path.join(FRONTEND_DIR, `${page}.html`)));
});
app.get('/', (_req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));

app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }));
app.use(errorHandler);

module.exports = app;
