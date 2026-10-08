import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Send,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TerminalMessage } from './types';

interface CommandTerminalProps {
  messages: TerminalMessage[];
  currentStreamText?: string;
  isStreaming?: boolean;
  onSendMessage: (text: string) => void;
  onExpandFullChat?: () => void;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  messages,
  currentStreamText = '',
  isStreaming = false,
  onSendMessage,
  onExpandFullChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className={`w-full flex flex-col rounded-2xl bg-[#070e1b]/95 border border-cyan-500/25 shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300 overflow-hidden ${
        isExpanded ? 'h-80' : 'h-44'
      }`}
    >
      {/* TERMINAL HEADER BAR */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-cyan-500/20 bg-slate-950/70 select-none">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>COMMAND CONSOLE // ORCHESTRATOR</span>
        </div>

        <div className="flex items-center gap-2">
          {onExpandFullChat && (
            <button
              onClick={onExpandFullChat}
              className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded border border-slate-800 hover:border-cyan-500/30 transition"
              title="Open full chat page"
            >
              FULL CHAT
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-cyan-300 transition"
            title={isExpanded ? 'Collapse Console' : 'Expand Console'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* TERMINAL LOG BODY */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono text-xs text-slate-300">
        {messages.length === 0 && !isStreaming && (
          <div className="text-slate-500 italic py-2 text-center text-[11px]">
            No recent commands. Type below or speak to command Jarvis.
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg border text-xs leading-relaxed transition-all ${
              msg.sender === 'YOU'
                ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-100'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    msg.sender === 'YOU' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                />
                {msg.sender}:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">{msg.timestamp}</span>
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="p-0.5 hover:text-cyan-300 transition"
                  title="Copy text"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="whitespace-pre-wrap select-text">{msg.text}</div>

            {/* Optional Tool execution badge */}
            {msg.toolName && (
              <div className="mt-1.5 pt-1 border-t border-cyan-950/60 flex items-center gap-2 text-[10px] text-cyan-300 font-mono">
                <Wrench className="w-3 h-3 text-cyan-400" />
                <span>TOOL: {msg.toolName}</span>
                {msg.toolStatus === 'success' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> ✓
                  </span>
                )}
                {msg.toolStatus === 'error' && (
                  <span className="text-rose-400 font-bold flex items-center gap-0.5">
                    <AlertCircle className="w-3 h-3" /> ✗
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Live streaming message snippet */}
        {isStreaming && (
          <div className="p-2 rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-200 animate-pulse">
            <span className="text-[10px] font-bold text-cyan-400 block mb-0.5">
              JARVIS (STREAMING):
            </span>
            <div className="whitespace-pre-wrap select-text">
              {currentStreamText || '...'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT COMMAND LINE (SO USERS ARE NOT VOICE-ONLY) */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-t border-cyan-500/20 bg-slate-950/80 flex items-center gap-2"
      >
        <span className="text-cyan-400 font-mono font-bold text-xs pl-1">›</span>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder='Ask Jarvis or command: "Play Starboy on Spotify", "Open VS Code"...'
          className="flex-1 bg-transparent border-none text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send command"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
