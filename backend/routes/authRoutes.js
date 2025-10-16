import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper: Create JWT
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 📝 REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    console.log("Registration attempt:", email);

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Create user (password is auto-hashed by pre-save hook)
    const user = await User.create({ name, email, password, role });

    // Generate JWT
    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔑 LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Login attempt:", email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    console.log("Password valid?", isMatch);

    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid email or password" });

    // Generate token
    const token = createToken(user);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 👤 CURRENT USER (Protected)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error("Fetch current user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;