
const nodemailer = require("nodemailer");

const sendVerificationEmail = async (to, name, rawToken) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const link = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your email address",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Click the link below to verify your email. It expires in 24 hours.</p>
      <p><a href="${link}">Verify my email</a></p>
      <p>Or paste this into your browser:<br>${link}</p>
    `,
  });
};

module.exports = { sendVerificationEmail };