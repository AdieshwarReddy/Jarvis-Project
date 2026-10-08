import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Check,
  X,
  Database,
} from 'lucide-react';
import { NoteDirective } from './types';

interface NotesPanelProps {
  notes: NoteDirective[];
  onAddNote: (title: string) => Promise<void>;
  onToggleNote: (id: string, completed: boolean) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  isSynced: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  notes,
  onAddNote,
  onToggleNote,
  onDeleteNote,
  isSynced,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAddNote(newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-[#09111f]/80 border border-cyan-500/20 shadow-md flex flex-col gap-2.5 select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white tracking-wider">
          <StickyNote className="w-4 h-4 text-cyan-400" />
          <span>[ NOTES & DIRECTIVES ]</span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900 transition"
          title="Add Directive"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* QUICK ADD INPUT FORM */}
      {isAdding && (
        <form onSubmit={handleCreate} className="flex items-center gap-2 pt-1 pb-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New directive or priority..."
            autoFocus
            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-cyan-500/40 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition disabled:opacity-40"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* DIRECTIVES LIST */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs font-mono">
        {notes.length === 0 ? (
          <div className="py-4 text-center text-slate-500 text-[11px]">
            No directives saved. Tap + to add.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-center justify-between p-2 rounded-xl bg-slate-950/50 hover:bg-cyan-950/20 border border-slate-800/80 hover:border-cyan-500/30 transition text-slate-300"
            >
              <button
                onClick={() => onToggleNote(note.id, !note.completed)}
                className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
              >
                {note.completed ? (
                  <CheckSquare className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                )}
                <span
                  className={`truncate ${
                    note.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {note.title}
                </span>
              </button>

              <button
                onClick={() => onDeleteNote(note.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                title="Delete note"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* FOOTER SYNC STATUS */}
      <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-cyan-500/70" />
          SYSTEM: {isSynced ? 'SYNCED' : 'LOCAL CACHE'}
        </span>
        <span className="text-cyan-500/80 font-semibold">SUPABASE PG</span>
      </div>
    </div>
  );
};
