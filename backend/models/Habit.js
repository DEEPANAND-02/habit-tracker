const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: '⭐',
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily',
  },
  completedDates: {
    type: [Date],
    default: [],
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Helper to check if two dates are the same calendar day
habitSchema.methods.isSameDay = function (date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Recalculate streaks based on completedDates
habitSchema.methods.recalculateStreak = function () {
  if (this.completedDates.length === 0) {
    this.currentStreak = 0;
    return;
  }

  // Deduplicate by calendar day and sort descending
  const uniqueDays = [];
  const seen = new Set();
  for (const d of this.completedDates) {
    const key = new Date(d).toDateString();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDays.push(new Date(d));
    }
  }
  uniqueDays.sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const mostRecent = new Date(uniqueDays[0]);
  mostRecent.setHours(0, 0, 0, 0);

  // If the most recent completion isn't today or yesterday, streak is 0
  if (mostRecent < yesterday) {
    this.currentStreak = 0;
    return;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);

    const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  this.currentStreak = streak;
  if (streak > this.longestStreak) {
    this.longestStreak = streak;
  }
};

module.exports = mongoose.model('Habit', habitSchema);
