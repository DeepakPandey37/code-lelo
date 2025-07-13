const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  complaint: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Complaint",
     required: false },
  user: { type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false },
  rating: { 
    type: Number,
     min: 1, 
     max: 5, 
     required: true },
  comments: {
     type: String 
    },
  createdAt: { type: Date,
     default: Date.now }
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
