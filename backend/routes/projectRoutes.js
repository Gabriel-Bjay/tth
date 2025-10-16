import express from "express";
import Project from "../models/Project.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all projects (with creator info)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("Fetch projects error:", err.message);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});
// ✅ Get single project by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// ✅ Create project (admin only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const { name, description, startDate, endDate } = req.body;

    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      createdBy: req.user.id,
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("Create project error:", err.message);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// ✅ Update project (admin only)
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Project not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update project" });
  }
});

// ✅ Delete project (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete project" });
  }
});

export default router;
