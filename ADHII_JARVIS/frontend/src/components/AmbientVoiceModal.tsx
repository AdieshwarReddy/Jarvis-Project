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

  const handleQuickCommand = (cmd: string) => {
    onSendMessage(cmd, voiceReplyEnabled);
  };

  // Status text based on state
  const getStatusLabel = (state: AssistantState, recording: boolean) => {
    if (recording) return 'LISTENING FOR VOICE COMMAND...';
    switch (state) {
      case 'LISTENING':
        return 'MICROPHONE ACTIVE — RECEIVING INPUT';
      case 'THINKING':
      case 'PROCESSING':
        return 'PROCESSING INTENT & EXECUTING TOOLS...';
      case 'SPEAKING':
        return 'SYNTHESIZING NEURAL AUDIO RESPONSE...';
      case 'ERROR':
        return 'COMMUNICATION INTERRUPTED';
      default:
        return 'JARVIS CORE ONLINE — STANDBY';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-2xl text-slate-100 overflow-hidden animate-in fade-in duration-300">
      {/* Background Holographic Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
      </div>

      {/* Top HUD Bar */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider text-white">
                JARVIS AMBIENT CORE
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 rounded-full">
                HUD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Voice-First Neural Workspace • Real-Time Protocol
            </p>
          </div>
        </div>

        {/* Telemetry badges */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>LLM: Groq / GPT-4o</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Tools: Guarded AST</span>
          </div>
          <button
            onClick={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              voiceReplyEnabled
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}
            title="Toggle spoken voice responses"
          >
            {voiceReplyEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Voice Audio: {voiceReplyEnabled ? 'ON' : 'OFF'}</span>
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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 text-center my-4">
        {/* Pulsing concentric rings */}
        <div className="relative flex items-center justify-center w-72 h-72 sm:w-88 sm:h-88">
          {/* Outer rotating segmented ring */}
          <div
            className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-1000 ${
              isRecording
                ? 'border-rose-400/50 animate-[spin_6s_linear_infinite]'
                : assistantState === 'THINKING' || assistantState === 'PROCESSING'
                ? 'border-cyan-400/60 animate-[spin_4s_linear_infinite]'
                : assistantState === 'SPEAKING'
                ? 'border-cyan-300/60 animate-[spin_8s_linear_infinite]'
                : 'border-cyan-500/25 animate-[spin_20s_linear_infinite]'
            }`}
          />

          {/* Inner counter-rotating ring */}
          <div
            className={`absolute inset-6 rounded-full border border-cyan-400/30 transition-all duration-1000 ${
              isRecording
                ? 'border-rose-500/40 animate-[spin_4s_linear_infinite_reverse]'
                : 'border-blue-500/40 animate-[spin_12s_linear_infinite_reverse]'
            }`}
          />

          {/* Sound energy shockwave (when speaking or listening) */}
          {(isRecording || assistantState === 'SPEAKING') && (
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 animate-ping" />
          )}

          {/* Reactor Inner Glow Core */}
          <button
            onClick={handleToggleVoice}
            className={`group relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl focus:outline-none ${
              isRecording
                ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-rose-500/50 ring-8 ring-rose-500/20 scale-105'
                : assistantState === 'THINKING' || assistantState === 'PROCESSING'
                ? 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-cyan-500/40 animate-pulse ring-8 ring-cyan-500/20'
                : assistantState === 'SPEAKING'
                ? 'bg-gradient-to-tr from-cyan-500 via-teal-500 to-blue-600 shadow-cyan-400/50 ring-8 ring-teal-500/25 scale-105'
                : 'bg-gradient-to-tr from-slate-900 via-cyan-950 to-slate-900 hover:from-cyan-950 hover:via-slate-900 hover:to-cyan-900 border-2 border-cyan-500/40 shadow-cyan-950/60 hover:border-cyan-400 hover:shadow-cyan-500/30'
            }`}
          >
            {/* Center icon */}
            <div className="mb-2">
              {isRecording ? (
                <MicOff className="h-12 w-12 text-white animate-bounce" />
              ) : assistantState === 'THINKING' ? (
                <Sparkles className="h-12 w-12 text-cyan-200 animate-spin" />
              ) : (
                <Mic className="h-12 w-12 text-cyan-300 group-hover:text-white group-hover:scale-110 transition-transform duration-300" />
              )}
            </div>

            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-white/90">
              {isRecording
                ? 'Tap to Stop'
                : isStreaming
                ? 'Speaking...'
                : 'Tap to Speak'}
            </span>

            <span className="text-[10px] text-cyan-300/80 font-mono mt-1">
              {isRecording ? 'Listening...' : 'Push-to-Talk'}
            </span>
          </button>
        </div>

        {/* Live Audio Waveform Component */}
        <div className="mt-6">
          <VoiceWaveform
            active={isRecording || assistantState === 'SPEAKING'}
            state={assistantState}
          />
        </div>

        {/* Status Label Banner */}
        <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/20 font-mono text-xs text-cyan-300">
          <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
          <span>{getStatusLabel(assistantState, isRecording)}</span>
        </div>

        {/* Live Transcript / Subtitles Area */}
        <div className="mt-6 w-full max-w-2xl min-h-[90px] max-h-36 overflow-y-auto px-6 py-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex flex-col justify-center">
          {/* User's spoken words */}
          {(interimTranscript || voiceTranscript) && (
            <p className="text-xs text-cyan-300 font-mono mb-1">
              <span className="text-slate-400">YOU: </span>
              "{interimTranscript || voiceTranscript}"
            </p>
          )}

          {/* Assistant Streamed response */}
          {currentStreamText ? (
            <p className="text-sm font-sans text-slate-100 leading-relaxed font-medium">
              <span className="text-cyan-400 font-mono text-xs">JARVIS: </span>
              {currentStreamText}
            </p>
          ) : !interimTranscript && !voiceTranscript ? (
            <p className="text-xs text-slate-500 font-mono italic">
              Speak naturally, or tap one of the quick commands below...
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
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-md"
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
