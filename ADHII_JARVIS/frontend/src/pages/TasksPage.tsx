import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';
import { tasksApi } from '../api/client';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = async (status?: string) => {
    try {
      const data = await tasksApi.list(status === 'all' ? undefined : status);
      setTasks(data);
    } catch (e) {
      console.error('Error fetching tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(filter);
  }, [filter]);

  const handleToggleComplete = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await tasksApi.update(task.id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error('Failed to delete task:', e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await tasksApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_at: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      await fetchTasks(filter);
    } catch (err) {
      console.error('Task creation error:', err);
    }
  };

  const priorityBadge = (p: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      urgent: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
      high: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      medium: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      low: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    };
    const c = map[p] || map.medium;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="h-6 w-6 text-amber-400" />
            <span>Tasks & Planner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize action items with priority tags, deadlines, and automated AI status tracking.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-medium text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['all', 'pending', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              filter === tab
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-jarvis-card/40 border border-slate-800 text-slate-500 text-xs">
            No tasks found in this view. Add a task above or ask Jarvis: "Create a task to..."
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-jarvis-card/80 border border-slate-800 hover:border-amber-500/30 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 text-slate-500 hover:text-emerald-400 transition flex-shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 hover:scale-110 transition" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-sm font-semibold truncate ${
                      task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
                  )}
                  {task.due_at && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-2">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {new Date(task.due_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {priorityBadge(task.priority)}
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-jarvis-card border border-amber-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Practice Dynamic Programming"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context or notes..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-medium shadow-lg shadow-amber-500/20 active:scale-95 transition"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
