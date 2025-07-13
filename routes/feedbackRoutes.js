// feedbackRoutes.js
const express = require("express");
const router = express.Router();
const { auth, isCitizen, isAdmin } = require("../middlewares/auth");
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedback
} = require("../controllers/feedback");


// =====================================
// GET Routes (Render EJS Templates)
// =====================================

// 1. Render Feedback Form (for citizens)
router.get("/submit", (req, res) => {
  res.render("feedbackForm", {
    title: "Submit Feedback",
    error: null,
    message: null,  // Ensure message is always defined
    messageField: "", 
    rating: ""
  });
});



// 2. List All Feedback (admin only)
router.get("/all", getAllFeedback);// auth, isAdmin,

// 3. View Single Feedback (admin or owner)
router.get("/:feedbackId",  getFeedbackById); //auth

// =====================================
// POST Routes (Form Submissions)
// =====================================

// 1. Submit Feedback (citizen)
router.post("/submit",  submitFeedback); //auth, isCitizen,

// 2. Delete Feedback (admin only)
router.post("/:feedbackId/delete",  deleteFeedback); //auth

module.exports = router;