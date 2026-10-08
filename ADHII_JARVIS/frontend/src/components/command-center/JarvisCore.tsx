import React, { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  AlertCircle,
  Cpu,
  RotateCw,
  Sparkles,
  Zap,
  Radio,
} from 'lucide-react';
import { AssistantState } from './types';
import { jarvisSound } from '../../utils/jarvisSoundSystem';

interface JarvisCoreProps {
  state: AssistantState;
  isRecording: boolean;
  onToggleRecording: () => void;
  voiceTranscript: string;
  interimTranscript?: string;
  voiceReplyEnabled: boolean;
  onToggleVoiceReply: () => void;
  onStopSpeech: () => void;
  currentToolName?: string;
  ambienceEnabled?: boolean;
  onToggleAmbience?: () => void;
}

export const JarvisCore: React.FC<JarvisCoreProps> = ({
  state,
  isRecording,
  onToggleRecording,
  voiceTranscript,
  interimTranscript,
  voiceReplyEnabled,
  onToggleVoiceReply,
  onStopSpeech,
  currentToolName,
  ambienceEnabled = false,
  onToggleAmbience,
}) => {
  // Waveform visualization bars
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>([
    25, 45, 70, 30, 85, 60, 40, 95, 75, 50, 30, 65, 80, 45, 20,
  ]);
  const [localAmbience, setLocalAmbience] = useState<boolean>(jarvisSound.isAmbienceOn());

  useEffect(() => {
    if (state === 'LISTENING' || state === 'SPEAKING' || isRecording) {
      const interval = setInterval(() => {
        setWaveAmplitudes(
          Array.from({ length: 15 }, () => Math.floor(Math.random() * 75) + 20)
        );
      }, 100);
      return () => clearInterval(interval);
    } else {
      setWaveAmplitudes([15, 20, 30, 25, 35, 25, 30, 40, 30, 25, 35, 25, 30, 20, 15]);
    }
  }, [state, isRecording]);

  // Determine state colors and glow
  const isListening = isRecording || state === 'LISTENING';
  const isSpeaking = state === 'SPEAKING';
  const isThinking = state === 'THINKING';
  const isTranscribing = state === 'TRANSCRIBING';
  const isExecuting = state === 'EXECUTING';
  const isError = state === 'ERROR';

  // Overall "Jarvis is working/active" condition
  const isWorking = isListening || isThinking || isSpeaking || isTranscribing || isExecuting;

  // Duck ambient background sound when Jarvis speaks
  useEffect(() => {
    jarvisSound.setDucking(isSpeaking);
  }, [isSpeaking]);

  const handleCoreTap = () => {
    jarvisSound.playWakeup();
    onToggleRecording();
  };

  const handleToggleAmbienceClick = () => {
    jarvisSound.playChirp();
    const active = jarvisSound.toggleAmbience();
    setLocalAmbience(active);
    if (onToggleAmbience) {
      onToggleAmbience();
    }
  };

  const activeTranscript = interimTranscript || voiceTranscript;

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full min-h-[490px] p-4 select-none">
      {/* Background Holographic Glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] pointer-events-none transition-all duration-700 ${
          isError
            ? 'w-[420px] h-[420px] bg-rose-600/25'
            : isListening
            ? 'w-[440px] h-[440px] bg-red-500/30 animate-pulse'
            : isSpeaking
            ? 'w-[460px] h-[460px] bg-cyan-400/35 animate-pulse'
            : isThinking || isExecuting
            ? 'w-[430px] h-[430px] bg-amber-500/25'
            : 'w-[360px] h-[360px] bg-cyan-500/15'
        }`}
      />

      {/* TOP STATUS PILL & AMBIENCE TOGGLE */}
      <div className="relative z-10 mb-2 flex items-center gap-3">
        {/* Status Pill */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider transition-all duration-300 ${
            isError
              ? 'border-rose-500/60 bg-rose-950/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
              : isListening
              ? 'border-red-500/80 bg-red-950/70 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse'
              : isTranscribing
              ? 'border-cyan-400/80 bg-cyan-950/70 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              : isThinking
              ? 'border-amber-400/80 bg-amber-950/70 text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.4)] animate-pulse'
              : isExecuting
              ? 'border-violet-500/80 bg-violet-950/70 text-violet-200 shadow-[0_0_25px_rgba(139,92,246,0.4)] animate-pulse'
              : isSpeaking
              ? 'border-cyan-400/90 bg-cyan-950/80 text-cyan-200 shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-pulse'
              : 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300/90'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isError
              ? 'SYSTEM ALERT • TAP MIC OR RETRY'
              : isListening
              ? 'MARK-85 LISTENING • CAPTURING VOICE INPUT'
              : isTranscribing
              ? 'TRANSCRIBING NEURAL AUDIO SIGNAL...'
              : isThinking
              ? 'JARVIS NEURAL CORE THINKING...'
              : isExecuting
              ? `EXECUTING TOOL: ${currentToolName || 'SYSTEM_ACTION'}`
              : isSpeaking
              ? 'JARVIS VOCAL SYNTHESIZER ONLINE'
              : 'MARK-COMMAND CORE STANDBY • READY'}
          </span>
        </div>

        {/* Special Background Sound (Arc Reactor Ambience) Button */}
        <button
          type="button"
          onClick={handleToggleAmbienceClick}
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-mono font-bold transition-all cursor-pointer ${
            localAmbience
              ? 'border-amber-400/70 bg-amber-950/60 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
          }`}
          title={localAmbience ? 'Arc Reactor background hum is playing' : 'Click to turn ON special Arc Reactor background sound'}
        >
          <Zap className={`w-3 h-3 ${localAmbience ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          <span>AMBIENCE: {localAmbience ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* CENTER: IRON MAN WIREFRAME SILHOUETTE & ARC REACTOR BUTTON */}
      <div className="relative flex items-center justify-center my-auto w-full max-w-[430px] aspect-square">
        {/* IRON MAN WIREFRAME SVG WITH DYNAMIC HIGH-ENERGY GLOW HIGHLIGHT */}
        <svg
          viewBox="0 0 1000 1000"
          className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-700 ${
            isWorking
              ? 'opacity-100 scale-[1.03] drop-shadow-[0_0_30px_rgba(0,240,255,0.7)]'
              : 'opacity-55 hover:opacity-85 drop-shadow-[0_0_12px_rgba(0,240,255,0.3)]'
          }`}
          fill="none"
        >
          <defs>
            {/* Super Glow Filter */}
            <filter id="ironManSuperGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feGaussianBlur stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Golden Armor Glow Filter */}
            <filter id="starkGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="goldBlur" />
              <feMerge>
                <feMergeNode in="goldBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Reactor Radial Glow */}
            <radialGradient id="jarvisReactorGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="30%" stopColor="#00f0ff" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Golden Armor Fill Gradient */}
            <linearGradient id="starkGoldPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={isWorking ? "0.3" : "0.08"} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={isWorking ? "0.15" : "0.03"} />
            </linearGradient>
          </defs>

          {/* Holographic HUD Circular Measurement Rings around helmet */}
          <circle
            cx="500"
            cy="460"
            r="380"
            stroke={isWorking ? "#00f0ff" : "#0284c7"}
            strokeWidth="1.2"
            strokeDasharray="8 12"
            strokeOpacity={isWorking ? "0.8" : "0.3"}
            className={isWorking ? "animate-[spin_40s_linear_infinite]" : ""}
          />
          <circle
            cx="500"
            cy="460"
            r="440"
            stroke={isWorking ? "#f59e0b" : "#0369a1"}
            strokeWidth="0.8"
            strokeDasharray="4 24"
            strokeOpacity={isWorking ? "0.7" : "0.2"}
            className={isWorking ? "animate-[spin_60s_linear_infinite_reverse]" : ""}
          />

          {/* ============================================================ */}
          {/* IRON MAN HELMET ARMOR STRUCTURE (HIGHLIGHTED ON WORK) */}
          {/* ============================================================ */}

          {/* Outer Cranium & Helmet Silhouette */}
          <path
            d="M 500,90 C 360,90 295,165 275,260 C 255,355 265,450 320,530 C 365,595 425,635 500,655 C 575,635 635,595 680,530 C 735,450 745,355 725,260 C 705,165 640,90 500,90 Z"
            stroke={isWorking ? (isListening ? "#ef4444" : isThinking ? "#fbbf24" : "#00f0ff") : "#00f0ff"}
            strokeWidth={isWorking ? "3.5" : "2"}
            strokeOpacity={isWorking ? "1" : "0.6"}
            filter={isWorking ? "url(#ironManSuperGlow)" : undefined}
          />

          {/* Forehead Stark Armor Plates */}
          <path
            d="M 350,180 L 500,215 L 650,180"
            stroke={isWorking ? "#38bdf8" : "#0284c7"}
            strokeWidth={isWorking ? "3" : "2"}
            strokeOpacity={isWorking ? "0.95" : "0.5"}
          />
          <path
            d="M 420,120 L 500,145 L 580,120"
            stroke={isWorking ? "#fbbf24" : "#0369a1"}
            strokeWidth="2"
            strokeOpacity={isWorking ? "0.9" : "0.4"}
          />

          {/* Golden Faceplate Cheek & Brow Contours */}
          <polygon
            points="340,270 410,240 430,340 350,380"
            fill="url(#starkGoldPlate)"
            stroke={isWorking ? "#fbbf24" : "#f59e0b"}
            strokeWidth={isWorking ? "2.5" : "1.5"}
            strokeOpacity={isWorking ? "1" : "0.6"}
            filter={isWorking ? "url(#starkGoldGlow)" : undefined}
          />
          <polygon
            points="660,270 590,240 570,340 650,380"
            fill="url(#starkGoldPlate)"
            stroke={isWorking ? "#fbbf24" : "#f59e0b"}
            strokeWidth={isWorking ? "2.5" : "1.5"}
            strokeOpacity={isWorking ? "1" : "0.6"}
            filter={isWorking ? "url(#starkGoldGlow)" : undefined}
          />

          {/* Central Nose Bridge & Face Plate Ridge */}
          <path
            d="M 500,215 L 500,380"
            stroke={isWorking ? "#38bdf8" : "#0284c7"}
            strokeWidth="2"
            strokeOpacity={isWorking ? "0.8" : "0.4"}
          />
          <path
            d="M 460,330 L 500,355 L 540,330"
            stroke={isWorking ? "#fbbf24" : "#0284c7"}
            strokeWidth="2"
            strokeOpacity={isWorking ? "0.9" : "0.5"}
          />

          {/* ============================================================ */}
          {/* THE ICONIC GLOWING VISOR EYES (BLINDING HIGHLIGHT WHEN WORKING) */}
          {/* ============================================================ */}
          {/* Left Eye */}
          <g filter={isWorking ? "url(#ironManSuperGlow)" : undefined}>
            <polygon
              points="370,240 460,252 455,272 365,260"
              fill={isWorking ? "#ffffff" : "#a5f3fc"}
              fillOpacity={isWorking ? "1" : "0.8"}
              stroke={isWorking ? "#00f0ff" : "#38bdf8"}
              strokeWidth={isWorking ? "3" : "1.5"}
            />
            {/* Extra internal white eye beam when working */}
            {isWorking && (
              <line
                x1="375"
                y1="250"
                x2="455"
                y2="262"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* Right Eye */}
          <g filter={isWorking ? "url(#ironManSuperGlow)" : undefined}>
            <polygon
              points="630,240 540,252 545,272 635,260"
              fill={isWorking ? "#ffffff" : "#a5f3fc"}
              fillOpacity={isWorking ? "1" : "0.8"}
              stroke={isWorking ? "#00f0ff" : "#38bdf8"}
              strokeWidth={isWorking ? "3" : "1.5"}
            />
            {/* Extra internal white eye beam when working */}
            {isWorking && (
              <line
                x1="625"
                y1="250"
                x2="545"
                y2="262"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* Red/Crimson High-Power Collar Conduits */}
          <g
            stroke={isWorking ? "#ef4444" : "#f87171"}
            strokeWidth={isWorking ? "3.5" : "2"}
            strokeLinecap="round"
            opacity={isWorking ? "1" : "0.75"}
          >
            <path d="M 445,345 L 430,395" />
            <path d="M 460,352 L 450,402" />
            <path d="M 478,358 L 472,408" />
            <path d="M 522,358 L 528,408" />
            <path d="M 540,352 L 550,402" />
            <path d="M 555,345 L 570,395" />
          </g>

          {/* Angular Jaw & Chin Plates */}
          <path
            d="M 370,470 L 430,550 L 500,580 L 570,550 L 630,470"
            stroke={isWorking ? "#fbbf24" : "#0284c7"}
            strokeWidth={isWorking ? "2.5" : "1.5"}
            strokeOpacity={isWorking ? "0.9" : "0.5"}
          />
          <path
            d="M 440,585 L 500,610 L 560,585"
            stroke={isWorking ? "#38bdf8" : "#0369a1"}
            strokeWidth="2"
            strokeOpacity={isWorking ? "0.9" : "0.4"}
          />

          {/* Shoulders & Clavicle Armor Plates */}
          <path
            d="M 430,395 L 310,430 L 200,480 L 160,600"
            stroke={isWorking ? "#00f0ff" : "#0284c7"}
            strokeWidth={isWorking ? "2.5" : "1.8"}
            strokeOpacity={isWorking ? "0.85" : "0.5"}
          />
          <path
            d="M 570,395 L 690,430 L 800,480 L 840,600"
            stroke={isWorking ? "#00f0ff" : "#0284c7"}
            strokeWidth={isWorking ? "2.5" : "1.8"}
            strokeOpacity={isWorking ? "0.85" : "0.5"}
          />
          <path
            d="M 340,420 L 420,490 L 500,520 L 580,490 L 660,420"
            stroke={isWorking ? "#38bdf8" : "#0369a1"}
            strokeWidth={isWorking ? "2.5" : "1.5"}
            strokeOpacity={isWorking ? "0.85" : "0.5"}
          />

          {/* Holographic Vertical Laser Scanner Beam (Active when thinking or speaking) */}
          {(isThinking || isSpeaking) && (
            <line
              x1="280"
              y1="255"
              x2="720"
              y2="255"
              stroke="#00f0ff"
              strokeWidth="2.5"
              filter="url(#ironManSuperGlow)"
              className="animate-pulse"
            />
          )}

          {/* Active Stark HUD Tag Overlay */}
          <text
            x="500"
            y="695"
            textAnchor="middle"
            fill={isWorking ? "#00f0ff" : "#0284c7"}
            fontSize="18"
            fontFamily="monospace"
            letterSpacing="6"
            opacity={isWorking ? "0.9" : "0.4"}
            filter={isWorking ? "url(#ironManSuperGlow)" : undefined}
          >
            {isWorking ? "// STARK MK-85 ACTIVE //" : "// JARVIS SYSTEM STANDBY //"}
          </text>
        </svg>

        {/* Dynamic Arc Reactor Rotating Rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer Degree Marks Ring */}
          <div
            className={`w-60 h-60 rounded-full border absolute transition-all duration-700 ${
              isListening
                ? 'border-red-500/70 scale-105 animate-pulse'
                : isSpeaking
                ? 'border-cyan-400/80 scale-105 animate-[spin_12s_linear_infinite]'
                : isThinking
                ? 'border-amber-400/80 animate-[spin_8s_linear_infinite]'
                : 'border-cyan-500/30'
            }`}
          >
            {/* Cardinal Degree Labels */}
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/90 font-bold">▲ 000° ARC</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/90 font-bold">▼ 180° PWR</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/90 font-bold">◄ 270°</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/90 font-bold">090° ►</span>
          </div>

          {/* Processing / Transcribing Rotating Dashed Ring */}
          <div
            className={`w-48 h-48 rounded-full border-2 border-dashed absolute transition-all ${
              isError
                ? 'border-rose-500/80'
                : isListening
                ? 'border-red-400/80 animate-[spin_4s_linear_infinite]'
                : isSpeaking
                ? 'border-cyan-300 animate-[spin_4s_linear_infinite]'
                : isTranscribing || isThinking
                ? 'border-amber-400 animate-[spin_3s_linear_infinite]'
                : 'border-cyan-500/40 animate-[spin_25s_linear_infinite]'
            }`}
          />

          {/* CENTRAL INTERACTIVE VOICE BUTTON */}
          <button
            onClick={handleCoreTap}
            aria-label={isListening ? 'Stop Listening' : 'Tap to Speak'}
            className={`relative flex flex-col items-center justify-center w-36 h-36 rounded-full cursor-pointer transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 z-20 ${
              isError
                ? 'bg-gradient-to-tr from-rose-950 via-rose-900 to-rose-700 shadow-[0_0_45px_rgba(244,63,94,0.7)] border-2 border-rose-400'
                : isListening
                ? 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-[0_0_55px_rgba(239,68,68,0.8)] border-2 border-white scale-105 animate-pulse'
                : isSpeaking
                ? 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 shadow-[0_0_55px_rgba(6,182,212,0.8)] border-2 border-white scale-105 animate-pulse'
                : isThinking || isExecuting
                ? 'bg-gradient-to-tr from-amber-950 via-orange-900 to-amber-700 shadow-[0_0_45px_rgba(245,158,11,0.7)] border-2 border-amber-400 animate-pulse'
                : 'bg-gradient-to-tr from-cyan-950 via-slate-900 to-cyan-900 shadow-[0_0_35px_rgba(6,182,212,0.5)] border-2 border-cyan-400/80 hover:border-cyan-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.8)]'
            }`}
          >
            {/* Core Icon */}
            <div className="mb-1 text-white">
              {isError ? (
                <AlertCircle className="w-8 h-8 text-rose-200 animate-bounce" />
              ) : isThinking ? (
                <Cpu className="w-8 h-8 text-amber-200 animate-spin" />
              ) : isTranscribing ? (
                <RotateCw className="w-8 h-8 text-cyan-200 animate-spin" />
              ) : (
                <Mic className={`w-8 h-8 ${isListening ? 'text-white scale-110' : 'text-cyan-300'}`} />
              )}
            </div>

            {/* Core Label */}
            <span className="text-xs font-mono font-black text-white tracking-widest uppercase drop-shadow">
              {isListening
                ? 'LISTENING'
                : isSpeaking
                ? 'SPEAKING'
                : isThinking
                ? 'THINKING'
                : isTranscribing
                ? 'PROCESSING'
                : isError
                ? 'RETRY MIC'
                : 'TAP TO SPEAK'}
            </span>
            <span className="text-[9px] font-mono text-cyan-200/90 tracking-wide mt-0.5">
              {isListening ? 'Pause to send' : isSpeaking ? 'Jarvis Voice' : 'Hands-Free Ready'}
            </span>
          </button>
        </div>
      </div>

      {/* AUDIO-REACTIVE WAVEFORM DISPLAY */}
      <div className="w-full max-w-md h-12 my-2 rounded-xl bg-slate-950/80 border border-cyan-500/25 px-4 flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
        {waveAmplitudes.map((h, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-100 ${
              isListening
                ? 'bg-gradient-to-t from-red-500 to-amber-300 shadow-[0_0_8px_#ef4444]'
                : isSpeaking
                ? 'bg-gradient-to-t from-cyan-400 to-indigo-400 shadow-[0_0_8px_#06b6d4]'
                : 'bg-cyan-500/35'
            }`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* TRANSCRIPT & AUDIO CONTROL DOCK */}
      <div className="w-full max-w-lg flex flex-col items-center">
        {/* Holographic link header */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-cyan-500/90 mb-1 px-2">
          <span>// HOLOGRAPHIC TRANSCEIVER CHANNEL: 142.85 MHz</span>
          <span className="text-emerald-400 font-bold">• ENCRYPTED LINK</span>
        </div>

        {/* Live transcript text */}
        <div className="w-full min-h-[44px] p-2.5 rounded-xl bg-[#09111f]/95 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs font-mono shadow-inner">
          <div className="truncate">
            <span className="text-cyan-400 font-bold mr-2">
              {isListening ? 'INPUT:' : isSpeaking ? 'JARVIS:' : 'TRANSCRIPT:'}
            </span>
            <span className="text-slate-200">
              {activeTranscript ? `"${activeTranscript}"` : 'Standing by for boss vocal command...'}
            </span>
          </div>

          {/* Quick Vocal Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isSpeaking && (
              <button
                onClick={onStopSpeech}
                className="p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 hover:bg-rose-900 transition cursor-pointer"
                title="Stop Jarvis vocal reply"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
            <button
              onClick={onToggleVoiceReply}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                voiceReplyEnabled
                  ? 'bg-cyan-950/80 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
              title={voiceReplyEnabled ? 'Voice output active' : 'Voice output muted'}
            >
              {voiceReplyEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
