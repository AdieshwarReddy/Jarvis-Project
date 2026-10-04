import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { VoiceWaveform } from './VoiceWaveform';
import { useSocket } from '../context/SocketContext';

interface Props {
  conversationId?: string;
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  autoVoice?: boolean;
  onToggleAutoVoice?: () => void;
  starkTheme?: 'gold' | 'cyan';
}

export const ChatInput: React.FC<Props> = ({
  conversationId,
  onSend,
  onStop,
  isStreaming,
  autoVoice = true,
  onToggleAutoVoice,
  starkTheme = 'gold',
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { assistantState } = useSocket();
  const { isRecording, startRecording, stopRecording } = useVoiceRecognition(conversationId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isStreaming) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-4">
      {isRecording && (
        <div className="mb-3 flex items-center justify-center">
          <VoiceWaveform active={true} state={assistantState} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-2 rounded-2xl bg-jarvis-card/95 border border-cyan-500/20 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl focus-within:border-cyan-400/50 transition-all duration-300"
      >
        {/* Push-to-talk voice button */}
        <button
          type="button"
          onClick={toggleVoice}
          className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/30'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700/60'
          }`}
          title={isRecording ? 'Stop recording voice' : 'Push-to-talk Voice Assistant'}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Text area input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? 'Listening to your voice...'
              : 'Ask Jarvis, calculate numbers, create tasks, or search documents... (Enter to send)'
          }
          rows={1}
          disabled={isRecording}
          className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 focus:ring-0 resize-none py-3 px-2 text-sm leading-relaxed max-h-36 overflow-y-auto"
        />

        {/* Auto-Voice Speak Toggle */}
        {onToggleAutoVoice && (
          <button
            type="button"
            onClick={onToggleAutoVoice}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 text-xs font-mono border ${
              autoVoice
                ? starkTheme === 'gold'
                  ? 'bg-amber-500/20 border-yellow-400/60 text-yellow-300 shadow-md shadow-amber-500/20 ring-1 ring-yellow-400/30'
                  : 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 border-slate-700/60'
            }`}
            title={autoVoice ? 'Jarvis Auto-Voice is ON (Jarvis will speak)' : 'Jarvis Auto-Voice is OFF (Text only)'}
          >
            {autoVoice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline text-[11px] font-semibold">{autoVoice ? 'Voice ON' : 'Mute'}</span>
          </button>
        )}

        {/* Action button: Send or Stop */}
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 transition-all duration-200 flex-shrink-0"
            title="Stop generation"
          >
            <Square className="h-5 w-5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!text.trim() || isRecording}
            className={`p-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg transition-all duration-200 active:scale-95 flex-shrink-0 ${
              starkTheme === 'gold'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 shadow-amber-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'
            }`}
            title="Send prompt"
          >
            <Send className="h-5 w-5" />
          </button>
        )}
      </form>

      <div className="mt-2 text-center">
        <span className="text-[11px] text-slate-500">
          Adhii Jarvis • Think. Speak. Act. — AI responses are grounded and state modifications require explicit confirmation.
        </span>
      </div>
    </div>
  );
};
