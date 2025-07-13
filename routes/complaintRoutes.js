// complaintsRoutes.js
const express = require("express");
const router = express.Router();
const { auth, isCitizen, isAdmin } = require("../middlewares/auth");
const {
  renderComplaintForm,
  fileComplaint,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
} = require("../controllers/complaint");

// =====================================
// GET Routes (Render EJS Templates)
// =====================================

// 1. Render Complaint Form (for citizens)
router.get("/file",  renderComplaintForm);

// 2. List All Complaints (admin view)
router.get("/all",  getAllComplaints);

// 3. View Single Complaint
router.get("/:id",  getComplaintById);

// =====================================
// POST Routes (Form Submissions)
// =====================================

// 1. File New Complaint
router.post("/file",   fileComplaint);

// 2. Update Complaint Status (admin)
router.post("/:id/update-status",   updateComplaintStatus);

// 3. Delete Complaint (admin)
router.post("/:id/delete",  deleteComplaint);

module.exports = router;