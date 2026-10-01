
const express = require("express");
const rateLimit = require("express-rate-limit");
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  emailSchema,
  verifyTokenSchema,
} = require("../validators/authValidators");
const {
  register,
  login,
  resendVerification,
  verifyEmail,
} = require("../controller/auth.controllers");

const router = express.Router();

// Brute-force protection on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: "Too many requests, try again later" },
});
router.use(authLimiter);

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/verify-email", validate(verifyTokenSchema, "query"), verifyEmail);
router.post("/resend-verification", validate(emailSchema), resendVerification);

module.exports = router;