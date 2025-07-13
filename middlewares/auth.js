const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require("../models/Users");

// Authentication Middleware
exports.auth = async (req, res, next) => {
  try {
    // Extract token from cookies, body, or headers
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // If token is missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while validating the token",
    });
  }
};

// Middleware to check if the user is a Citizen
exports.isCitizen = (req, res, next) => {
  try {
    if (req.user.role !== "citizen") {
      return res.status(403).json({
        success: false,
        message: "Access restricted to citizens only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};

// Middleware to check if the user is an Admin
exports.isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access restricted to admins only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};
