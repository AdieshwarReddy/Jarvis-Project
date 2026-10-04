import React from 'react';

interface Props {
  active: boolean;
  state: string;
  color?: 'gold' | 'cyan';
}

export const VoiceWaveform: React.FC<Props> = ({ active, state, color = 'gold' }) => {
  const bars = [40, 75, 50, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 70, 35];

  const getBarColor = () => {
    if (!active) return 'bg-slate-700/60';
    if (color === 'gold') {
      return state === 'SPEAKING'
        ? 'bg-gradient-to-t from-amber-600 via-yellow-400 to-yellow-200 shadow-sm shadow-yellow-400/50'
        : 'bg-gradient-to-t from-yellow-500 via-amber-400 to-yellow-300 animate-pulse shadow-sm shadow-amber-400/50';
    }
    return state === 'SPEAKING'
      ? 'bg-gradient-to-t from-indigo-500 via-purple-400 to-pink-400'
      : 'bg-gradient-to-t from-cyan-500 via-sky-400 to-blue-300 animate-pulse';
  };

  return (
    <div
      className={`flex items-center justify-center gap-1.5 h-12 px-4 py-2 bg-jarvis-card/80 backdrop-blur-md rounded-2xl border ${
        color === 'gold' ? 'border-amber-500/30 shadow-lg shadow-amber-500/10' : 'border-cyan-500/20'
      }`}
    >
      {bars.map((height, i) => {
        const duration = 0.6 + (i % 5) * 0.15;
        const delay = (i * 0.08).toFixed(2);
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${getBarColor()}`}
            style={{
              height: active ? `${height}%` : '20%',
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};
