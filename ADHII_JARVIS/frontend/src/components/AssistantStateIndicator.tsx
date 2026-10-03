import React from 'react';
import { AssistantState } from '../context/SocketContext';
import { Sparkles, Mic, Cpu, Volume2, AlertCircle, Circle } from 'lucide-react';

interface Props {
  state: AssistantState;
  size?: 'sm' | 'md' | 'lg';
}

export const AssistantStateIndicator: React.FC<Props> = ({ state, size = 'md' }) => {
  const configs = {
    IDLE: {
      color: 'text-slate-400',
      border: 'border-slate-700/60',
      bg: 'bg-slate-800/40',
      ring: '',
      icon: Circle,
      label: 'Jarvis Ready',
    },
    LISTENING: {
      color: 'text-rose-400',
      border: 'border-rose-500/50',
      bg: 'bg-rose-500/10',
      ring: 'animate-ping ring-2 ring-rose-500/40',
      icon: Mic,
      label: 'Listening...',
    },
    PROCESSING: {
      color: 'text-amber-400',
      border: 'border-amber-500/50',
      bg: 'bg-amber-500/10',
      ring: 'animate-pulse ring-2 ring-amber-400/40',
      icon: Cpu,
      label: 'Processing...',
    },
    THINKING: {
      color: 'text-cyan-400',
      border: 'border-cyan-500/50',
      bg: 'bg-cyan-500/10',
      ring: 'animate-pulse ring-2 ring-cyan-400/50',
      icon: Sparkles,
      label: 'Thinking...',
    },
    SPEAKING: {
      color: 'text-indigo-400',
      border: 'border-indigo-500/50',
      bg: 'bg-indigo-500/10',
      ring: 'animate-pulse ring-2 ring-indigo-400/60',
      icon: Volume2,
      label: 'Speaking...',
    },
    ERROR: {
      color: 'text-red-400',
      border: 'border-red-500/50',
      bg: 'bg-red-500/10',
      ring: 'ring-2 ring-red-500/40',
      icon: AlertCircle,
      label: 'Attention Needed',
    },
  };

  const current = configs[state] || configs.IDLE;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2.5',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all duration-300 ${current.bg} ${current.border} ${current.color} ${sizeClasses[size]}`}
    >
      <span className={`relative flex h-2.5 w-2.5 items-center justify-center`}>
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ring} ${current.color.replace(
            'text-',
            'bg-'
          )}`}
        ></span>
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${current.color.replace('text-', 'bg-')}`}
        ></span>
      </span>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium tracking-wide uppercase text-[11px]">{current.label}</span>
    </div>
  );
};
