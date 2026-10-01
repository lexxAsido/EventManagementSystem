const jwt = require("jsonwebtoken");
const User = require("../models/user.models");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized, token missing" });
  }

  // Throws JsonWebTokenError / TokenExpiredError -> handled in errorHandler as 401
  const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, message: "User no longer exists" });
  }

  // Unverified users can't access protected routes
  if (!user.isVerified) {
    return res.status(403).json({ success: false, message: "Please verify your email" });
  }

  req.user = user;
  next();
});

module.exports = { protect };