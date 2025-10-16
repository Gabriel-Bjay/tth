import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
export const getComments = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const comments = await Comment.find({ task: taskId })
    .populate('user', 'name email') // optional: include user info
    .sort({ createdAt: 1 }); // oldest first
  res.status(200).json(comments);
});

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Comment content is required');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const comment = await Comment.create({
    content,
    task: taskId,
    user: req.user.id,
  });

  res.status(201).json(await comment.populate('user', 'name email'));
});