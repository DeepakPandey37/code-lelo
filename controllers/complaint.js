const Complaint = require("../models/complaints");
const { cloudinaryUpload } = require("../utils/imageUploader");

// Render File Complaint Form (GET)
exports.renderComplaintForm = (req, res) => {
  return res.render("complaintForm", {
    title: "File Complaint",
    error: null,
    message: null,
    titleField: "",
    description: "",
    category: ""
  });
};

// File a new complaint (POST)
// Authentication removed so that all users can file a complaint
exports.fileComplaint = async (req, res) => {
  try {
    // Removed the authentication check; if available, use its id; otherwise, set user to null.
    const { title, description, category, location } = req.body;
    const userId = req.user ? req.user.id : null;
    let imageUrl = null;

    if (req.files && req.files.image) {
      const file = req.files.image;
      // Use the correctly imported function: cloudinaryUpload
      const uploadResult = await cloudinaryUpload(file, "complaints");
      imageUrl = uploadResult.secure_url;
    }

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).render("complaintForm", {
        title: "File Complaint",
        error: "All fields are required",
        message: null,
        titleField: title || "",
        description: description || "",
        category: category || ""
      });
    }

    const newComplaint = await Complaint.create({
      user: userId, // Will be null if user is not logged in
      title,
      description,
      category,
      status: "pending",
      image: imageUrl,
      location  // New: storing the location string (e.g., "12.345678, 98.765432")
    });

    return res.status(201).render("complaintForm", {
      title: "File Complaint",
      error: null,
      message: "Complaint filed successfully",
      titleField: "",
      description: "",
      category: ""
    });
  } catch (error) {
    console.error("Error filing complaint:", error);
    return res.status(500).render("complaintForm", {
      title: "File Complaint",
      error: "Complaint submission failed. Please try again later.",
      message: null,
      titleField: "",
      description: "",
      category: ""
    });
  }
};

// Get all complaints (Render page)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("user", "firstName lastName email");
    return res.status(200).render("complaints", {
      title: "All Complaints",
      complaints
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return res.status(500).render("error", {
      title: "Error",
      message: "Failed to fetch complaints"
    });
  }
};

// Get a single complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findById(complaintId).populate("user", "firstName lastName email");

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch complaint" });
  }
};

// Update complaint status (Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body;

    if (!["pending", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(complaintId, { status }, { new: true });

    if (!updatedComplaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    return res.status(200).json({ success: true, message: "Complaint status updated", complaint: updatedComplaint });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return res.status(500).json({ success: false, message: "Failed to update complaint" });
  }
};

// Delete a complaint (Admin or User)
exports.deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const deletedComplaint = await Complaint.findByIdAndDelete(complaintId);

    if (!deletedComplaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    return res.status(200).json({ success: true, message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return res.status(500).json({ success: false, message: "Failed to delete complaint" });
  }
};
