const db = require('../config/database');
const transporter = require('../config/email');

async function create(req, res, next) {
  try {
    const { first_name, last_name, email, phone, date, time, guests, special_requests } = req.body;
    const user_id = req.user?.id ?? null;

    const { lastInsertRowid: id } = db
      .prepare(
        `INSERT INTO reservations
           (user_id, first_name, last_name, email, phone, date, time, guests, special_requests)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(user_id, first_name, last_name, email, phone || null, date, time, guests, special_requests || null);

    sendReservationEmails({ first_name, last_name, email, phone, date, time, guests, special_requests }).catch((err) =>
      console.error('Reservation email error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: "Reservation request received! We'll confirm your table shortly.",
      reservation: { id },
    });
  } catch (err) {
    next(err);
  }
}

async function sendReservationEmails({ first_name, last_name, email, phone, date, time, guests, special_requests }) {
  const from = `"Curry Time" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to: email,
    subject: 'Reservation Request Received — Curry Time',
    html: `
      <p>Hi ${first_name},</p>
      <p>We've received your reservation request for <strong>${guests} guest(s)</strong> on <strong>${date}</strong> at <strong>${time}</strong>.</p>
      <p>We'll confirm your table soon. To make changes, call us at <a href="tel:01294244444">0129-4244444</a>.</p>
      <p>Warm regards,<br><strong>Curry Time</strong><br>F-89/23, Eros Gardens, Faridabad</p>
    `,
  });

  await transporter.sendMail({
    from,
    to: process.env.RESTAURANT_EMAIL,
    subject: `[Reservation] ${date} at ${time} — ${guests} guest(s)`,
    html: `
      <h2>New reservation request</h2>
      <p><strong>Name:</strong> ${first_name} ${last_name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Guests:</strong> ${guests}</p>
      ${special_requests ? `<p><strong>Special requests:</strong> ${special_requests}</p>` : ''}
    `,
  });
}

function list(req, res, next) {
  try {
    const { date, status } = req.query;
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params = [];
    if (date) { query += ' AND date = ?'; params.push(date); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY date ASC, time ASC';
    res.json({ success: true, reservations: db.prepare(query).all(...params) });
  } catch (err) {
    next(err);
  }
}

function updateStatus(req, res, next) {
  try {
    db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
    res.json({ success: true, message: 'Reservation updated' });
  } catch (err) {
    next(err);
  }
}

function listMine(req, res, next) {
  try {
    const reservations = db
      .prepare(
        `SELECT id, date, time, guests, special_requests, status, created_at
         FROM reservations WHERE user_id = ? ORDER BY date DESC, time DESC`
      )
      .all(req.user.id);
    res.json({ success: true, reservations });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, listMine, updateStatus };
