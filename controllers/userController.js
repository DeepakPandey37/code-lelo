const User = require("../models/Users");
const OTP = require("../models/Otp");
const Complaint = require("../models/complaints");
const Feedback = require("../models/feedback");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender"); // Optional: For password change notifications
const { passwordUpdated } = require("../mail/templates/emailVerificationTemplate"); // Optional: Adjust path if needed

require("dotenv").config();

// =====================================
// Send OTP
// =====================================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        title: "Send OTP",
        error: "User already exists",
      });
    }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated:", otp);
    let existingOtp = await OTP.findOne({ otp });
    while (existingOtp) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      existingOtp = await OTP.findOne({ otp });
    }
    await OTP.create({ email, otp });
    // Instead of rendering a view, send a JSON response indicating success.
    return res.status(200).json({
      title: "OTP Sent",
      message: "OTP sent successfully. Please check your email.",
      // Uncomment the next line to include the OTP for debugging (not recommended in production).
      // otp: otp 
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      title: "Send OTP",
      error: error.message,
    });
  }
};

// =====================================
// Sign Up
// =====================================
exports.signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
      return res.status(400).render("signUp", {
        title: "Sign Up",
        error: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).render("signUp", {
        title: "Sign Up",
        error: "Passwords do not match",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("signUp", {
        title: "Sign Up",
        error: "User is already registered",
      });
    }

    // Get most recent OTP for the email
    const recentOtpArr = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (recentOtpArr.length === 0 || recentOtpArr[0].otp !== otp) {
      return res.status(400).render("signUp", {
        title: "Sign Up",
        error: "Invalid or expired OTP",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine approved flag based on accountType
    const approved = accountType === "admin" ? false : true;

    // Create the User
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      approved,
      image: "",
    });

    return res.redirect("/");
  } catch (error) {
    console.error("Error signing up:", error);
    return res.status(500).render("signUp", {
      title: "Sign Up",
      error: "User registration failed. Please try again later.",
    });
  }
};

// =====================================
// Login
// =====================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).render("login", {
        title: "Login",
        error: "Email and password are required",
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).render("login", {
        title: "Login",
        error: "User is not registered. Please sign up.",
      });
    }

    if (!user.password || typeof user.password !== "string") {
      return res.status(500).render("login", {
        title: "Login",
        error: "Invalid password stored in the database",
      });
    }

    // Compare provided password with stored hashed password
    const isPasswordCorrect = await bcrypt.compare(String(password), String(user.password));
    if (!isPasswordCorrect) {
      return res.status(401).render("login", {
        title: "Login",
        error: "Password is incorrect",
      });
    }

    // Generate JWT token and set cookie
    const token = jwt.sign(
      { 
        email: user.email, 
        id: user._id, 
        accountType: user.accountType // Changed from 'role' to 'accountType'
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    const cookieOptions = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("token", token, cookieOptions);

    // Redirect to a dashboard or home page after successful login
    return res.redirect("/");
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).render("login", {
      title: "Login",
      error: "Login failed. Please try again.",
    });
  }
};

// =====================================
// Change Password
// =====================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).render("changePassword", {
        title: "Change Password",
        error: "User not found",
      });
    }

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).render("changePassword", {
        title: "Change Password",
        error: "The old password is incorrect",
      });
    }

    // Hash the new password and update
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    user.password = encryptedPassword;
    const updatedUser = await user.save();

    // Optional: Send a notification email about the password change
    try {
      const emailResponse = await mailSender(
        updatedUser.email,
        "Your account password has been updated",
        passwordUpdated(
          updatedUser.email,
          `Password updated successfully for ${updatedUser.firstName} ${updatedUser.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (mailError) {
      console.error("Error occurred while sending email:", mailError);
      // Continue without failing the password update
    }

    return res.status(200).render("changePasswordSuccess", {
      title: "Password Changed",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).render("changePassword", {
      title: "Change Password",
      error: "Error occurred while updating password: " + error.message,
    });
  }
};

// =====================================
// Get User Profile
// =====================================
exports.getProfile = async (req, res) => {
  try {
    // Directly use the user from middleware
    const user = req.user;
    
    // For HTML requests
    if (req.accepts("html")) {
      return res.render("profile", { 
        title: "My Profile",
        user 
      });
    }
    
    // For API requests
    return res.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).render("error", { 
      error: "Failed to load profile" 
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, contactNumber } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, contactNumber },
      { new: true }
    );
    return res.status(200).render("profile", {
      title: "Profile Updated",
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).render("error", {
      title: "Error",
      message: "Profile update failed",
    });
  }
};

// =====================================
// Get Dashboard Stats (Admin)
// =====================================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaintsCount = await Complaint.countDocuments({ status: "pending" });
    const inProgressComplaints = await Complaint.countDocuments({ status: "in-progress" });
    const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" });
    const totalFeedbacks = await Feedback.countDocuments();

    // Additionally, fetch detailed lists for pending complaints and users
    const pendingComplaints = await Complaint.find({ status: "pending" });
    const users = await User.find(); // You might want to filter admin vs. non-admin as needed

    res.render("admin-Dashboard", {
      title: "Admin Dashboard",
      stats: {
        totalUsers,
        totalComplaints,
        pendingComplaints: pendingComplaintsCount,
        inProgressComplaints,
        resolvedComplaints,
        totalFeedbacks
      },
      pendingComplaints,
      users
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).render("error", {
      title: "Error",
      message: "Failed to fetch dashboard stats"
    });
  }
};

// =====================================
// Assign Complaint (Admin)
// =====================================
exports.assignComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { assignedTo } = req.body; // Expecting an admin user ID to assign the complaint

    if (!assignedTo) {
      return res.status(400).render("error", {
        title: "Assign Complaint",
        message: "Assigned admin ID is required",
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).render("error", {
        title: "Assign Complaint",
        message: "Complaint not found",
      });
    }

    complaint.assignedTo = assignedTo;
    await complaint.save();

    // Redirect back to the admin dashboard with a success message
    return res.redirect("/admin-dashboard");
  } catch (error) {
    console.error("Error assigning complaint:", error);
    return res.status(500).render("error", {
      title: "Assign Complaint",
      message: "Failed to assign complaint",
    });
  }
};

// =====================================
// Remove User (Admin)
// =====================================
exports.removeUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).render("error", {
        title: "Remove User",
        message: "User not found",
      });
    }
    return res.redirect("/admin-dashboard");
  } catch (error) {
    console.error("Error removing user:", error);
    return res.status(500).render("error", {
      title: "Remove User",
      message: "Failed to remove user",
    });
  }
};
