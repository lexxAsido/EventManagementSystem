const express = require("express");
const { protect } = require("../middleware/auth");
const { getProfile } = require("../controller/user.controllers");


const router = express.Router();
router.get("/profile", protect, getProfile);

module.exports = router;