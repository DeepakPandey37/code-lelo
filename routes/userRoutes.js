// userRoutes.js
const express = require("express");
const router = express.Router();
const {
  sendOTP,
  signUp,
  login,
  changePassword,
  getProfile,
  updateProfile,
} = require("../controllers/userController");

const {
  auth
} = require("../controllers/auth");

// =====================================
// GET Routes (Render EJS Templates)
// =====================================

// 1. OTP Form
router.get("/send-otp", (req, res) =>
  res.render("otpForm", { title: "Send OTP", error: null })
);

// 2. Sign Up Form
router.get("/signup", (req, res) =>
  res.render("signUp", { title: "Sign Up", error: null })
);

// 3. Login Form
router.get("/login", (req, res) =>
  res.render("login", { title: "Login", error: null })
);

// 4. Change Password Form
router.get("/change-password", (req, res) =>
  res.render("changePassword", { title: "Change Password", error: null })
);

// 5. Profile Page (with auth middleware)
router.get("/profile", getProfile); // getProfile controller handles rendering

// =====================================
// POST Routes (Form Submissions)
// =====================================

// 1. Send OTP
router.post("/send-otp", sendOTP);

// 2. Sign Up
router.post("/signup", signUp);

// 3. Login
router.post("/login", login);

// 4. Change Password
router.post("/change-password", changePassword);

// 5. Update Profile
router.post("/profile", auth , updateProfile);

module.exports = router;