import express from "express";
import User from "../models/User.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can see all users
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("_id name email role");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;