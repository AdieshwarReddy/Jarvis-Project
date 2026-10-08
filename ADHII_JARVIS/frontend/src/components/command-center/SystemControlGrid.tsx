import React, { useState } from 'react';
import {
  Code,
  Globe,
  Calculator,
  Disc3,
  Tv,
  FolderOpen,
  VolumeX,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';

interface SystemControlGridProps {
  desktopConnected: boolean;
  onExecuteCommand: (action: string, appName?: string) => Promise<void>;
  onRequestLockConfirmation: () => void;
  feedbackMessage?: string | null;
}

export const SystemControlGrid: React.FC<SystemControlGridProps> = ({
  desktopConnected,
  onExecuteCommand,
  onRequestLockConfirmation,
  feedbackMessage,
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = async (actionKey: string, appName?: string) => {
    if (actionKey === 'lock') {
      onRequestLockConfirmation();
      return;
    }

    setActiveAction(actionKey);
    try {
      await onExecuteCommand(actionKey, appName);
    } finally {
      setTimeout(() => setActiveAction(null), 1200);
    }
  };

  const actionButtons = [
    {
      id: 'vscode',
      label: 'VS Code',
      icon: Code,
      action: 'open',
      app: 'vscode',
      color: 'hover:border-cyan-400 hover:text-cyan-300',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      action: 'open',
      app: 'whatsapp',
      color: 'hover:border-emerald-400 hover:text-emerald-300',
    },
    {
      id: 'chrome',
      label: 'Chrome',
      icon: Globe,
      action: 'open',
      app: 'chrome',
      color: 'hover:border-blue-400 hover:text-blue-300',
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      action: 'open',
      app: 'calculator',
      color: 'hover:border-purple-400 hover:text-purple-300',
    },
    {
      id: 'youtube',
      label: 'YouTube',
      icon: Tv,
      action: 'open',
      app: 'youtube',
      color: 'hover:border-rose-400 hover:text-rose-300',
    },
    {
      id: 'spotify',
      label: 'Spotify',
      icon: Disc3,
      action: 'open',
      app: 'spotify',
      color: 'hover:border-green-400 hover:text-green-300',
    },
    {
      id: 'files',
      label: 'Files',
      icon: FolderOpen,
      action: 'open',
      app: 'file_explorer',
      color: 'hover:border-amber-400 hover:text-amber-300',
    },
    {
      id: 'mute',
      label: 'Mute Audio',
      icon: VolumeX,
      action: 'mute',
      color: 'hover:border-cyan-400 hover:text-cyan-300',
    },
    {
      id: 'lock',
      label: 'Lock PC',
      icon: Lock,
      action: 'lock',
      isDestructive: true,
      color: 'hover:border-red-500 hover:text-red-300',
    },
  ];

  return (
    <div className="w-full p-4 rounded-2xl bg-[#09111f]/80 border border-cyan-500/20 shadow-md flex flex-col gap-3 select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white tracking-wider">
          <Code className="w-4 h-4 text-cyan-400" />
          <span>SYSTEM CONTROL</span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            desktopConnected
              ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
              : 'border-slate-800 bg-slate-900/60 text-slate-500'
          }`}
        >
          WIN-EXEC
        </span>
      </div>

      {/* DISCONNECTED WARNING IF AGENT OFFLINE */}
      {!desktopConnected && (
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>DESKTOP AGENT OFFLINE • Local computer controls disabled.</span>
        </div>
      )}

      {/* ACTION GRID */}
      <div className="grid grid-cols-2 gap-2.5">
        {actionButtons.map((btn) => {
          const Icon = btn.icon;
          const isLoading = activeAction === btn.id;

          return (
            <button
              key={btn.id}
              onClick={() => handleAction(btn.action, btn.app)}
              disabled={!desktopConnected || isLoading}
              className={`relative flex items-center gap-2.5 p-3 rounded-xl border text-xs font-mono font-semibold transition-all duration-200 cursor-pointer text-left ${
                !desktopConnected
                  ? 'border-slate-800/80 bg-slate-950/40 text-slate-600 opacity-60 cursor-not-allowed'
                  : btn.isDestructive
                  ? 'border-red-900/40 bg-red-950/20 text-red-300 hover:bg-red-950/40 hover:border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                  : 'border-cyan-900/40 bg-slate-950/60 text-slate-200 hover:bg-cyan-950/30 ' + btn.color
              }`}
            >
              <div className="flex-shrink-0">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="truncate">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMessage && (
        <div className="mt-1 p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-[11px] font-mono text-cyan-200 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{feedbackMessage}</span>
        </div>
      )}
    </div>
  );
};
