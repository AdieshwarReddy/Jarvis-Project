import React, { useState } from 'react';
import {
  Disc3,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ExternalLink,
  Volume2,
  Music,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SpotifyTrackState } from './types';

interface SpotifyCardProps {
  trackState: SpotifyTrackState | null;
  onPlay: () => Promise<void>;
  onPause: () => Promise<void>;
  onNext: () => Promise<void>;
  onPrevious: () => Promise<void>;
  onOpenAppFallback: () => void;
  onConnectSpotify?: () => void;
}

export const SpotifyCard: React.FC<SpotifyCardProps> = ({
  trackState,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onOpenAppFallback,
  onConnectSpotify,
}) => {
  const [isPlayingLocal, setIsPlayingLocal] = useState(trackState?.playing || false);

  const isConnected = trackState?.connected ?? false;
  const isPlaying = trackState?.playing ?? isPlayingLocal;

  const handleTogglePlay = async () => {
    if (isPlaying) {
      setIsPlayingLocal(false);
      await onPause();
    } else {
      setIsPlayingLocal(true);
      await onPlay();
    }
  };

  return (
    <div className="w-full p-4 rounded-2xl bg-[#09111f]/80 border border-cyan-500/20 shadow-md flex flex-col gap-3 select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white tracking-wider">
          <Disc3 className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-slate-500'}`} />
          <span>SPOTIFY PLAYBACK</span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isConnected
              ? 'border-green-500/40 bg-green-950/40 text-green-300'
              : 'border-slate-800 bg-slate-900/60 text-slate-500'
          }`}
        >
          {isConnected ? 'ACTIVE' : 'DISCONNECTED'}
        </span>
      </div>

      {isConnected && trackState?.track ? (
        <div className="flex flex-col gap-3">
          {/* TRACK INFO & ARTWORK */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {trackState.album_art ? (
                <img
                  src={trackState.album_art}
                  alt={trackState.track}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <div className="min-w-0 flex-1 font-mono">
              <h4 className="text-xs font-bold text-white truncate drop-shadow">
                {trackState.track}
              </h4>
              <p className="text-[11px] text-cyan-300/80 truncate">
                {trackState.artist || 'Unknown Artist'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {trackState.album || 'Adhii Jarvis Audio Stream'}
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          {trackState.duration_ms && trackState.progress_ms !== undefined && (
            <div className="w-full">
              <div className="h-1.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (trackState.progress_ms / trackState.duration_ms) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* PLAYBACK CONTROLS */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <button
              onClick={onPrevious}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handleTogglePlay}
              className="p-3 rounded-full bg-green-500 text-slate-950 font-bold hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <button
              onClick={onNext}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500/40 transition"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* DISCONNECTED / IDLE STATE */
        <div className="py-2 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-xs font-mono text-slate-400">
            {isConnected
              ? 'No track currently playing.'
              : 'Connect Spotify to control playback.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {onConnectSpotify && !isConnected && (
              <button
                onClick={onConnectSpotify}
                className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-slate-950 font-mono text-xs font-bold transition"
              >
                CONNECT SPOTIFY
              </button>
            )}
            <button
              onClick={onOpenAppFallback}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950 font-mono text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>OPEN IN SPOTIFY</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
