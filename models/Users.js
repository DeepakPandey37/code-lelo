const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String,
     unique: true,
      required: true
 },
  password: { 
    type: String,
     required: true
     },
     accountType:
   { type: String,
     enum: ["Citizen", "Admin"],
    default: "Citizen" },
  createdAt: { 
    type: Date, 
    default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
