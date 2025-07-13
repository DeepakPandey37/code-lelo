const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: "User", 
     required: true },
     location: { 
      type: String,
      required: false 
    },
  message: {
     type: String, 
    required: true },
  read: { type: Boolean, 
    default: false 
},
  createdAt: { type: Date, 
    default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);
