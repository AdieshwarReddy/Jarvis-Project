import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, User, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { AssistantStateIndicator } from './AssistantStateIndicator';
import { NotificationBell } from './NotificationBell';
import { jarvisSound } from '../utils/jarvisSoundSystem';

interface Props {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Navbar: React.FC<Props> = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, profile } = useAuth();
  const { assistantState } = useSocket();
  const navigate = useNavigate();

  const handleActivateJarvis = () => {
    jarvisSound.playWakeup();
    navigate('/command-center');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/10 bg-jarvis-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-cyan-400 border border-slate-700/60"
            title="Toggle Menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Adhii Jarvis
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Think. Speak. Act.
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Assistant State Indicator & Command Center Trigger */}
        <div className="hidden md:flex items-center gap-3">
          <AssistantStateIndicator state={assistantState} size="md" />
          <Link
            to="/command-center"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:bg-cyan-900 transition"
            title="Launch Full Command Center HUD"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
            <span>COMMAND CENTER</span>
          </Link>
          <button
            onClick={handleActivateJarvis}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-95 border border-yellow-300 group cursor-pointer"
            title="Launch Fullscreen Jarvis Command Center HUD"
          >
            <Flame className="h-4 w-4 fill-current text-slate-950 group-hover:scale-110 transition-transform" />
            <span className="tracking-wider uppercase font-mono">⚡ ACTIVATE JARVIS</span>
          </button>
        </div>

        {/* Right: Notification bell & User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleActivateJarvis}
            className="md:hidden p-2 rounded-xl bg-amber-500 text-slate-950 font-bold border border-yellow-300 shadow-md shadow-amber-500/30 cursor-pointer"
            title="Activate Jarvis Command Center"
          >
            <Flame className="h-4 w-4 fill-current" />
          </button>
          <div className="hidden sm:block md:hidden">
            <AssistantStateIndicator state={assistantState} size="sm" />
          </div>

          <NotificationBell />

          <Link
            to="/profile"
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/50 transition-all duration-200"
          >
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="text-xs font-medium hidden sm:inline max-w-[100px] truncate">
              {profile?.preferred_name || user?.preferred_name || 'Adhi'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};
