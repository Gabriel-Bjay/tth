import express from "express";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all tasks (admin) or user's tasks (member), including comments
router.get("/", authMiddleware, async (req, res) => {
  try {
    let tasksQuery;
    if (req.user.role === "admin") {
      tasksQuery = Task.find();
    } else {
      tasksQuery = Task.find({ assignedTo: req.user.id });
    }

    const tasks = await tasksQuery
      .populate("assignedTo", "full_name email")
      .populate("project", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Populate comments for each task
    const tasksWithComments = await Promise.all(
      tasks.map(async (task) => {
        const comments = await Comment.find({ task: task._id })
          .populate("user", "name email")
          .sort({ createdAt: 1 })
          .lean();
        return { ...task, comments };
      })
    );

    res.json(tasksWithComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

// GET single task by ID (with comments)
router.get("/:taskId", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("assignedTo", "full_name email")
      .populate("project", "name")
      .lean();
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comments = await Comment.find({ task: task._id })
      .populate("user", "name email")
      .sort({ createdAt: 1 })
      .lean();

    res.json({ ...task, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

// POST create new task (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, assignedTo, project, status, deadline } = req.body;
    if (!title || !assignedTo) return res.status(400).json({ message: "Title and assigned user required" });

    const user = await User.findById(assignedTo);
    if (!user) return res.status(404).json({ message: "Assigned user not found" });

    const task = await Task.create({
      title,
      description,
      assignedTo,
      project,
      status: status || "todo",
      deadline,
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// PUT update task (admin only)
router.put("/:taskId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// DELETE task (admin only)
router.delete("/:taskId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Delete all comments associated with the task
    await Comment.deleteMany({ task: task._id });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

export default router;