// controllers/taskController.js
import Task from '../models/Task.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all tasks (admin only)
// @route   GET /api/tasks
// @access  Private/Admin
export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find().populate('assignedTo', 'name email');
  res.status(200).json(tasks);
});

// @desc    Get tasks assigned to logged-in user
// @route   GET /api/tasks/my
// @access  Private
export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.id });
  res.status(200).json(tasks);
});

// @desc    Create a new task (admin only)
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, deadline, assignedTo } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const user = await User.findById(assignedTo);
  if (!user) {
    res.status(404);
    throw new Error('Assigned user not found');
  }

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    deadline,
    assignedTo,
    createdBy: req.user.id,
  });

  res.status(201).json(task);
});

// @desc    Update task (admin only)
// @route   PUT /api/tasks/:id
// @access  Private/Admin
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTask);
});

// @desc    Delete task (admin only)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();
  res.status(200).json({ message: 'Task deleted successfully' });
});