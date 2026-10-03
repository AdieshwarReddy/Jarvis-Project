import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Brain,
  Volume2,
  Sliders,
  ShieldCheck,
  Trash2,
  Plus,
  Check,
} from 'lucide-react';
import { settingsApi } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [responseStyle, setResponseStyle] = useState('Balanced');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [ttsProvider, setTtsProvider] = useState('edge-tts');
  const [speechRate, setSpeechRate] = useState('+0%');

  // Memories
  const [memories, setMemories] = useState<any[]>([]);
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryType, setNewMemoryType] = useState('preference');
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchMemories = async () => {
    try {
      const data = await settingsApi.getMemories();
      setMemories(data);
    } catch (e) {
      console.error('Error fetching memories:', e);
    } finally {
      setLoadingMemories(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDeleteMemory = async (id: string) => {
    try {
      await settingsApi.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error('Failed to delete memory:', e);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    try {
      await settingsApi.createMemory({
        memory_type: newMemoryType,
        content: newMemoryText.trim(),
        importance: 4,
      });
      setNewMemoryText('');
      await fetchMemories();
    } catch (e) {
      console.error('Failed to add memory:', e);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('jarvis_style', responseStyle);
    localStorage.setItem('jarvis_voice', String(voiceEnabled));
    localStorage.setItem('jarvis_tts', ttsProvider);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="h-6 w-6 text-cyan-400" />
          <span>Assistant Settings & Knowledge Memory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tune response verbosity, voice synthesis preferences, and long-term memory extraction.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* Assistant Personality Style */}
      <div className="p-6 rounded-3xl bg-jarvis-card/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Assistant Personality & Response Style</h3>
            <p className="text-xs text-slate-400">Controls verbosity and structure of LLM responses.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'Concise', title: 'Concise', desc: 'Direct, minimal sentences and code snippets.' },
            { id: 'Balanced', title: 'Balanced', desc: 'Default professional, clear, and actionable.' },
            { id: 'Detailed', title: 'Detailed', desc: 'Comprehensive explanations, step-by-step logic.' },
          ].map((style) => (
            <div
              key={style.id}
              onClick={() => setResponseStyle(style.id)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                responseStyle === style.id
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-white">{style.title}</span>
                {responseStyle === style.id && <Check className="h-4 w-4 text-cyan-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{style.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Voice & Audio Controls */}
      <div className="p-6 rounded-3xl bg-jarvis-card/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Volume2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Voice & Audio Pipeline Preferences</h3>
            <p className="text-xs text-slate-400">Speech-to-text input and text-to-speech synthesis providers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">Auto-Play Voice Response</span>
              <span className="text-[11px] text-slate-400">Play spoken audio when voice mode is engaged</span>
            </div>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-400"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <label className="text-xs font-semibold text-white block mb-1">TTS Audio Provider</label>
            <select
              value={ttsProvider}
              onChange={(e) => setTtsProvider(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
            >
              <option value="edge-tts">Edge-TTS Neural Voice (High Quality • Free)</option>
              <option value="elevenlabs">ElevenLabs API (When key configured)</option>
              <option value="browser">Browser SpeechSynthesis (Fallback)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSavePreferences}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-medium shadow-lg shadow-cyan-500/20 active:scale-95 transition"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Long-Term Memory Section */}
      <div className="p-6 rounded-3xl bg-jarvis-card/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Long-Term Memory & User Preferences</h3>
              <p className="text-xs text-slate-400">
                Facts and guidelines Jarvis has learned across sessions. You have full deletion rights.
              </p>
            </div>
          </div>
        </div>

        {/* Add manual memory */}
        <form onSubmit={handleAddMemory} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newMemoryText}
            onChange={(e) => setNewMemoryText(e.target.value)}
            placeholder="Add memory manually: e.g. Always generate TypeScript code with strict types"
            className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-400 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium border border-purple-500/30 flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Store</span>
          </button>
        </form>

        {/* Stored Memories List */}
        <div className="space-y-2 pt-2">
          {loadingMemories ? (
            <div className="text-xs text-slate-500 py-4 text-center">Loading memories...</div>
          ) : memories.length === 0 ? (
            <div className="text-xs text-slate-500 py-4 text-center">No stored long-term memories.</div>
          ) : (
            memories.map((mem) => (
              <div
                key={mem.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-purple-300 border border-slate-700 flex-shrink-0">
                    {mem.memory_type}
                  </span>
                  <span className="text-slate-200 truncate">{mem.content}</span>
                </div>
                <button
                  onClick={() => handleDeleteMemory(mem.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition flex-shrink-0"
                  title="Delete memory"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Architecture Callout */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-slate-200 mb-1">Placement Portfolio Security Architecture</h4>
          <p className="leading-relaxed">
            All LLM provider keys (Groq, OpenAI, Anthropic) and Supabase Service Role keys reside exclusively in backend environment variables. The browser client receives only a scoped JWT token for Row Level Security verification.
          </p>
        </div>
      </div>
    </div>
  );
};
