const crypto = require("crypto");

// Raw token goes in the email link; only its SHA-256 hash is stored in the DB.
// If the DB leaks, attackers can't reverse the hash to build a working verify link.
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64 hex chars
  return {
    rawToken,
    hashedToken: hashToken(rawToken),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };
};

module.exports = { hashToken, generateVerificationToken };