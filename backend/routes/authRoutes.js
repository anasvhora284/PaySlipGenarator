const express = require("express");
const router = express.Router();

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({
      success: true,
      message: "Login successful",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
});

module.exports = router;