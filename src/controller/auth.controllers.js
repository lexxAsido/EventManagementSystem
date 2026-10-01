
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const asyncHandler = require("../utils/asyncHandler");
const { generateVerificationToken, hashToken } = require("../utils/tokens");
const { sendVerificationEmail } = require("../utils/sendEmail");

const SALT_ROUNDS = 12;

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body; // already validated by Joi

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const { rawToken, hashedToken, expires } = generateVerificationToken();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken: hashedToken,
    verificationTokenExpires: expires,
  });

  try {
    await sendVerificationEmail(user.email, user.name, rawToken);
  } catch (err) {
    console.error("Email send failed:", err.message);
    return res.status(201).json({
      success: true,
      message:
        "Account created, but we couldn't send the verification email. Use /api/auth/resend-verification.",
    });
  }

  // Never return the password or token
  res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email to verify your account.",
  });
});

// GET /api/auth/verify-email?token=...
exports.verifyEmail = asyncHandler(async (req, res) => {
  const hashed = hashToken(req.query.token);

  // Match the hash AND make sure it hasn't expired
  const user = await User.findOne({
    verificationToken: hashed,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired verification token" });
  }

  user.isVerified = true;
  user.verificationToken = undefined; // single use: clear after success
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: "Email verified. You can now log in." });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  // Same message for wrong email and wrong password so attackers can't tell which emails exist
  const invalid = () =>
    res.status(401).json({ success: false, message: "Invalid email or password" });

  if (!user) return invalid();
  const match = await bcrypt.compare(password, user.password);
  if (!match) return invalid();

  if (!user.isVerified) {
    return res
      .status(403)
      .json({ success: false, message: "Please verify your email before logging in" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// POST /api/auth/resend-verification (bonus)
exports.resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Same response whether or not the email exists, to avoid leaking registered emails
  if (user && !user.isVerified) {
    const { rawToken, hashedToken, expires } = generateVerificationToken();
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = expires;
    await user.save();
    await sendVerificationEmail(user.email, user.name, rawToken);
  }

  res.status(200).json({
    success: true,
    message: "Account exists and is unverified, a new email has been sent.",
  });
});