const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { protect } = require('../middleware/auth');

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { title, description, color, icon, frequency } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const habit = await Habit.create({
      userId: req.user._id,
      title,
      description,
      color,
      icon,
      frequency,
    });
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/habits/:id
router.put('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const { title, description, color, icon, frequency } = req.body;
    if (title !== undefined) habit.title = title;
    if (description !== undefined) habit.description = description;
    if (color !== undefined) habit.color = color;
    if (icon !== undefined) habit.icon = icon;
    if (frequency !== undefined) habit.frequency = frequency;

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/habits/:id/complete
router.post('/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const alreadyCompleted = habit.completedDates.some((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Already completed today' });
    }

    habit.completedDates.push(new Date());
    habit.recalculateStreak();
    await habit.save();

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/habits/:id/stats
router.get('/:id/stats', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    // Build last 30 days data
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - i);
      const completed = habit.completedDates.some((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === day.getTime();
      });
      last30Days.push({
        date: day.toISOString().split('T')[0],
        completed,
      });
    }

    res.json({
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions: habit.completedDates.length,
      last30Days,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
