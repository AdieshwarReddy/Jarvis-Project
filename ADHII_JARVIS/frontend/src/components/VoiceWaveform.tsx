import React from 'react';

interface Props {
  active: boolean;
  state: string;
}

export const VoiceWaveform: React.FC<Props> = ({ active, state }) => {
  const bars = [40, 75, 50, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 70, 35];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 px-4 py-2 bg-jarvis-card/80 backdrop-blur-md rounded-2xl border border-cyan-500/20">
      {bars.map((height, i) => {
        const duration = 0.6 + (i % 5) * 0.15;
        const delay = (i * 0.08).toFixed(2);
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              active
                ? state === 'SPEAKING'
                  ? 'bg-gradient-to-t from-indigo-500 via-purple-400 to-pink-400'
                  : 'bg-gradient-to-t from-cyan-500 via-sky-400 to-blue-300 animate-pulse'
                : 'bg-slate-700/60'
            }`}
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
