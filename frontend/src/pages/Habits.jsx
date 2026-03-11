import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
const EMOJIS = ['⭐', '💪', '🏃', '📚', '🧘', '💧', '🥗', '😴', '🎯', '🎵', '✍️', '🧹', '🌿', '❤️', '🚴', '🏋️', '🧠', '🌅', '🍎', '💊'];

const defaultForm = { title: '', description: '', frequency: 'daily', color: '#6366f1', icon: '⭐' };

const HabitModal = ({ habit, onClose, onSave }) => {
  const [form, setForm] = useState(habit ? { ...habit } : { ...defaultForm });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      if (habit) {
        const { data } = await axios.put(`/api/habits/${habit._id}`, form);
        onSave(data, 'edit');
        toast.success('Habit updated!');
      } else {
        const { data } = await axios.post('/api/habits', form);
        onSave(data, 'add');
        toast.success('Habit created! 🎉');
      }
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {habit ? 'Edit Habit' : 'New Habit'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Icon Preview */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner"
                style={{ backgroundColor: form.color + '20', border: `3px solid ${form.color}` }}>
                {form.icon}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="label">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="e.g. Morning Run" required />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="input resize-none" rows={2} placeholder="Optional details..." />
            </div>

            {/* Frequency */}
            <div>
              <label className="label">Frequency</label>
              <div className="flex gap-3">
                {['daily', 'weekly'].map((f) => (
                  <button key={f} type="button"
                    onClick={() => setForm({ ...form, frequency: f })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      form.frequency === f
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="label">Color</label>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Emoji Picker */}
            <div>
              <label className="label">Icon</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((em) => (
                  <button key={em} type="button" onClick={() => setForm({ ...form, icon: em })}
                    className={`w-10 h-10 rounded-xl text-xl transition-all hover:scale-110 ${
                      form.icon === em ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (habit ? 'Save Changes' : 'Create Habit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Habits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | habit object

  const fetchHabits = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/habits');
      setHabits(data);
    } catch {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const handleSave = (habit, mode) => {
    if (mode === 'add') {
      setHabits((prev) => [habit, ...prev]);
    } else {
      setHabits((prev) => prev.map((h) => (h._id === habit._id ? habit : h)));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/habits/${id}`);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      toast.success('Habit deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Habits</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{habits.length} habit{habits.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary flex items-center gap-2">
          <span className="text-lg">+</span>
          <span className="hidden sm:block">Add Habit</span>
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="card p-8">
          <EmptyState icon="✅" title="No habits yet" description="Click 'Add Habit' to create your first habit and start building a streak!" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <div key={habit._id} className="card p-5 hover:shadow-md transition-all duration-200 group animate-fade-in">
              {/* Top */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: habit.color + '20' }}>
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{habit.title}</h3>
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-0.5"
                    style={{ backgroundColor: habit.color + '20', color: habit.color }}>
                    {habit.frequency}
                  </span>
                </div>
              </div>

              {/* Description */}
              {habit.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{habit.description}</p>
              )}

              {/* Stats */}
              <div className="flex gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">🔥 {habit.currentStreak}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-500">{habit.longestStreak}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">Best</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-700 dark:text-gray-200">{habit.completedDates.length}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">Total</div>
                </div>
              </div>

              {/* Color bar */}
              <div className="h-1 rounded-full mb-4" style={{ backgroundColor: habit.color }} />

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setModal(habit)}
                  className="flex-1 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(habit._id)}
                  className="flex-1 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-400 hover:text-red-500 transition-all">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <HabitModal
          habit={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Habits;
