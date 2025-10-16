import express from "express";
import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get comments for a task
router.get("/:taskId", authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Add comment to a task
router.post("/:taskId", authMiddleware, async (req, res) => {
  const { content } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = await Comment.create({
      content,
      task: task._id,
      user: req.user._id,
      createdAt: new Date(),
    });

    const populatedComment = await comment.populate("user", "name email");
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// Update a comment
router.put("/:commentId", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    comment.content = req.body.content;
    await comment.save();

    const populatedComment = await comment.populate("user", "name email");
    res.json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update comment" });
  }
});

export default router;