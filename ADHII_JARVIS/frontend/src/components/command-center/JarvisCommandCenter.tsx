import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  desktopApi,
  spotifyApi,
  notesApi,
  systemApi,
  conversationsApi,
} from '../../api/client';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { jarvisSound } from '../../utils/jarvisSoundSystem';

// Command Center Sub-Components
import { TopStatusBar } from './TopStatusBar';
import { TelemetryPanel } from './TelemetryPanel';
import { JarvisCore } from './JarvisCore';
import { CommandTerminal } from './CommandTerminal';
import { SystemControlGrid } from './SystemControlGrid';
import { SpotifyCard } from './SpotifyCard';
import { NotesPanel } from './NotesPanel';
import { QuickActionDock } from './QuickActionDock';
import { ToolConfirmationModal } from './ToolConfirmationModal';

// Types
import {
  AssistantState,
  TelemetryData,
  SpotifyTrackState,
  NoteDirective,
  TerminalMessage,
  PendingConfirmation,
} from './types';

export const JarvisCommandCenter: React.FC = () => {
  const { user } = useAuth();
  const {
    socket,
    connected: socketConnected,
    assistantState,
    setAssistantState,
    currentStreamText,
    isStreaming,
    voiceTranscript,
    sendChatMessage,
    activeConversationId,
    setActiveConversationId,
    lastCompletedMessage,
  } = useSocket();

  // Centralized State
  const navigate = useNavigate();
  const [ambienceEnabled, setAmbienceEnabled] = useState<boolean>(jarvisSound.isAmbienceOn());
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [desktopConnected, setDesktopConnected] = useState<boolean>(false);
  const [lastHeartbeatSecondsAgo, setLastHeartbeatSecondsAgo] = useState<number>(0);
  const [dbConnected, setDbConnected] = useState<boolean>(true);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [spotifyState, setSpotifyState] = useState<SpotifyTrackState | null>(null);
  const [notes, setNotes] = useState<NoteDirective[]>([]);
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([
    {
      id: 'init-1',
      sender: 'JARVIS',
      text: 'Good day, boss. All systems nominal. Standing by for your instructions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [currentToolName, setCurrentToolName] = useState<string | undefined>(undefined);

  // Return to workspace shortcut (Esc key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pendingConfirmation) {
        navigate('/chat');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingConfirmation, navigate]);

  // Voice Recognition Hook
  const {
    isRecording,
    startRecording,
    stopRecording,
    interimTranscript,
  } = useVoiceRecognition(activeConversationId, {
    handsFree: true,
    autoSilenceTimeoutMs: 1400,
  });

  // Track conversation completions in the Command Terminal
  useEffect(() => {
    if (lastCompletedMessage && lastCompletedMessage.content) {
      jarvisSound.playSuccess();
      setTerminalMessages((prev) => [
        ...prev,
        {
          id: lastCompletedMessage.message_id || String(Date.now()),
          sender: 'JARVIS',
          text: lastCompletedMessage.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [lastCompletedMessage]);

  // Ensure an active conversation exists for MK-Command
  useEffect(() => {
    const ensureConversation = async () => {
      if (!activeConversationId) {
        try {
          const res = await conversationsApi.list();
          const list = Array.isArray(res) ? res : (res && (res as any).conversations) ? (res as any).conversations : [];
          if (list && list.length > 0) {
            setActiveConversationId(list[0].id);
          } else {
            const newConv = await conversationsApi.create('MK-Command Active Session');
            if (newConv && newConv.id) {
              setActiveConversationId(newConv.id);
            }
          }
        } catch (e) {
          console.warn('Could not initialize conversation:', e);
        }
      }
    };
    ensureConversation();
  }, [activeConversationId, setActiveConversationId]);

  // Telemetry Fetcher & Heartbeat Tracking
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await desktopApi.getTelemetry();
      if (res && res.status === 'success') {
        setTelemetry(res);
        setDesktopConnected(true);
        setLastHeartbeatSecondsAgo(0);
      } else {
        setDesktopConnected(false);
      }
    } catch (err) {
      setDesktopConnected(false);
    }
  }, []);

  // Poll Telemetry & Heartbeat every 3 seconds (avoiding excessive socket traffic)
  useEffect(() => {
    fetchTelemetry();
    const telInterval = setInterval(fetchTelemetry, 3500);

    const hbInterval = setInterval(() => {
      setLastHeartbeatSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(telInterval);
      clearInterval(hbInterval);
    };
  }, [fetchTelemetry]);

  // Load Notes from Supabase
  const loadNotes = useCallback(async () => {
    try {
      const res: any = await notesApi.list();
      if (res && res.notes && Array.isArray(res.notes)) {
        setNotes(
          res.notes.map((n: any) => ({
            id: n.id,
            title: n.title,
            completed: Boolean(n.is_completed || false),
            created_at: n.created_at,
          }))
        );
        setDbConnected(true);
      }
    } catch (_) {
      setDbConnected(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Load Spotify State
  const loadSpotify = useCallback(async () => {
    try {
      const state = await spotifyApi.getState();
      if (state) {
        setSpotifyState(state);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadSpotify();
    const spInterval = setInterval(loadSpotify, 6000);
    return () => clearInterval(spInterval);
  }, [loadSpotify]);

  // Socket.IO event listeners for real-time companion updates
  useEffect(() => {
    if (!socket) return;

    socket.on('telemetry:update', (data: TelemetryData) => {
      setTelemetry(data);
      setDesktopConnected(true);
      setLastHeartbeatSecondsAgo(0);
    });

    socket.on('desktop:result', (data: any) => {
      if (data && data.message) {
        setActionFeedback(data.message);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    });

    socket.on('tool:confirmation_required', (data: any) => {
      setPendingConfirmation({
        command_id: data.command_id || String(Date.now()),
        tool: data.tool || 'app_launcher',
        action: data.action || 'lock',
        parameters: data.parameters,
        message: data.message || 'Confirmation required for this destructive action.',
        device_id: data.device_id || 'DESKTOP-01',
        expires_at: Date.now() + 15000,
      });
    });

    socket.on('spotify:track', (state: SpotifyTrackState) => {
      setSpotifyState(state);
    });

    return () => {
      socket.off('telemetry:update');
      socket.off('desktop:result');
      socket.off('tool:confirmation_required');
      socket.off('spotify:track');
    };
  }, [socket]);

  // Handlers for Desktop Commands
  const handleExecuteCommand = async (action: string, appName?: string) => {
    try {
      setActionFeedback(`Executing ${appName || action}...`);
      setCurrentToolName(appName || action);

      if (action === 'open' && appName) {
        const res = await desktopApi.sendCommand({
          tool: 'app_launcher',
          action: 'open',
          parameters: { app: appName },
        });

        if (res.status === 'success') {
          setActionFeedback(res.message);
          setTerminalMessages((prev) => [
            ...prev,
            {
              id: String(Date.now()),
              sender: 'JARVIS',
              text: res.message,
              toolName: `app_launcher.${appName}`,
              toolStatus: 'success',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else if (res.status === 'error') {
          setActionFeedback(`Error: ${res.message}`);
        }
      } else if (action === 'mute') {
        const res = await desktopApi.sendCommand({
          tool: 'system_control',
          action: 'mute',
        });
        if (res.status === 'success') {
          setActionFeedback(res.message);
        }
      }
    } catch (err: any) {
      setActionFeedback(`Action failed: ${err.message}`);
    } finally {
      setTimeout(() => setCurrentToolName(undefined), 2000);
    }
  };

  // Lock confirmation handler
  const handleRequestLock = () => {
    setPendingConfirmation({
      command_id: String(Date.now()),
      tool: 'system_control',
      action: 'lock',
      parameters: {},
      message: 'Locking workstation will require your Windows login PIN or password to unlock.',
      device_id: telemetry?.device_id || 'DESKTOP-01',
      expires_at: Date.now() + 15000,
    });
  };

  const handleConfirmAction = async (commandId: string) => {
    setPendingConfirmation(null);
    try {
      const res = await desktopApi.sendCommand({
        command_id: commandId,
        tool: 'system_control',
        action: 'lock',
        confirmed: true,
      });
      setActionFeedback(res.message);
    } catch (err: any) {
      setActionFeedback(`Lock command failed: ${err.message}`);
    }
  };

  const handleCancelAction = (commandId: string) => {
    setPendingConfirmation(null);
    setActionFeedback('Action was safely cancelled.');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Spotify Handlers
  const handleSpotifyPlay = async () => {
    await spotifyApi.play();
    loadSpotify();
  };

  const handleSpotifyPause = async () => {
    await spotifyApi.pause();
    loadSpotify();
  };

  const handleSpotifyNext = async () => {
    await spotifyApi.next();
    loadSpotify();
  };

  const handleSpotifyPrevious = async () => {
    await spotifyApi.previous();
    loadSpotify();
  };

  const handleSpotifyFallback = () => {
    // Launch Spotify desktop app via companion
    handleExecuteCommand('open', 'spotify');
  };

  // Notes Handlers
  const handleAddNote = async (title: string) => {
    try {
      const newNote = await notesApi.create({ title, content: title });
      if (newNote) {
        setNotes((prev) => [
          { id: newNote.id || String(Date.now()), title, completed: false },
          ...prev,
        ]);
      }
    } catch (e) {
      // Optimistic local add
      setNotes((prev) => [
        { id: String(Date.now()), title, completed: false },
        ...prev,
      ]);
    }
  };

  const handleToggleNote = async (id: string, completed: boolean) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed } : n))
    );
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.delete(id);
    } catch (_) {}
  };

  // User chat/command submit
  const handleSendUserCommand = (text: string) => {
    jarvisSound.playChirp();
    setTerminalMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'YOU',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    sendChatMessage(activeConversationId, text, voiceReplyEnabled);
  };

  const handleToggleAmbience = () => {
    const active = jarvisSound.toggleAmbience();
    setAmbienceEnabled(active);
  };

  // Toggle voice recording
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050811] text-slate-100 font-sans select-none overflow-x-hidden relative">
      {/* Background Matrix & Futuristic Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#00f0ff_0.6px,transparent_0.6px)] [background-size:24px_24px] opacity-10" />

      {/* TOP STATUS BAR (Height ~64px) */}
      <TopStatusBar
        desktopConnected={desktopConnected}
        dbConnected={dbConnected}
        aiState={assistantState}
        voiceEnabled={voiceReplyEnabled}
        spotifyConnected={Boolean(spotifyState?.connected)}
        onToggleVoice={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSettings={() => {}}
        onOpenNotifications={() => {}}
        userName={user?.preferred_name || 'Adhi'}
        ambienceEnabled={ambienceEnabled}
        onToggleAmbience={handleToggleAmbience}
        onExitWorkspace={() => navigate('/chat')}
      />

      {/* MAIN 3-COLUMN COMMAND CENTER GRID */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-start">
        {/* LEFT COLUMN: System Telemetry (~24% / 3 cols) */}
        <section className="lg:col-span-3 w-full">
          <TelemetryPanel
            telemetry={telemetry}
            desktopConnected={desktopConnected}
            lastHeartbeatSecondsAgo={lastHeartbeatSecondsAgo}
          />
        </section>

        {/* CENTER COLUMN: Jarvis Assistant Core & Command Terminal (~50-52% / 6 cols) */}
        <section className="lg:col-span-6 w-full flex flex-col items-center justify-between gap-4 min-h-[720px]">
          {/* JARVIS CORE COMPONENT */}
          <div className="w-full flex-1 flex flex-col items-center justify-center p-2 rounded-3xl bg-[#080d19]/80 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.08)]">
            <JarvisCore
              state={assistantState}
              isRecording={isRecording}
              onToggleRecording={handleToggleVoiceRecording}
              voiceTranscript={voiceTranscript}
              interimTranscript={interimTranscript}
              voiceReplyEnabled={voiceReplyEnabled}
              onToggleVoiceReply={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
              onStopSpeech={() => {
                setAssistantState('IDLE');
              }}
              currentToolName={currentToolName}
              ambienceEnabled={ambienceEnabled}
              onToggleAmbience={handleToggleAmbience}
            />
          </div>

          {/* COMMAND TERMINAL */}
          <CommandTerminal
            messages={terminalMessages}
            currentStreamText={currentStreamText}
            isStreaming={isStreaming}
            onSendMessage={handleSendUserCommand}
          />
        </section>

        {/* RIGHT COLUMN: System Actions, Spotify, Notes (~24% / 3 cols) */}
        <section className="lg:col-span-3 w-full flex flex-col gap-4">
          <SystemControlGrid
            desktopConnected={desktopConnected}
            onExecuteCommand={handleExecuteCommand}
            onRequestLockConfirmation={handleRequestLock}
            feedbackMessage={actionFeedback}
          />

          <SpotifyCard
            trackState={spotifyState}
            onPlay={handleSpotifyPlay}
            onPause={handleSpotifyPause}
            onNext={handleSpotifyNext}
            onPrevious={handleSpotifyPrevious}
            onOpenAppFallback={handleSpotifyFallback}
          />

          <NotesPanel
            notes={notes}
            onAddNote={handleAddNote}
            onToggleNote={handleToggleNote}
            onDeleteNote={handleDeleteNote}
            isSynced={dbConnected}
          />
        </section>
      </main>

      {/* BOTTOM ACTION DOCK */}
      <QuickActionDock
        onQuickAction={(text, app) => {
          if (app) {
            handleExecuteCommand('open', app);
          } else {
            handleSendUserCommand(text);
          }
        }}
        desktopConnected={desktopConnected}
      />

      {/* DESTRUCTIVE CONFIRMATION MODAL */}
      <ToolConfirmationModal
        confirmation={pendingConfirmation}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
};
export default JarvisCommandCenter;
