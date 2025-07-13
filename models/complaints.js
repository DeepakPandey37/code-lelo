const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },

  description: {
    type: String,
    required: true 
  },

  category: { 
    type: String, 
    enum: ["road", "water", "electricity", "sanitation", "other"],
    required: true 
  },

  status: { 
    type: String,
    enum: ["pending", "in-progress", "resolved"], 
    default: "pending" 
  },

  image: { 
    type: String, // URL of the uploaded image
    default: null // Optional field
  },

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false
  },

  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" // Admin assigned
  },
  location: { 
    type: String,
    required: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
