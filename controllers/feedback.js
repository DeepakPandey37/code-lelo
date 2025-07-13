const Feedback = require("../models/feedback");

// Submit Feedback (EJS version)
exports.submitFeedback = async (req, res) => {
  try {
    // Extract fields from request body
    const { message, rating, location, user, complaint } = req.body;

    // Validate required fields
    if (!message || !rating || !user || !complaint) {
      return res.status(201).render("feedbackForm", {
        title: "Submit Feedback",
        error: null,
        message: "Feedback submitted successfully", // ✅ This is sent to the view
        messageField: "",
        rating: ""
      });
      
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).render("feedbackForm", {
        title: "Submit Feedback",
        error: "Rating must be between 1 and 5",
        messageField: message,
        rating
      });
    }

    // Create a new feedback
    const newFeedback = await Feedback.create({
      message,
      rating,
      location,
      user,
      complaint
    });

    return res.status(201).render("feedbackForm", {
      title: "Submit Feedback",
      error: null,
      message: "Feedback submitted successfully",
      messageField: "",
      rating: ""
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).render("feedbackForm", {
      title: "Submit Feedback",
      error: "Feedback submission failed. Please try again later.",
      messageField: req.body.message || "",
      rating: req.body.rating || ""
    });
  }
};

// Get all Feedback (EJS version)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("user", "firstName lastName email");
    return res.status(200).render("feedbackList", {
      title: "All Feedback",
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return res.status(500).render("error", {
      title: "Error",
      message: "Failed to fetch feedback",
    });
  }
};

// Get a single feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findById(feedbackId).populate("user", "firstName lastName email");

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch feedback" });
  }
};

// Delete a feedback (Admin or User)
exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!deletedFeedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    return res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({ success: false, message: "Failed to delete feedback" });
  }
};
