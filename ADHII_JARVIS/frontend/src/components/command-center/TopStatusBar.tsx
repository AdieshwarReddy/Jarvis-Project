import React from 'react';
import {
  Radio,
  Maximize2,
  Minimize2,
  Bell,
  Settings,
  User,
  Mic,
  Volume2,
  VolumeX,
  Disc3,
  Server,
  Cpu,
  Database,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { AssistantState } from './types';

interface TopStatusBarProps {
  desktopConnected: boolean;
  dbConnected: boolean;
  aiState: AssistantState;
  voiceEnabled: boolean;
  spotifyConnected: boolean;
  onToggleVoice: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  notificationCount?: number;
  userName?: string;
  ambienceEnabled?: boolean;
  onToggleAmbience?: () => void;
  onExitWorkspace?: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  desktopConnected,
  dbConnected,
  aiState,
  voiceEnabled,
  spotifyConnected,
  onToggleVoice,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onOpenNotifications,
  notificationCount = 0,
  userName = 'Adhi',
  ambienceEnabled = false,
  onToggleAmbience,
  onExitWorkspace,
}) => {
  return (
    <header className="h-[64px] w-full px-4 sm:px-6 flex items-center justify-between border-b border-cyan-500/20 bg-[#070d18]/90 backdrop-blur-xl relative z-30 select-none">
      {/* LEFT: Branding & Main Subtitle */}
      <div
        onClick={onExitWorkspace}
        className="flex items-center gap-3.5 cursor-pointer group"
        title="Click to return to Workspace"
      >
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] group cursor-pointer">
          <div className="absolute inset-0 rounded-xl bg-cyan-400/10 animate-ping opacity-25" />
          <Radio className="w-5 h-5 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black tracking-widest text-white uppercase font-mono">
              ADHII JARVIS
            </span>
            <span className="hidden md:inline-flex text-[9px] px-2 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 font-mono font-medium tracking-wider">
              MK-COMMAND
            </span>
          </div>
          <span className="text-[10px] text-cyan-400/80 font-mono tracking-wider">
            PERSONAL AI WORKSPACE
          </span>
        </div>
      </div>

      {/* CENTER: Real Status Indicators (Desktop, DB, AI, Voice, Spotify) */}
      <div className="hidden lg:flex items-center gap-2.5 text-[11px] font-mono">
        {/* Desktop Agent */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            desktopConnected
              ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
              : 'border-slate-800 bg-slate-900/60 text-slate-500'
          }`}
          title={desktopConnected ? 'Authenticated Desktop Companion online' : 'Desktop Companion disconnected'}
        >
          <Server className={`w-3.5 h-3.5 ${desktopConnected ? 'text-cyan-400' : 'text-slate-600'}`} />
          <span className="text-slate-400 text-[10px]">AGENT:</span>
          <span className="font-bold">{desktopConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              desktopConnected ? 'bg-cyan-400 animate-pulse shadow-[0_0_6px_#06b6d4]' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* Database */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            dbConnected
              ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
              : 'border-rose-900/40 bg-rose-950/30 text-rose-400'
          }`}
          title="Supabase PostgreSQL persistent memory"
        >
          <Database className={`w-3.5 h-3.5 ${dbConnected ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="text-slate-400 text-[10px]">DB:</span>
          <span className="font-bold">{dbConnected ? 'CONNECTED' : 'OFFLINE'}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              dbConnected ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* AI State */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            aiState === 'ERROR'
              ? 'border-rose-500/50 bg-rose-950/50 text-rose-300'
              : aiState === 'THINKING' || aiState === 'TRANSCRIBING' || aiState === 'EXECUTING'
              ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 animate-pulse'
              : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400 text-[10px]">AI:</span>
          <span className="font-bold">
            {aiState === 'THINKING'
              ? 'THINKING'
              : aiState === 'EXECUTING'
              ? 'EXECUTING'
              : aiState === 'TRANSCRIBING'
              ? 'TRANSCRIBING'
              : aiState === 'SPEAKING'
              ? 'SPEAKING'
              : aiState === 'ERROR'
              ? 'ERROR'
              : 'READY'}
          </span>
        </div>

        {/* Voice Toggle */}
        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            voiceEnabled
              ? 'border-cyan-400/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40'
              : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
          }`}
          title={voiceEnabled ? 'Jarvis audio replies are active' : 'Audio output muted'}
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          <span className="text-slate-400 text-[10px]">VOICE:</span>
          <span className="font-bold">{voiceEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Ambient Arc Reactor Hum Toggle */}
        <button
          onClick={onToggleAmbience}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            ambienceEnabled
              ? 'border-amber-400/50 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
          }`}
          title={ambienceEnabled ? 'Arc Reactor background hum is active' : 'Click to enable authentic Arc Reactor background hum'}
        >
          <Zap className={`w-3.5 h-3.5 ${ambienceEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-slate-400 text-[10px]">AMBIENCE:</span>
          <span className="font-bold">{ambienceEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Spotify State */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            spotifyConnected
              ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'border-slate-800 bg-slate-900/60 text-slate-500'
          }`}
          title={spotifyConnected ? 'Spotify API connected' : 'Spotify disconnected'}
        >
          <Disc3 className={`w-3.5 h-3.5 ${spotifyConnected ? 'text-emerald-400 animate-spin' : 'text-slate-600'}`} />
          <span className="text-slate-400 text-[10px]">SPOTIFY:</span>
          <span className="font-bold">{spotifyConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
        </div>
      </div>

      {/* RIGHT: Notifications, Profile, Settings, Fullscreen */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
          title="System Notifications"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono flex items-center justify-center font-bold animate-pulse">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
          title="Command Center Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen HUD'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Exit HUD to Workspace */}
        {onExitWorkspace && (
          <button
            onClick={onExitWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all cursor-pointer group"
            title="Exit HUD and Return to Workspace (Esc)"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="tracking-wider">WORKSPACE</span>
          </button>
        )}

        {/* User profile avatar badge */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-mono font-semibold text-slate-200">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
};
