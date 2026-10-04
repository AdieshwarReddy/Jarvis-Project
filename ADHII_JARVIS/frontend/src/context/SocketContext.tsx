import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

export type AssistantState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'THINKING' | 'SPEAKING' | 'ERROR';

interface ToolActivityData {
  tool_activity_id: string;
  tool_name: string;
  summary: string;
  parameters: any;
  message?: any;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  assistantState: AssistantState;
  setAssistantState: (state: AssistantState) => void;
  currentStreamText: string;
  isStreaming: boolean;
  pendingToolActivity: ToolActivityData | null;
  setPendingToolActivity: (act: ToolActivityData | null) => void;
  voiceTranscript: string;
  sendChatMessage: (conversationId: string, message: string, voiceResponse?: boolean) => void;
  stopGeneration: () => void;
  confirmTool: (toolActivityId: string, conversationId: string, confirmed: boolean) => void;
  sendAudioChunk: (base64Chunk: string) => void;
  finishVoiceRecording: (conversationId?: string, clientTranscript?: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [currentStreamText, setCurrentStreamText] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [pendingToolActivity, setPendingToolActivity] = useState<ToolActivityData | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';
    const s = io(socketUrl, {
      auth: { token: token || 'demo-token' },
      query: { token: token || 'demo-token' },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setConnected(true);
      console.log('Real-time Socket.IO connected:', s.id);
    });

    s.on('disconnect', () => {
      setConnected(false);
      setIsStreaming(false);
      setAssistantState('IDLE');
      console.log('Real-time Socket.IO disconnected');
    });

    // Assistant streaming events
    s.on('assistant:start', () => {
      setIsStreaming(true);
      setCurrentStreamText('');
      setAssistantState('THINKING');
    });

    s.on('assistant:token', (data: { token: string }) => {
      setCurrentStreamText((prev) => prev + (data.token || ''));
      setAssistantState('SPEAKING');
    });

    s.on('assistant:complete', () => {
      setIsStreaming(false);
      setAssistantState('IDLE');
    });

    s.on('assistant:stopped', () => {
      setIsStreaming(false);
      setAssistantState('IDLE');
    });

    s.on('assistant:error', (data: { error: string }) => {
      setIsStreaming(false);
      setAssistantState('ERROR');
      console.error('Assistant error:', data.error);
      setTimeout(() => {
        setAssistantState('IDLE');
      }, 3500);
    });

    // Tool confirmation & status events
    s.on('tool:requested', (data: ToolActivityData) => {
      setPendingToolActivity(data);
      setIsStreaming(false);
      setAssistantState('IDLE');
    });

    s.on('tool:started', () => {
      setAssistantState('PROCESSING');
    });

    s.on('tool:completed', () => {
      setPendingToolActivity(null);
      setAssistantState('IDLE');
    });

    s.on('tool:error', () => {
      setAssistantState('ERROR');
    });

    // Voice & TTS events
    s.on('voice:transcript', (data: { transcript: string }) => {
      setVoiceTranscript(data.transcript);
      setAssistantState('PROCESSING');
    });

    s.on('tts:start', () => {
      setAssistantState('SPEAKING');
    });

    s.on('tts:audio', (data: { audio: string; format: string }) => {
      if (data.audio) {
        try {
          const audioSrc = `data:audio/mp3;base64,${data.audio}`;
          if (audioRef.current) {
            audioRef.current.pause();
          }
          audioRef.current = new Audio(audioSrc);
          audioRef.current.onended = () => {
            setAssistantState('IDLE');
          };
          audioRef.current.onerror = () => {
            setAssistantState('IDLE');
          };
          audioRef.current.play().catch((err) => {
            console.warn('Audio auto-play policy restricted:', err);
            setAssistantState('IDLE');
          });
        } catch (e) {
          console.error('Audio playback error:', e);
        }
      }
    });

    s.on('tts:end', () => {
      // Audio playback continues until onended fires
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  const sendChatMessage = (conversationId: string, message: string, voiceResponse: boolean = false) => {
    if (!socket || !message.trim()) return;
    setIsStreaming(true);
    setCurrentStreamText('');
    setAssistantState('THINKING');
    socket.emit('chat:send', {
      conversation_id: conversationId,
      message,
      voice_response: voiceResponse,
    });
  };

  const stopGeneration = () => {
    if (!socket) return;
    socket.emit('chat:stop');
    setIsStreaming(false);
    setAssistantState('IDLE');
  };

  const confirmTool = (toolActivityId: string, conversationId: string, confirmed: boolean) => {
    if (!socket) return;
    setPendingToolActivity(null);
    setAssistantState('PROCESSING');
    socket.emit('tool:confirm', {
      tool_activity_id: toolActivityId,
      conversation_id: conversationId,
      confirmed,
    });
  };

  const sendAudioChunk = (base64Chunk: string) => {
    if (!socket) return;
    socket.emit('voice:audio', { chunk: base64Chunk });
  };

  const finishVoiceRecording = (conversationId?: string, clientTranscript?: string) => {
    if (!socket) return;
    setAssistantState('PROCESSING');
    socket.emit('voice:end', {
      conversation_id: conversationId,
      transcript: clientTranscript,
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        assistantState,
        setAssistantState,
        currentStreamText,
        isStreaming,
        pendingToolActivity,
        setPendingToolActivity,
        voiceTranscript,
        sendChatMessage,
        stopGeneration,
        confirmTool,
        sendAudioChunk,
        finishVoiceRecording,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
