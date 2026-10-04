import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Calendar, Bell, AlertCircle, X } from 'lucide-react';
import { remindersApi } from '../api/client';

export const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [reminderAt, setReminderAt] = useState('');

  const fetchReminders = async () => {
    try {
      const data = await remindersApi.list();
      setReminders(data);
    } catch (e) {
      console.error('Error fetching reminders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const openCreateModal = () => {
    const d = new Date(Date.now() + 3600000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const defaultVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setReminderAt(defaultVal);
    setTitle('');
    setShowModal(true);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reminderAt) return;

    try {
      // Ensure complete ISO date even if browser truncated time
      let dateString = reminderAt;
      if (!dateString.includes('T')) {
        dateString += 'T09:00';
      }
      const parsed = new Date(dateString);
      const iso = isNaN(parsed.getTime()) ? new Date(Date.now() + 3600000).toISOString() : parsed.toISOString();

      await remindersApi.create({
        title: title.trim(),
        reminder_at: iso,
      });
      setShowModal(false);
      setTitle('');
      setReminderAt('');
      await fetchReminders();
    } catch (err) {
      console.error('Reminder creation error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await remindersApi.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Failed to delete reminder:', e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-rose-400" />
            <span>Scheduled Reminders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            APScheduler powered background alerts for interview schedules and study routines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-medium text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Info notice about sleep platforms */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Bell className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Scheduler Architecture:</strong> Background checks run every 15 seconds via AsyncIOScheduler. Free tier cloud hosting (such as sleeping instances) may delay execution until the backend wakes up on client activity.
        </p>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-jarvis-card/40 border border-slate-800 text-slate-500 text-xs">
            No scheduled reminders. Set a reminder here or say to Jarvis: "Remind me tomorrow at 7 PM..."
          </div>
        ) : (
          reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-4 rounded-2xl bg-jarvis-card/80 border border-slate-800 hover:border-rose-500/30 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    rem.status === 'triggered'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-slate-200 truncate">{rem.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(rem.reminder_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${
                    rem.status === 'triggered'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {rem.status}
                </span>

                <button
                  onClick={() => handleDelete(rem.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Delete Reminder"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-jarvis-card border border-rose-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Reminder</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Reminder Description</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Design Mock Interview"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={reminderAt}
                  onChange={(e) => setReminderAt(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-medium shadow-lg shadow-rose-500/20 active:scale-95 transition"
                >
                  Schedule Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
