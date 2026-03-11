import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

// SVG Completion Ring
const CompletionRing = ({ percentage }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="currentColor" strokeWidth="10"
          className="text-gray-100 dark:text-gray-700" />
        <circle
          cx="65" cy="65" r={radius} fill="none" strokeWidth="10"
          stroke="url(#ring-gradient)"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset="0"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <text x="65" y="60" textAnchor="middle" className="fill-gray-800 dark:fill-white" fontSize="22" fontWeight="700" fontFamily="Inter">
          {Math.round(percentage)}%
        </text>
        <text x="65" y="78" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="Inter">
          Today
        </text>
      </svg>
    </div>
  );
};

const isCompletedToday = (completedDates) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return completedDates.some((d) => {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  });
};

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});

  const fetchHabits = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/habits');
      setHabits(data.filter((h) => h.frequency === 'daily'));
    } catch {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const handleComplete = async (habitId) => {
    setCompleting((prev) => ({ ...prev, [habitId]: true }));
    try {
      const { data } = await axios.post(`/api/habits/${habitId}/complete`);
      setHabits((prev) => prev.map((h) => (h._id === habitId ? data : h)));
      toast.success('Habit completed! 🔥 Keep it up!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Already done today!');
    } finally {
      setCompleting((prev) => ({ ...prev, [habitId]: false }));
    }
  };

  const todayCount = habits.filter((h) => isCompletedToday(h.completedDates)).length;
  const percentage = habits.length > 0 ? (todayCount / habits.length) * 100 : 0;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{today}</p>
      </div>

      {habits.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon="🌱"
            title="No daily habits yet"
            description="Head to the Habits page to create your first daily habit and start building your streak!"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Completion Overview */}
          <div className="lg:col-span-1">
            <div className="card p-6 h-full flex flex-col items-center justify-center gap-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Progress</h2>
              <CompletionRing percentage={percentage} />
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{todayCount}</span>
                  {' / '}{habits.length} completed
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  {percentage === 100 ? '🎉 All done! Amazing!' : 'Keep going!'}
                </p>
              </div>
            </div>
          </div>

          {/* Habit Cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {habits.map((habit) => {
              const done = isCompletedToday(habit.completedDates);
              const isLoading = completing[habit._id];
              return (
                <div
                  key={habit._id}
                  className={`card p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-md ${done ? 'opacity-80' : ''}`}
                  style={{ borderLeft: `4px solid ${habit.color}` }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: habit.color + '20' }}
                  >
                    {habit.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-gray-900 dark:text-white truncate ${done ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{habit.description}</p>
                    )}
                    {habit.currentStreak > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 mt-1">
                        🔥 {habit.currentStreak} day streak
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  {done ? (
                    <div className="flex items-center gap-2 text-green-500 font-semibold text-sm flex-shrink-0">
                      <div className="w-7 h-7 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        ✓
                      </div>
                      <span className="hidden sm:block">Done!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleComplete(habit._id)}
                      disabled={isLoading}
                      className="btn-primary text-sm flex-shrink-0 flex items-center gap-2"
                      style={{ backgroundColor: habit.color }}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        '✓ Mark Done'
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
