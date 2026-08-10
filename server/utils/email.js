const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email. Returns true on success, false on failure.
 */
const sendMail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS not set — skipping email.');
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"Legacy Locker" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return false;
  }
};

module.exports = { transporter, sendMail };
