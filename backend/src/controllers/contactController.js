const db = require('../config/database');
const transporter = require('../config/email');
const { escapeHtml: h, oneLine } = require('../utils');

async function submit(req, res, next) {
  try {
    const { first_name, last_name, email, phone, subject, message } = req.body;
    const cleanSubject = oneLine(subject);

    db.prepare(
      'INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(first_name, last_name, email, phone || null, cleanSubject, message);

    // Fire-and-forget: an email failure must not break the visitor's response
    sendEmails({ first_name, last_name, email, phone, subject: cleanSubject, message }).catch((err) =>
      console.error('Contact email error:', err.message)
    );

    res.json({ success: true, message: "Message received! We'll be in touch within 24 hours." });
  } catch (err) {
    next(err);
  }
}

async function sendEmails({ first_name, last_name, email, phone, subject, message }) {
  const from = `"Curry Time" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to: process.env.RESTAURANT_EMAIL,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: `
      <h2>New message via Curry Time website</h2>
      <p><strong>From:</strong> ${h(first_name)} ${h(last_name)} &lt;${h(email)}&gt;</p>
      ${phone ? `<p><strong>Phone:</strong> ${h(phone)}</p>` : ''}
      <p><strong>Subject:</strong> ${h(subject)}</p>
      <hr>
      <p>${h(message).replace(/\n/g, '<br>')}</p>
    `,
  });

  await transporter.sendMail({
    from,
    to: email,
    subject: 'We received your message - Curry Time',
    html: `
      <p>Hi ${h(first_name)},</p>
      <p>Thank you for reaching out to Curry Time. We have received your message and will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to call us at <a href="tel:01294244444">0129-4244444</a>.</p>
      <p>Warm regards,<br><strong>The Curry Time Team</strong><br>F-89/23, Eros Gardens, Faridabad</p>
    `,
  });
}

module.exports = { submit, sendEmails };
