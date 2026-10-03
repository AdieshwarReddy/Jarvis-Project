import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  PlusCircle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { conversationsApi } from '../api/client';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const fetchConversations = async () => {
    try {
      const data = await conversationsApi.list();
      setConversations(data);
    } catch (e) {
      console.error('Error fetching conversations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this conversation permanently?')) return;
    try {
      await conversationsApi.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleStartEdit = (c: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveEdit = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await conversationsApi.update(id, { title: editTitle.trim() });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c))
      );
      setEditingId(null);
    } catch (e) {
      console.error('Update title failed:', e);
    }
  };

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.summary && c.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-cyan-400" />
            <span>Conversation History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review past dialogues, auto-generated summaries, and AI reasoning.
          </p>
        </div>

        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Session</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversation titles or summary content..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-jarvis-card border border-slate-800 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading conversations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-jarvis-card/40 border border-slate-800 text-slate-500 text-xs">
            No matching conversations found.
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-jarvis-card/80 border border-slate-800 hover:border-cyan-500/30 transition-all duration-200 group flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="px-2.5 py-1 text-sm rounded-lg bg-slate-900 border border-cyan-400 text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={(e) => handleSaveEdit(c.id, e)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Link to={`/chat?id=${c.id}`} className="block group-hover:text-cyan-300 transition">
                    <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition truncate">
                      {c.title}
                    </h3>
                  </Link>
                )}

                {c.summary && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {c.summary}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.updated_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3" />
                    {c.message_count || 0} messages
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition flex-shrink-0">
                <button
                  onClick={(e) => handleStartEdit(c, e)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition"
                  title="Rename"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(c.id, e)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link
                  to={`/chat?id=${c.id}`}
                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition"
                  title="Open Chat"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
