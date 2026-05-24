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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'"],
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

// Serve the static frontend
const FRONTEND_DIR = path.join(__dirname, '../../frontend');
app.use(express.static(FRONTEND_DIR));

// API routes
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reservations', reservationRoutes);

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
