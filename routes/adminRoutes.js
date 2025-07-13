const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const { getDashboardStats, assignComplaint, removeUser } = require("../controllers/userController");

router.get("/dashboard", auth, isAdmin, getDashboardStats);
router.post("/assign/:id", auth, isAdmin, assignComplaint);
router.delete("/remove-user/:id", auth, isAdmin, removeUser);

module.exports = router;
