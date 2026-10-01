
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, 
      lowercase: true,
      trim: true,
    },
    // select:false -> password/token fields are never returned unless explicitly requested
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false }, // SHA-256 hash, never the raw token
    verificationTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);