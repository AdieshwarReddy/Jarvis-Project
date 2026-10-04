import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Activity,
  Cpu,
  ShieldCheck,
  Radio,
  Flame,
} from 'lucide-react';
import { useSocket, AssistantState } from '../context/SocketContext';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { VoiceWaveform } from './VoiceWaveform';

interface Props {
  conversationId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string, voiceResponse?: boolean) => void;
}

export const AmbientVoiceModal: React.FC<Props> = ({
  conversationId,
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const {
    assistantState,
    currentStreamText,
    isStreaming,
    voiceTranscript,
    stopGeneration,
  } = useSocket();

  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [starkTheme, setStarkTheme] = useState<'gold' | 'cyan'>(() => {
    return (localStorage.getItem('jarvis_theme') as 'gold' | 'cyan') || 'gold';
  });

  const { isRecording, startRecording, stopRecording, interimTranscript } =
    useVoiceRecognition(conversationId);

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = starkTheme === 'gold' ? 'cyan' : 'gold';
    setStarkTheme(nextTheme);
    localStorage.setItem('jarvis_theme', nextTheme);
  };

  const handleQuickCommand = (cmd: string) => {
    onSendMessage(cmd, voiceReplyEnabled);
  };

  // Status text based on state
  const getStatusLabel = (state: AssistantState, recording: boolean) => {
    if (recording) return 'STARK CORE LISTENING • RECEIVING VOCAL INPUT...';
    switch (state) {
      case 'LISTENING':
        return 'MICROPHONE ACTIVE • RECEIVING FREQUENCY';
      case 'THINKING':
      case 'PROCESSING':
        return 'NEURAL RETRIEVAL & TOOL EXECUTION ACTIVE...';
      case 'SPEAKING':
        return 'JARVIS SYNTHESIZING NEURAL SPEECH RESPONSE...';
      case 'ERROR':
        return 'COMMUNICATION INTERRUPTED';
      default:
        return 'ARC REACTOR ONLINE • 100% MAXIMUM POWER • STANDBY';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-2xl text-slate-100 overflow-hidden animate-in fade-in duration-300">
      {/* Background Holographic Glows */}
      <div className="absolute inset-0 pointer-events-none">
        {starkTheme === 'gold' ? (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-amber-500/15 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-yellow-400/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[140px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
          </>
        )}
      </div>

      {/* Top HUD Bar */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              starkTheme === 'gold'
                ? 'bg-amber-500/20 border border-yellow-400/50 text-yellow-300 shadow-amber-500/30'
                : 'bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shadow-cyan-500/20'
            }`}
          >
            {starkTheme === 'gold' ? (
              <Flame className="h-6 w-6 animate-pulse text-yellow-300" />
            ) : (
              <Radio className="h-5 w-5 animate-pulse text-cyan-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider text-white">
                {starkTheme === 'gold' ? 'STARK ARC CORE MK-85' : 'JARVIS AMBIENT CORE'}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest rounded-full border ${
                  starkTheme === 'gold'
                    ? 'bg-amber-500/20 border-yellow-400/40 text-yellow-300'
                    : 'bg-cyan-500/10 border-cyan-400/30 text-cyan-300'
                }`}
              >
                {starkTheme === 'gold' ? 'MAX POWER 100%' : 'HUD v1.0'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {starkTheme === 'gold'
                ? 'Stark Industries Tactile Neural Link • 1.21 GW Arc Output'
                : 'Voice-First Neural Workspace • Real-Time Protocol'}
            </p>
          </div>
        </div>

        {/* Telemetry badges & Theme Switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={handleToggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-300 shadow-md ${
              starkTheme === 'gold'
                ? 'bg-amber-500/20 border-yellow-400/50 text-yellow-300 shadow-amber-500/20 ring-1 ring-yellow-400/30'
                : 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-cyan-500/20'
            }`}
            title="Toggle between Stark Gold Power Core and Cyan Neural Protocol"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{starkTheme === 'gold' ? '🟡 STARK GOLD' : '🔷 CYAN PROTOCOL'}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Cpu className={`h-3.5 w-3.5 ${starkTheme === 'gold' ? 'text-yellow-400' : 'text-cyan-400'}`} />
            <span>LLM: Groq / GPT-OSS</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Tools: Guarded AST</span>
          </div>

          <button
            onClick={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              voiceReplyEnabled
                ? starkTheme === 'gold'
                  ? 'bg-amber-500/20 border-yellow-400/50 text-yellow-300'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
            title="Toggle spoken voice responses"
          >
            {voiceReplyEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Voice: {voiceReplyEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition shadow-lg"
          title="Return to Workspace (ESC)"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Central Holographic Core Reactor */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 text-center my-2">
        {/* Pulsing concentric rings with Stark HUD reticle marks */}
        <div className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96">
          {/* Target Reticle Crosshair lines */}
          <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] ${starkTheme === 'gold' ? 'bg-gradient-to-r from-transparent via-amber-400/40 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent'}`} />
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] ${starkTheme === 'gold' ? 'bg-gradient-to-b from-transparent via-amber-400/40 to-transparent' : 'bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent'}`} />

          {/* Stark Calibration degree indicators */}
          {starkTheme === 'gold' && (
            <>
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-400/80 tracking-widest">▲ 000° ARC</span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-400/80 tracking-widest">▼ 180° PWR</span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-amber-400/80 tracking-widest">◀ 270°</span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-amber-400/80 tracking-widest">090° ▶</span>
            </>
          )}

          {/* Layer 1: Outermost rotating segmented HUD ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-1000 ${
              isRecording
                ? 'border-rose-400/70 animate-[spin_5s_linear_infinite]'
                : assistantState === 'THINKING' || assistantState === 'PROCESSING'
                ? starkTheme === 'gold'
                  ? 'border-yellow-300/80 animate-[spin_3s_linear_infinite]'
                  : 'border-cyan-400/70 animate-[spin_4s_linear_infinite]'
                : assistantState === 'SPEAKING'
                ? starkTheme === 'gold'
                  ? 'border-amber-300 animate-[spin_6s_linear_infinite]'
                  : 'border-cyan-300 animate-[spin_7s_linear_infinite]'
                : starkTheme === 'gold'
                ? 'border-amber-400/60 animate-[spin_18s_linear_infinite]'
                : 'border-cyan-500/30 animate-[spin_20s_linear_infinite]'
            }`}
          />

          {/* Layer 2: Middle counter-rotating ring with notch ticks */}
          <div
            className={`absolute inset-6 rounded-full border transition-all duration-1000 ${
              isRecording
                ? 'border-rose-500/50 animate-[spin_4s_linear_infinite_reverse]'
                : starkTheme === 'gold'
                ? 'border-yellow-400/50 border-dotted animate-[spin_10s_linear_infinite_reverse]'
                : 'border-blue-500/40 animate-[spin_12s_linear_infinite_reverse]'
            }`}
          />

          {/* Layer 3: Inner energy perimeter ring */}
          <div
            className={`absolute inset-12 rounded-full border-2 transition-all duration-700 ${
              starkTheme === 'gold'
                ? 'border-amber-500/40 animate-[spin_25s_linear_infinite]'
                : 'border-cyan-400/30 animate-[spin_30s_linear_infinite]'
            }`}
          />

          {/* Sound energy shockwave pulse */}
          {(isRecording || assistantState === 'SPEAKING') && (
            <div
              className={`absolute inset-0 rounded-full border-4 animate-ping ${
                starkTheme === 'gold' ? 'border-yellow-400/40' : 'border-cyan-400/25'
              }`}
            />
          )}

          {/* Reactor Inner Glow Core Button */}
          <button
            onClick={handleToggleVoice}
            className={`group relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl focus:outline-none ${
              isRecording
                ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-rose-500/60 ring-8 ring-rose-500/30 scale-105'
                : assistantState === 'THINKING' || assistantState === 'PROCESSING'
                ? starkTheme === 'gold'
                  ? 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 shadow-yellow-400/80 animate-pulse ring-8 ring-amber-400/40 scale-105'
                  : 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-cyan-500/40 animate-pulse ring-8 ring-cyan-500/20'
                : assistantState === 'SPEAKING'
                ? starkTheme === 'gold'
                  ? 'bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-200 shadow-yellow-300/90 ring-8 ring-yellow-400/40 scale-105'
                  : 'bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 shadow-cyan-400/50 ring-8 ring-teal-500/25 scale-105'
                : starkTheme === 'gold'
                ? 'bg-gradient-to-tr from-stone-900 via-amber-950 to-stone-950 hover:from-amber-950 hover:via-stone-900 hover:to-amber-900 border-2 border-amber-400/60 shadow-amber-950/80 hover:border-yellow-300 hover:shadow-yellow-500/40 ring-4 ring-amber-500/10'
                : 'bg-gradient-to-tr from-slate-900 via-cyan-950 to-slate-900 hover:from-cyan-950 hover:via-slate-900 hover:to-cyan-900 border-2 border-cyan-500/40 shadow-cyan-950/60 hover:border-cyan-400 hover:shadow-cyan-500/30'
            }`}
          >
            {/* Center icon */}
            <div className="mb-2">
              {isRecording ? (
                <MicOff className="h-14 w-14 text-white animate-bounce" />
              ) : assistantState === 'THINKING' ? (
                <Sparkles className={`h-14 w-14 animate-spin ${starkTheme === 'gold' ? 'text-yellow-100' : 'text-cyan-200'}`} />
              ) : (
                <Mic
                  className={`h-14 w-14 group-hover:scale-110 transition-transform duration-300 ${
                    starkTheme === 'gold' ? 'text-yellow-300 group-hover:text-yellow-100' : 'text-cyan-300 group-hover:text-white'
                  }`}
                />
              )}
            </div>

            <span className="text-xs uppercase font-mono tracking-wider font-bold text-white drop-shadow-md">
              {isRecording
                ? 'Tap to Stop'
                : isStreaming
                ? 'Speaking...'
                : 'Tap to Speak'}
            </span>

            <span
              className={`text-[10px] font-mono mt-1 ${
                starkTheme === 'gold' ? 'text-yellow-300/90' : 'text-cyan-300/80'
              }`}
            >
              {isRecording ? 'Listening...' : 'Push-to-Talk'}
            </span>
          </button>
        </div>

        {/* Live Audio Waveform Component */}
        <div className="mt-5">
          <VoiceWaveform
            active={isRecording || assistantState === 'SPEAKING'}
            state={assistantState}
            color={starkTheme}
          />
        </div>

        {/* Status Label Banner */}
        <div
          className={`mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs shadow-lg ${
            starkTheme === 'gold'
              ? 'bg-amber-950/70 border border-yellow-400/40 text-yellow-300 shadow-amber-500/10'
              : 'bg-slate-900/80 border border-cyan-500/20 text-cyan-300'
          }`}
        >
          <Activity className={`h-3.5 w-3.5 animate-pulse ${starkTheme === 'gold' ? 'text-yellow-400' : 'text-cyan-400'}`} />
          <span>{getStatusLabel(assistantState, isRecording)}</span>
        </div>

        {/* Live Transcript / Subtitles Area */}
        <div
          className={`mt-5 w-full max-w-2xl min-h-[90px] max-h-36 overflow-y-auto px-6 py-4 rounded-2xl backdrop-blur-md flex flex-col justify-center border shadow-xl ${
            starkTheme === 'gold'
              ? 'bg-amber-950/30 border-amber-500/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          {/* User's spoken words */}
          {(interimTranscript || voiceTranscript) && (
            <p className={`text-xs font-mono mb-1 ${starkTheme === 'gold' ? 'text-yellow-300' : 'text-cyan-300'}`}>
              <span className="text-slate-400">YOU: </span>
              "{interimTranscript || voiceTranscript}"
            </p>
          )}

          {/* Assistant Streamed response */}
          {currentStreamText ? (
            <p className="text-sm font-sans text-slate-100 leading-relaxed font-medium">
              <span className={`font-mono text-xs ${starkTheme === 'gold' ? 'text-yellow-400 font-bold' : 'text-cyan-400'}`}>
                JARVIS:
              </span>{' '}
              {currentStreamText}
            </p>
          ) : !interimTranscript && !voiceTranscript ? (
            <p className="text-xs text-slate-400 font-mono italic">
              Speak naturally, or tap one of the tactical commands below...
            </p>
          ) : null}
        </div>
      </div>

      {/* Bottom Command Suggestions */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-6">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
          {[
            'What is 18% of 42,000?',
            'Create a task: Interview Prep for tomorrow',
            'Create a note: Jarvis Architecture Highlights',
            'What time is it in London right now?',
            'Who are you and what can you do?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickCommand(prompt)}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 shadow-md text-xs font-mono ${
                starkTheme === 'gold'
                  ? 'bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 hover:border-yellow-400 text-yellow-200'
                  : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300'
              }`}
            >
              <Zap className={`h-3 w-3 ${starkTheme === 'gold' ? 'text-yellow-400' : 'text-cyan-400'}`} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
