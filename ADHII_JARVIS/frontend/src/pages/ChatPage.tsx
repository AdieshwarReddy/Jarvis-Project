import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  RotateCcw,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  Bot,
  Zap,
  Radio,
} from 'lucide-react';
import { conversationsApi } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { ToolConfirmationCard } from '../components/ToolConfirmationCard';
import { AmbientVoiceModal } from '../components/AmbientVoiceModal';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  message_type?: string;
  tool_name?: string;
  created_at: string;
}

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvId = searchParams.get('id') || '';

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showAmbientMode, setShowAmbientMode] = useState(false);
  const [autoVoice, setAutoVoice] = useState<boolean>(() => localStorage.getItem('jarvis_autovoice') !== 'false');
  const [starkTheme, setStarkTheme] = useState<'gold' | 'cyan'>(() => (localStorage.getItem('jarvis_theme') as 'gold' | 'cyan') || 'gold');

  const toggleAutoVoice = () => {
    const next = !autoVoice;
    setAutoVoice(next);
    localStorage.setItem('jarvis_autovoice', String(next));
  };

  const toggleStarkTheme = () => {
    const next = starkTheme === 'gold' ? 'cyan' : 'gold';
    setStarkTheme(next);
    localStorage.setItem('jarvis_theme', next);
  };

  const {
    sendChatMessage,
    stopGeneration,
    isStreaming,
    currentStreamText,
    pendingToolActivity,
    confirmTool,
    lastCompletedMessage,
  } = useSocket();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Keyboard shortcut ESC to exit ambient mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAmbientMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Permanently store completed assistant message in message thread
  useEffect(() => {
    if (lastCompletedMessage && lastCompletedMessage.content) {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) =>
            m.id === lastCompletedMessage.message_id ||
            (m.role === 'assistant' && m.content === lastCompletedMessage.content)
        );
        if (alreadyExists) return prev;
        return [
          ...prev,
          {
            id: lastCompletedMessage.message_id || `asst-${Date.now()}`,
            role: 'assistant',
            content: lastCompletedMessage.content,
            created_at: new Date().toISOString(),
          },
        ];
      });
    }
  }, [lastCompletedMessage]);

  // Load conversation details
  const loadConversation = async (convId: string) => {
    setLoading(true);
    try {
      const data = await conversationsApi.get(convId);
      setConversation(data);
      setMessages(data.messages || []);
      setNewTitle(data.title || 'Conversation');
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setConversation({ id: convId, title: 'Active Conversation', messages: [] });
    } finally {
      setLoading(false);
    }
  };

  // Start new chat
  const handleNewChat = async () => {
    try {
      const res = await conversationsApi.create('New Conversation');
      setSearchParams({ id: res.id });
      setConversation(res);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create new chat:', err);
      const fallbackConv = { id: `conv-${Date.now()}`, title: 'New Conversation', messages: [] };
      setConversation(fallbackConv);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      loadConversation(activeConvId);
    } else {
      // Check if existing conversations or create initial
      conversationsApi.list().then((list) => {
        if (list && list.length > 0) {
          setSearchParams({ id: list[0].id });
        } else {
          handleNewChat();
        }
      }).catch(() => {
        handleNewChat();
      });
    }
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamText, pendingToolActivity]);

  const handleSendMessage = async (text: string, voiceResponse?: boolean) => {
    const shouldVoice = voiceResponse !== undefined ? voiceResponse : autoVoice;
    let targetConvId = conversation?.id || activeConvId;
    if (!targetConvId) {
      try {
        const newConv = await conversationsApi.create('New Conversation');
        setConversation(newConv);
        targetConvId = newConv.id;
        setSearchParams({ id: newConv.id });
      } catch (err) {
        console.warn('Fallback conversation ID used:', err);
        targetConvId = `conv-${Date.now()}`;
        setConversation({ id: targetConvId, title: 'New Conversation', messages: [] });
      }
    }

    // Optimistically append user message to local state
    const optimisticUserMsg: Message = {
      id: `opt-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    sendChatMessage(targetConvId, text, shouldVoice);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const targetConvId = conversation?.id || activeConvId || `conv-${Date.now()}`;
      sendChatMessage(targetConvId, lastUserMsg.content, autoVoice);
    }
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim() || !conversation) return;
    try {
      await conversationsApi.update(conversation.id, { title: newTitle.trim() });
      setConversation((prev: any) => ({ ...prev, title: newTitle.trim() }));
      setEditingTitle(false);
    } catch (e) {
      console.error('Failed to update title:', e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto rounded-3xl bg-jarvis-card/60 border border-cyan-500/15 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>

          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-2.5 py-1 text-sm rounded-lg bg-slate-950 border border-cyan-500/40 text-white focus:outline-none"
                autoFocus
              />
              <button onClick={handleSaveTitle} className="p-1 text-emerald-400 hover:text-emerald-300">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => setEditingTitle(false)} className="p-1 text-slate-400 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-sm font-semibold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                {conversation?.title || 'Active Conversation'}
              </h2>
              <button
                onClick={() => setEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-cyan-300 transition"
                title="Rename chat"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Selector: Stark Gold vs Cyan */}
          <button
            onClick={toggleStarkTheme}
            className={`p-2 px-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm ${
              starkTheme === 'gold'
                ? 'bg-amber-500/20 border-yellow-400/50 text-yellow-300 shadow-amber-500/10'
                : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
            }`}
            title="Switch Core Theme"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{starkTheme === 'gold' ? '🟡 Stark Gold' : '🔷 Cyan'}</span>
          </button>

          {/* Ambient Voice HUD button */}
          <button
            onClick={() => setShowAmbientMode(true)}
            className={`p-2 px-3 rounded-xl border transition text-xs font-semibold flex items-center gap-1.5 shadow-lg group ${
              starkTheme === 'gold'
                ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 text-yellow-300 border-yellow-400/50 shadow-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30'
                : 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-cyan-300 border-cyan-400/30 shadow-cyan-500/10 hover:from-cyan-500/30 hover:to-purple-500/30'
            }`}
            title="Open Jarvis Fullscreen Voice HUD"
          >
            <Radio className={`h-3.5 w-3.5 animate-pulse group-hover:scale-110 transition-transform ${starkTheme === 'gold' ? 'text-yellow-400' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">Voice HUD</span>
          </button>

          {messages.length > 0 && !isStreaming && (
            <button
              onClick={handleRegenerate}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition text-xs flex items-center gap-1.5"
              title="Regenerate last response"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          <button
            onClick={handleNewChat}
            className={`p-2 px-3 rounded-xl border transition text-xs font-medium flex items-center gap-1.5 ${
              starkTheme === 'gold'
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-yellow-300 border-amber-500/30'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
            title="Start fresh conversation"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 space-y-2">
        {messages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-6 shadow-xl shadow-cyan-500/10 animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">How may I assist you today?</h3>
            <p className="text-xs text-slate-400 max-w-md mb-8 leading-relaxed">
              I can converse with natural voice, evaluate mathematical expressions, create notes, manage tasks, schedule reminders, and retrieve knowledge from uploaded documents.
            </p>

            {/* Starter Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                'What is 18% of 42,000?',
                'Create a task to practice Python tomorrow',
                'Create a note called Placement Prep',
                'What time is it in Tokyo right now?',
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(starter)}
                  className="p-3 text-left rounded-2xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-cyan-200 transition-all duration-200 group flex items-center justify-between"
                >
                  <span className="truncate mr-2">{starter}</span>
                  <Zap className="h-3.5 w-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                messageType={msg.message_type}
                toolName={msg.tool_name}
              />
            ))}

            {/* Current Stream Message or immediate processing state */}
            {isStreaming && (
              <ChatMessage
                role="assistant"
                content={currentStreamText || 'Processing your request...'}
                isStreaming={true}
              />
            )}

            {/* Pending Tool Confirmation Card */}
            {pendingToolActivity && (
              <div className="flex justify-start px-4 sm:px-6">
                <ToolConfirmationCard
                  activityId={pendingToolActivity.tool_activity_id}
                  toolName={pendingToolActivity.tool_name}
                  summary={pendingToolActivity.summary}
                  parameters={pendingToolActivity.parameters}
                  onConfirm={() =>
                    confirmTool(
                      pendingToolActivity.tool_activity_id,
                      conversation?.id || '',
                      true
                    )
                  }
                  onCancel={() =>
                    confirmTool(
                      pendingToolActivity.tool_activity_id,
                      conversation?.id || '',
                      false
                    )
                  }
                />
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Chat Input */}
      <ChatInput
        conversationId={conversation?.id}
        onSend={(text) => handleSendMessage(text, autoVoice)}
        onStop={stopGeneration}
        isStreaming={isStreaming}
        autoVoice={autoVoice}
        onToggleAutoVoice={toggleAutoVoice}
        starkTheme={starkTheme}
        onOpenVoiceHud={() => setShowAmbientMode(true)}
      />

      {/* Ambient Voice HUD Modal */}
      <AmbientVoiceModal
        conversationId={conversation?.id}
        isOpen={showAmbientMode}
        onClose={() => setShowAmbientMode(false)}
        onSendMessage={(text, voiceReply) => {
          handleSendMessage(text, voiceReply ?? true);
        }}
      />
    </div>
  );
};
