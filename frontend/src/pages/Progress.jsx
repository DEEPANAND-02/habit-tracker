import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

// GitHub-style heatmap
const Heatmap = ({ completedDates }) => {
  const weeks = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedSet = new Set(
    completedDates.map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.toDateString();
    })
  );

  // Build a 15-week grid (105 days)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 104);
  // Adjust to start on Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  for (let w = 0; w < 15; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + w * 7 + d);
      day.setHours(0, 0, 0, 0);
      week.push({
        date: day,
        completed: completedSet.has(day.toDateString()),
        future: day > today,
      });
    }
    weeks.push(week);
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day.date.toDateString()}
                className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 ${
                  day.future
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : day.completed
                    ? 'bg-indigo-500 dark:bg-indigo-400 hover:bg-indigo-600'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className="w-3.5 h-3.5 rounded-sm"
            style={{ backgroundColor: l === 0 ? '#e5e7eb' : `rgba(99,102,241,${0.2 * l})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-200">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Progress = () => {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/habits');
      setHabits(data);
      if (data.length > 0) setSelectedHabit(data[0]);
    } catch {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  useEffect(() => {
    if (!selectedHabit) return;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const { data } = await axios.get(`/api/habits/${selectedHabit._id}/stats`);
        setStats(data);
      } catch {
        toast.error('Failed to load stats');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [selectedHabit]);

  if (loading) return <LoadingSpinner />;

  if (habits.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress</h1>
        </div>
        <div className="card p-8">
          <EmptyState icon="📊" title="No data yet" description="Create habits and start completing them to see your progress charts here!" />
        </div>
      </div>
    );
  }

  // Build last-7-days bar chart data
  const barData = stats
    ? stats.last30Days.slice(-7).map((d) => ({
        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        Completed: d.completed ? 1 : 0,
      }))
    : [];

  // Build streak trend (line chart) — rolling 7-day streak simulation
  const lineData = stats
    ? stats.last30Days.map((d, i, arr) => {
        const slice = arr.slice(Math.max(0, i - 6), i + 1);
        const streak = slice.reduce((acc, cur) => (cur.completed ? acc + 1 : 0), 0);
        return {
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          Streak: streak,
        };
      }).filter((_, i) => i % 3 === 0)
    : [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your habit performance over time</p>
        </div>
        {/* Habit selector */}
        <select
          value={selectedHabit?._id || ''}
          onChange={(e) => setSelectedHabit(habits.find((h) => h._id === e.target.value))}
          className="input w-auto min-w-[180px]"
        >
          {habits.map((h) => (
            <option key={h._id} value={h._id}>{h.icon} {h.title}</option>
          ))}
        </select>
      </div>

      {loadingStats ? (
        <LoadingSpinner />
      ) : stats ? (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Current Streak', value: `🔥 ${stats.currentStreak}`, sub: 'days' },
              { label: 'Longest Streak', value: `⚡ ${stats.longestStreak}`, sub: 'days' },
              { label: 'Total Completions', value: `✅ ${stats.totalCompletions}`, sub: 'times' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="card p-5 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Completions — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, 1]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Completed" fill={selectedHabit?.color || '#6366f1'} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Streak Trend — Last 30 Days</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:opacity-20" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Streak"
                  stroke={selectedHabit?.color || '#6366f1'}
                  strokeWidth={2.5}
                  dot={{ fill: selectedHabit?.color || '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Activity Heatmap</h2>
            <Heatmap completedDates={selectedHabit?.completedDates || []} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Progress;
