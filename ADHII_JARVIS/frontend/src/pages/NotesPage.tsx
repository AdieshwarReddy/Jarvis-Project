import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Search, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { notesApi } from '../api/client';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Note Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNotes = async (q?: string) => {
    try {
      const data = await notesApi.list(q);
      setNotes(data);
    } catch (e) {
      console.error('Error fetching notes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(searchQuery);
  }, [searchQuery]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingId) {
        await notesApi.update(editingId, { title, content });
      } else {
        await notesApi.create({ title, content });
      }
      setShowModal(false);
      setTitle('');
      setContent('');
      setEditingId(null);
      await fetchNotes();
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleEdit = (note: any) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesApi.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <StickyNote className="h-6 w-6 text-purple-400" />
            <span>Workspace Notes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store research findings, placement cheat sheets, and AI generated thoughts.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setTitle('');
            setContent('');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-purple-500/20 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Create Note</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search note titles or keywords..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-jarvis-card border border-slate-800 text-white text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-jarvis-card/40 border border-slate-800 text-slate-500 text-xs">
            No notes found. Create your first note or ask Jarvis in chat ("Create a note called...").
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-2xl bg-jarvis-card/90 border border-slate-800 hover:border-purple-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed mb-4">
                  {note.content}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-800">
                <Calendar className="h-3 w-3" />
                <span>{new Date(note.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-jarvis-card border border-purple-500/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note Title"
                  className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Content</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note content..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:border-purple-400 focus:outline-none resize-none"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-medium shadow-lg shadow-purple-500/20 active:scale-95 transition"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
