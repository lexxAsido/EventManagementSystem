// gmail send or Brevo smtp 
const nodemailer = require("nodemailer");

// Escape user-supplied text before putting it in HTML (prevents HTML injection in emails)
const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

// Builds the verification email content (shared by both sending methods)
const buildMessage = (name, rawToken) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
  return {
    subject: "Verify your email address",
    html: `
      <h2>Welcome, ${escapeHtml(name)}!</h2>
      <p>Click the link below to verify your email. It expires in 24 hours.</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>Or paste this into your browser:<br>${link}</p>
    `,
  };
};

// Splits EMAIL_FROM ("Name <email@domain.com>") into { name, email } for the Brevo API
const parseSender = (from) => {
  const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(from || "");
  return match ? { name: match[1] || undefined, email: match[2] } : { email: from };
};

// Production: Brevo HTTPS API (port 443).
// Hosts like Render's free tier block outbound SMTP ports (25/465/587), so SMTP can't be used there.
const sendWithBrevo = async (to, name, { subject, html }) => {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: parseSender(process.env.EMAIL_FROM),
      to: [{ email: to, name }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Brevo API error ${res.status}: ${await res.text()}`);
  }
};

// Local development: classic SMTP (Gmail, Mailtrap, etc.)
const sendWithSmtp = async (to, { subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    // Fail fast instead of hanging for Nodemailer's 2-minute default if the port is blocked
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const sendVerificationEmail = async (to, name, rawToken) => {
  const message = buildMessage(name, rawToken);

  // If a Brevo key is configured use the HTTP API, otherwise fall back to SMTP
  if (process.env.BREVO_API_KEY) {
    return sendWithBrevo(to, name, message);
  }
  return sendWithSmtp(to, message);
};

module.exports = { sendVerificationEmail };










































// gmail send only but render blocks on free tier

// const nodemailer = require("nodemailer");

// const sendVerificationEmail = async (to, name, rawToken) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: Number(process.env.EMAIL_PORT),
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//   });

//   const link = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

//   await transporter.sendMail({
//     from: process.env.EMAIL_FROM,
//     to,
//     subject: "Verify your email address",
//     html: `
//       <h2>Welcome, ${name}!</h2>
//       <p>Click the link below to verify your email. It expires in 24 hours.</p>
//       <p><a href="${link}">Verify my email</a></p>
//       <p>Or paste this into your browser:<br>${link}</p>
//     `,
//   });
// };

// module.exports = { sendVerificationEmail };