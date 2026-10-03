import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  CheckSquare,
  Clock,
  FileText,
  StickyNote,
  Sparkles,
  ArrowRight,
  Plus,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  conversationsApi,
  tasksApi,
  remindersApi,
  documentsApi,
  notesApi,
  toolsApi,
} from '../api/client';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [convs, tks, rems, docs, nts] = await Promise.all([
          conversationsApi.list(),
          tasksApi.list(),
          remindersApi.list(),
          documentsApi.list(),
          notesApi.list(),
        ]);
        setConversations(convs.slice(0, 4));
        setTasks(tks.slice(0, 4));
        setReminders(rems.slice(0, 3));
        setDocuments(docs.slice(0, 3));
        setNotes(nts.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-jarvis-card via-jarvis-surface to-slate-900 border border-cyan-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Workspace Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Welcome back, {user?.preferred_name || 'Adhi'}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Adhii Jarvis is standing by. Your conversations, documents, tasks, and notes are synchronized with isolated security policies.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Launch Voice Chat</span>
            </Link>
            <Link
              to="/documents"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition active:scale-95"
            >
              <FileText className="h-4 w-4" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Conversations',
            value: conversations.length,
            icon: MessageSquare,
            to: '/history',
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
          },
          {
            label: 'Pending Tasks',
            value: pendingTasks.length,
            icon: CheckSquare,
            to: '/tasks',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Upcoming Reminders',
            value: reminders.length,
            icon: Clock,
            to: '/reminders',
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
          },
          {
            label: 'Indexed Documents',
            value: documents.length,
            icon: FileText,
            to: '/documents',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.to}
              className="p-5 rounded-2xl bg-jarvis-card/80 border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {item.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main 2-Column Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Conversations */}
        <div className="p-6 rounded-3xl bg-jarvis-card/70 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              Recent Conversations
            </h3>
            <Link to="/history" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No conversation history yet.</p>
            ) : (
              conversations.map((c) => (
                <Link
                  key={c.id}
                  to={`/chat?id=${c.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/30 transition text-xs group"
                >
                  <div className="truncate mr-3">
                    <p className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                      {c.title}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {new Date(c.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {c.message_count || 0} messages
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Tasks Due & Upcoming */}
        <div className="p-6 rounded-3xl bg-jarvis-card/70 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-amber-400" />
              Tasks & Action Items
            </h3>
            <Link to="/tasks" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No scheduled tasks found.</p>
            ) : (
              tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3 truncate mr-2">
                    <span
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        t.status === 'completed'
                          ? 'bg-emerald-400'
                          : t.priority === 'urgent'
                          ? 'bg-rose-500 animate-pulse'
                          : t.priority === 'high'
                          ? 'bg-amber-400'
                          : 'bg-blue-400'
                      }`}
                    />
                    <span className={`font-medium truncate ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {t.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 capitalize flex-shrink-0">
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Notes Snippets */}
        <div className="p-6 rounded-3xl bg-jarvis-card/70 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-purple-400" />
              Saved Notes
            </h3>
            <Link to="/notes" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No saved notes.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <h4 className="font-semibold text-slate-200 mb-1">{n.title}</h4>
                  <p className="text-slate-400 line-clamp-2 leading-relaxed">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="p-6 rounded-3xl bg-jarvis-card/70 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-400" />
              Scheduled Reminders
            </h3>
            <Link to="/reminders" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {reminders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active reminders.</p>
            ) : (
              reminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-medium text-slate-200 truncate">{r.title}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(r.reminder_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                    r.status === 'triggered' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
