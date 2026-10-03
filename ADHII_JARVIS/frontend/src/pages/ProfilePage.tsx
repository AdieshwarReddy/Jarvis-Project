import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Clock, Save, LogOut, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/client';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPreferredName(profile.preferred_name || '');
      setTimezone(profile.timezone || 'UTC');
      setLanguage(profile.preferred_language || 'en');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await settingsApi.updateProfile({
        display_name: displayName,
        preferred_name: preferredName,
        timezone,
        preferred_language: language,
      });
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <User className="h-6 w-6 text-cyan-400" />
          <span>User Profile & Identity</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal workspace identity and localized assistant preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Profile preferences saved successfully.</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="p-8 rounded-3xl bg-jarvis-card/90 border border-cyan-500/20 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar & Email Display */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/20">
              {preferredName.charAt(0) || 'A'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{displayName || 'Adhi'}</h3>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" />
                {profile?.email || user?.email || 'demo@adhiijarvis.ai'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Preferred Name (How Jarvis addresses you)</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                <option value="en">English (Default)</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="fr">French</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 text-xs font-medium transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 active:scale-95 transition"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
