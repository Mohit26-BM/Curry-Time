const db = require('../config/database');
const transporter = require('../config/email');
const { escapeHtml: h } = require('../utils');

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
      reservation: { id: Number(id) },
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
    subject: 'Reservation Request Received - Curry Time',
    html: `
      <p>Hi ${h(first_name)},</p>
      <p>We have received your reservation request for <strong>${h(guests)} guest(s)</strong> on <strong>${h(date)}</strong> at <strong>${h(time)}</strong>.</p>
      <p>We will confirm your table soon. To make changes, call us at <a href="tel:01294244444">0129-4244444</a>.</p>
      <p>Warm regards,<br><strong>Curry Time</strong><br>F-89/23, Eros Gardens, Faridabad</p>
    `,
  });

  await transporter.sendMail({
    from,
    to: process.env.RESTAURANT_EMAIL,
    subject: `[Reservation] ${date} at ${time} - ${guests} guest(s)`,
    html: `
      <h2>New reservation request</h2>
      <p><strong>Name:</strong> ${h(first_name)} ${h(last_name)}</p>
      <p><strong>Email:</strong> ${h(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${h(phone)}</p>` : ''}
      <p><strong>Date:</strong> ${h(date)}</p>
      <p><strong>Time:</strong> ${h(time)}</p>
      <p><strong>Guests:</strong> ${h(guests)}</p>
      ${special_requests ? `<p><strong>Special requests:</strong> ${h(special_requests).replace(/\n/g, '<br>')}</p>` : ''}
    `,
  });
}

function list(req, res, next) {
  try {
    const { date, status } = req.query;
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params = [];
    if (typeof date === 'string' && date) { query += ' AND date = ?'; params.push(date); }
    if (typeof status === 'string' && status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY date ASC, time ASC LIMIT 500';
    res.json({ success: true, reservations: db.prepare(query).all(...params) });
  } catch (err) {
    next(err);
  }
}

function updateStatus(req, res, next) {
  try {
    const { changes } = db
      .prepare('UPDATE reservations SET status = ? WHERE id = ?')
      .run(req.body.status, Number(req.params.id));
    if (changes === 0) return res.status(404).json({ success: false, message: 'Reservation not found' });
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

module.exports = { create, list, listMine, updateStatus, sendReservationEmails };
