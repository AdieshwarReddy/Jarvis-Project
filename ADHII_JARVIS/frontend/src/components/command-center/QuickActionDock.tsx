import React from 'react';
import {
  Zap,
  Code,
  Globe,
  Calculator,
  Disc3,
  Tv,
  HardDrive,
  Lock,
  VolumeX,
  MessageCircle,
  HelpCircle,
  Activity,
} from 'lucide-react';

interface QuickActionDockProps {
  onQuickAction: (commandText: string, appKey?: string) => void;
  desktopConnected: boolean;
}

export const QuickActionDock: React.FC<QuickActionDockProps> = ({
  onQuickAction,
  desktopConnected,
}) => {
  const quickChips = [
    { label: 'Open WhatsApp', icon: MessageCircle, text: 'Open WhatsApp', app: 'whatsapp' },
    { label: 'Open VS Code', icon: Code, text: 'Open VS Code', app: 'vscode' },
    { label: 'System status report', icon: Activity, text: 'Jarvis, give me a full system status report.' },
    { label: 'Open YouTube', icon: Tv, text: 'Open YouTube', app: 'youtube' },
    { label: 'What is our storage capacity?', icon: HardDrive, text: 'What is our storage capacity?' },
    { label: 'Play Spotify', icon: Disc3, text: 'Play music on Spotify', app: 'spotify' },
    { label: 'Open Calculator', icon: Calculator, text: 'Open Calculator', app: 'calculator' },
    { label: 'Lock PC', icon: Lock, text: 'Lock my PC', app: 'lock', isDestructive: true },
  ];

  return (
    <footer className="w-full px-4 py-2.5 bg-[#060b14]/90 border-t border-cyan-500/20 backdrop-blur-md relative z-20 select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
        {quickChips.map((chip, idx) => {
          const Icon = chip.icon;
          return (
            <button
              key={idx}
              onClick={() => onQuickAction(chip.text, chip.app)}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium transition-all duration-200 cursor-pointer shadow-sm ${
                chip.isDestructive
                  ? 'border-red-900/50 bg-red-950/20 text-red-300 hover:border-red-500 hover:bg-red-950/40'
                  : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-950/60 hover:border-cyan-400 hover:text-white'
              }`}
            >
              <Zap className={`w-3 h-3 ${chip.isDestructive ? 'text-red-400' : 'text-cyan-400'}`} />
              <span className="whitespace-nowrap">{chip.label}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};
