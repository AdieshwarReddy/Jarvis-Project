import React, { useState } from 'react';
import { Copy, Check, Sparkles, User, Wrench } from 'lucide-react';

interface Props {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  messageType?: string;
  toolName?: string;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<Props> = ({
  role,
  content,
  messageType,
  toolName,
  isStreaming,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === 'user';

  // Basic markdown-like rendering for bold, code blocks, lists
  const renderFormattedContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
        const codeContent = lang ? lines.slice(1).join('\n') : lines.join('\n');
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 font-mono text-xs">
            {lang && (
              <div className="bg-slate-900 px-4 py-1.5 text-[11px] text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                {lang}
              </div>
            )}
            <pre className="p-4 text-cyan-200 overflow-x-auto leading-relaxed whitespace-pre-wrap">{codeContent}</pre>
          </div>
        );
      }

      // Inline formatting
      return (
        <span key={index} className="whitespace-pre-wrap leading-relaxed">
          {part.split('\n').map((line, lineIdx) => {
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const isNumbered = /^\d+\.\s/.test(line.trim());

            return (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {isBullet && <span className="inline-block w-2 text-cyan-400 mr-2">•</span>}
                {isNumbered && <span className="font-semibold text-cyan-300 mr-1.5">{line.trim().split(' ')[0]}</span>}
                {line.replace(/^[-*]\s+|\d+\.\s+/, '').split(/(\*\*.*?\*\*|`.*?`)/g).map((subPart, subIdx) => {
                  if (subPart.startsWith('**') && subPart.endsWith('**')) {
                    return <strong key={subIdx} className="font-semibold text-white">{subPart.slice(2, -2)}</strong>;
                  }
                  if (subPart.startsWith('`') && subPart.endsWith('`')) {
                    return (
                      <code key={subIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700/50">
                        {subPart.slice(1, -1)}
                      </code>
                    );
                  }
                  return subPart;
                })}
              </React.Fragment>
            );
          })}
        </span>
      );
    });
  };

  return (
    <div className={`flex gap-4 py-4 px-3 sm:px-6 transition-colors duration-150 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center shadow-lg ${
            isUser
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-cyan-500/20'
              : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-purple-500/20'
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>

        {/* Content Box */}
        <div
          className={`relative group rounded-2xl px-5 py-4 text-sm leading-relaxed transition-all duration-200 ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white rounded-tr-none shadow-md shadow-cyan-900/20'
              : 'bg-jarvis-card/90 border border-slate-700/60 text-slate-200 rounded-tl-none shadow-md shadow-black/20'
          }`}
        >
          {/* Tool Tag if associated */}
          {toolName && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono">
              <Wrench className="h-3 w-3" />
              <span>Tool: {toolName}</span>
            </div>
          )}

          <div className="prose prose-invert max-w-none text-sm break-words">
            {renderFormattedContent(content)}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1.5 bg-cyan-400 animate-pulse rounded-sm align-middle" />
            )}
          </div>

          {/* Copy button */}
          {!isUser && content && !isStreaming && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-all duration-200 border border-slate-700"
              title="Copy response"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
