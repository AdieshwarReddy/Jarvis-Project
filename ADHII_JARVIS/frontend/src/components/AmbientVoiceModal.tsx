import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Radio,
  Flame,
  Maximize2,
  Minimize2,
  HardDrive,
  Battery,
  Clock,
  Code2,
  MessageSquare,
  Globe,
  FileText,
  Calculator,
  Music2,
  Tv,
  FolderOpen,
  Lock,
  Plus,
  Send,
} from 'lucide-react';
import { useSocket, AssistantState } from '../context/SocketContext';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { VoiceWaveform } from './VoiceWaveform';
import { systemApi, notesApi } from '../api/client';

interface Props {
  conversationId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string, voiceResponse?: boolean) => void;
}

interface TelemetryData {
  cpu_percent: number;
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  disk_free_gb: number;
  disk_total_gb: number;
  battery_percent: number;
  battery_plugged: boolean;
  message?: string;
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
    lastCompletedMessage,
  } = useSocket();

  // Hands-free continuous conversational loop state
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(true);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [lastReply, setLastReply] = useState<string>('');
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [starkTheme, setStarkTheme] = useState<'gold' | 'cyan'>(() => {
    return (localStorage.getItem('jarvis_theme') as 'gold' | 'cyan') || 'cyan';
  });

  // Live real-time clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real-time system telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cpu_percent: 14.2,
    ram_percent: 68.4,
    ram_used_gb: 10.9,
    ram_total_gb: 16.0,
    disk_free_gb: 248.1,
    disk_total_gb: 475.6,
    battery_percent: 82,
    battery_plugged: false,
  });

  // Notes / Directives list
  const [directives, setDirectives] = useState<string[]>([
    'complete jarvis neural upgrades',
    'verify local system control and app launchers',
    'stark expo board meet and live demo',
    'armor defense testing w/ Friday',
    'enrichment status nominal',
  ]);
  const [newDirective, setNewDirective] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [appLaunchFeedback, setAppLaunchFeedback] = useState<string | null>(null);

  // Initialize Voice Recognition with hands-free silence detection
  const {
    isRecording,
    startRecording,
    stopRecording,
    interimTranscript,
  } = useVoiceRecognition(conversationId, {
    handsFree: handsFreeMode,
    autoSilenceTimeoutMs: 1400,
  });

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch telemetry and notes
  useEffect(() => {
    if (!isOpen) return;

    const fetchStats = async () => {
      try {
        const stats = await systemApi.getStats();
        if (stats && stats.status === 'success') {
          setTelemetry(stats);
        }
      } catch (_) {}
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);

    // Fetch notes
    notesApi.list().then((res: any) => {
      if (res?.notes && Array.isArray(res.notes) && res.notes.length > 0) {
        const titles = res.notes.slice(0, 6).map((n: any) => n.title || n.content?.slice(0, 35));
        setDirectives((prev) => [...new Set([...titles, ...prev])].slice(0, 6));
      }
    }).catch(() => {});

    return () => clearInterval(interval);
  }, [isOpen]);

  // Fullscreen trigger & Auto-start listening on open
  useEffect(() => {
    if (isOpen) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      }
      // Zero-touch: automatically start listening once HUD expands to fullscreen
      const autoListenTimer = setTimeout(() => {
        startRecording();
      }, 700);
      return () => clearTimeout(autoListenTimer);
    } else {
      stopRecording();
    }
  }, [isOpen]);

  // Listen for speech-ended event from SocketContext to automatically re-arm the mic!
  useEffect(() => {
    const handleSpeechEnded = () => {
      if (handsFreeMode && isOpen) {
        // Short pause so microphone does not pick up audio reverb
        setTimeout(() => {
          startRecording();
        }, 600);
      }
    };

    window.addEventListener('jarvis:speech-ended', handleSpeechEnded);
    return () => {
      window.removeEventListener('jarvis:speech-ended', handleSpeechEnded);
    };
  }, [handsFreeMode, isOpen, startRecording]);

  // Sync completed message
  useEffect(() => {
    if (lastCompletedMessage?.content) {
      setLastReply(lastCompletedMessage.content);
    }
  }, [lastCompletedMessage]);

  if (!isOpen) return null;

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

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
    setLastUserPrompt(cmd);
    setLastReply('');
    onSendMessage(cmd, voiceReplyEnabled);
  };

  const handleLaunchApp = async (appName: string, label: string) => {
    setAppLaunchFeedback(`Launching ${label}...`);
    try {
      const res = await systemApi.launchApp(appName);
      setAppLaunchFeedback(res?.message || `Opened ${label}`);
      setTimeout(() => setAppLaunchFeedback(null), 4000);
    } catch (e: any) {
      setAppLaunchFeedback(`Error launching ${label}`);
      setTimeout(() => setAppLaunchFeedback(null), 3000);
    }
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirective.trim()) return;
    setDirectives([newDirective.trim(), ...directives]);
    notesApi.create({ title: newDirective.trim(), content: newDirective.trim() }).catch(() => {});
    setNewDirective('');
    setIsAddingNote(false);
  };

  // Status text based on state
  const getStatusLabel = (state: AssistantState, recording: boolean) => {
    if (recording) return 'STARK CORE LISTENING • RECEIVING VOCAL INPUT (HANDS-FREE)';
    switch (state) {
      case 'LISTENING':
        return 'MICROPHONE ACTIVE • RECEIVING VOCAL FREQUENCY';
      case 'THINKING':
      case 'PROCESSING':
        return 'NEURAL RETRIEVAL & LOCAL SYSTEM EXECUTION...';
      case 'SPEAKING':
        return 'JARVIS SYNTHESIZING NEURAL SPEECH RESPONSE...';
      case 'ERROR':
        return 'COMMUNICATION INTERRUPTED';
      default:
        return handsFreeMode
          ? 'CONTINUOUS HANDS-FREE VOICE READY • SPEAK FREELY'
          : 'ARC REACTOR ONLINE • 100% MAXIMUM POWER • STANDBY';
    }
  };

  const isCyan = starkTheme === 'cyan';
  const neonColor = isCyan ? 'cyan' : 'amber';
  const neonText = isCyan ? 'text-cyan-400' : 'text-yellow-400';
  const neonBorder = isCyan ? 'border-cyan-500/40' : 'border-amber-500/40';
  const neonGlow = isCyan ? 'shadow-[0_0_20px_rgba(6,182,212,0.35)]' : 'shadow-[0_0_20px_rgba(245,158,11,0.35)]';

  // Date formatting
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const monthName = months[currentTime.getMonth()];
  const dayName = days[currentTime.getDay()];
  const dateNum = String(currentTime.getDate()).padStart(2, '0');
  const timeStr = currentTime.toTimeString().split(' ')[0];

  return createPortal(
    <div className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col justify-between bg-black text-slate-100 overflow-hidden select-none font-mono">
      {/* Background Iron Man Suit HUD Graphic - Prominently Highlighted & Perfectly Aligned */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-90 transition-opacity duration-500">
        <svg
          viewBox="0 0 1000 900"
          className="w-full h-full max-w-[1300px] object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.7)]"
          fill="none"
          stroke={isCyan ? '#22d3ee' : '#facc15'}
          strokeWidth="2"
        >
          <defs>
            <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="reactorGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isCyan ? '#67e8f9' : '#fef08a'} stopOpacity="0.8" />
              <stop offset="60%" stopColor={isCyan ? '#06b6d4' : '#eab308'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isCyan ? '#0891b2' : '#ca8a04'} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Outer Helmet Dome & Crown Crest */}
          <path
            d="M 500,25 
               C 435,25 385,65 375,130 
               C 365,185 378,245 405,295 
               L 440,340 L 500,358 L 560,340 L 595,295 
               C 622,245 635,185 625,130 
               C 615,65 565,25 500,25 Z"
            stroke={isCyan ? '#06b6d4' : '#f59e0b'}
            strokeWidth="2.5"
            strokeOpacity="0.95"
          />

          {/* Forehead Chevron Shield */}
          <path d="M 450,75 L 500,95 L 550,75" strokeOpacity="0.8" />
          <path d="M 465,55 L 500,70 L 535,55" strokeOpacity="0.7" />

          {/* Faceplate Contours */}
          <path
            d="M 425,110 C 460,105 540,105 575,110 L 590,185 L 565,275 L 500,320 L 435,275 L 410,185 Z"
            stroke={isCyan ? '#38bdf8' : '#fbbf24'}
            strokeWidth="2.2"
            strokeOpacity="0.9"
          />

          {/* Temple Earpieces */}
          <rect x="355" y="145" width="18" height="42" rx="4" strokeOpacity="0.8" />
          <rect x="627" y="145" width="18" height="42" rx="4" strokeOpacity="0.8" />

          {/* Brow Lines */}
          <path d="M 435,140 L 485,155 L 500,150 L 515,155 L 565,140" strokeWidth="2.2" strokeOpacity="0.95" />

          {/* Glowing Eyes Slits (Prominently Highlighted in Cyan!) */}
          <polygon
            points="432,165 480,175 476,186 430,176"
            fill={isCyan ? '#67e8f9' : '#fef08a'}
            stroke={isCyan ? '#38bdf8' : '#facc15'}
            strokeWidth="1.8"
            filter="url(#eyeGlow)"
            className="animate-pulse"
          />
          <polygon
            points="568,165 520,175 524,186 570,176"
            fill={isCyan ? '#67e8f9' : '#fef08a'}
            stroke={isCyan ? '#38bdf8' : '#facc15'}
            strokeWidth="1.8"
            filter="url(#eyeGlow)"
            className="animate-pulse"
          />

          {/* Nose Bridge & Cheek Vents */}
          <path d="M 488,190 L 500,205 L 512,190" strokeOpacity="0.85" />
          <path d="M 440,215 L 475,228 L 500,224 L 525,228 L 560,215" strokeOpacity="0.8" />
          <path d="M 450,250 L 480,262 L 520,262 L 550,250" strokeOpacity="0.85" />

          {/* Mouth Vent & Chin Plate */}
          <path d="M 470,280 L 500,290 L 530,280" strokeWidth="2" strokeOpacity="0.9" />
          <path d="M 480,305 L 500,312 L 520,305" strokeWidth="2.2" strokeOpacity="0.95" />

          {/* 2. Red / Crimson Collar Conduits (Exact Match to User Reference Image!) */}
          <g stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" opacity="0.95">
            <path d="M 445,345 L 430,395" />
            <path d="M 460,352 L 450,402" />
            <path d="M 478,358 L 472,408" />
            <path d="M 522,358 L 528,408" />
            <path d="M 540,352 L 550,402" />
            <path d="M 555,345 L 570,395" />
          </g>

          {/* 3. Shoulders & Clavicle Armor Plates */}
          <path
            d="M 430,395 L 310,430 L 200,480 L 160,600 L 220,740"
            strokeWidth="2.2"
            strokeOpacity="0.85"
          />
          <path
            d="M 570,395 L 690,430 L 800,480 L 840,600 L 780,740"
            strokeWidth="2.2"
            strokeOpacity="0.85"
          />
          <path d="M 340,420 L 420,490 L 500,520 L 580,490 L 660,420" strokeWidth="2.2" strokeOpacity="0.9" />

          {/* Pectoral Armor Plates tapering around Center Reactor */}
          <path
            d="M 420,490 L 330,570 L 400,680 L 500,650 L 600,680 L 670,570 L 580,490"
            strokeWidth="2"
            strokeOpacity="0.85"
          />

          {/* 4. Center Arc Reactor Chest Housing */}
          <circle cx="500" cy="510" r="70" stroke={isCyan ? '#38bdf8' : '#facc15'} strokeWidth="2" strokeDasharray="8 6" strokeOpacity="0.95" />
          <circle cx="500" cy="510" r="54" stroke={isCyan ? '#67e8f9' : '#fef08a'} strokeWidth="2.5" strokeOpacity="0.95" />
          <circle cx="500" cy="510" r="38" fill="url(#reactorGlow)" stroke={isCyan ? '#a5f3fc' : '#fef9c3'} strokeWidth="2" />
        </svg>
      </div>

      {/* Futuristic Scanline and Ambient Glow Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-15" />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none ${
          isCyan ? 'bg-cyan-500/15' : 'bg-amber-500/15'
        }`}
      />

      {/* TOP HUD BAR */}
      <header className="relative z-20 w-full px-8 py-3.5 flex items-center justify-between border-b border-cyan-900/40 bg-black/60 backdrop-blur-md">
        {/* Left: Stark Logo & Title */}
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-lg ${
              isCyan
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-cyan-500/30'
                : 'bg-amber-950/80 border-yellow-400 text-yellow-300 shadow-amber-500/30'
            }`}
          >
            {isCyan ? <Radio className="h-5 w-5 animate-pulse" /> : <Flame className="h-5 w-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-widest text-white uppercase">
                {isCyan ? 'J.A.R.V.I.S. MK-HUD' : 'STARK ARC CORE MK-85'}
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isCyan
                    ? 'border-cyan-400/50 bg-cyan-950/60 text-cyan-300'
                    : 'border-yellow-400/50 bg-amber-950/60 text-yellow-300'
                }`}
              >
                AUTONOMOUS
              </span>
            </div>
            <p className="text-[11px] text-cyan-500/80 tracking-wider">
              ZERO-TOUCH AMBIENT INTELLIGENCE • LOCAL SYSTEM CONTROL
            </p>
          </div>
        </div>

        {/* Center: Realtime Telemetry Pills */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          {/* Hands-Free VAD Toggle Button */}
          <button
            onClick={() => setHandsFreeMode(!handsFreeMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono transition-all duration-300 shadow-md ${
              handsFreeMode
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
            title="When active, Jarvis continuously listens and responds without pressing any buttons"
          >
            <Mic className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span>HANDS-FREE: {handsFreeMode ? 'AUTOMATIC (VAD)' : 'PUSH TO TALK'}</span>
          </button>

          {/* Spoken Voice Toggle */}
          <button
            onClick={() => setVoiceReplyEnabled(!voiceReplyEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono transition-all ${
              voiceReplyEnabled
                ? isCyan
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                  : 'bg-amber-950/60 border-yellow-400 text-yellow-300'
                : 'bg-slate-900/60 border-slate-700 text-slate-400'
            }`}
          >
            {voiceReplyEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>VOICE: {voiceReplyEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Theme Selector */}
          <button
            onClick={handleToggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono transition-all ${
              isCyan
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                : 'bg-amber-950/60 border-yellow-400 text-yellow-300'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isCyan ? '🔷 CYAN HUD' : '🟡 STARK GOLD'}</span>
          </button>
        </div>

        {/* Right: Fullscreen & Exit HUD */}
        <div className="flex items-center gap-2">
          {appLaunchFeedback && (
            <span className="hidden sm:inline-block px-3 py-1 text-xs rounded border border-cyan-400/60 bg-cyan-950/90 text-cyan-300 animate-pulse">
              ⚡ {appLaunchFeedback}
            </span>
          )}
          <button
            onClick={toggleBrowserFullscreen}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-800/60 transition"
            title="Exit HUD"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN HUD BODY */}
      <main className="relative z-20 flex-1 w-full max-w-[1700px] mx-auto px-6 py-3 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch overflow-hidden">
        {/* ======================================================== */}
        {/* LEFT COLUMN: Circular Clock, Disk Gauge, Power Telemetry */}
        {/* ======================================================== */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-4">
          {/* Top Left: Circular Clock HUD (matching uploaded image!) */}
          <div className="relative p-5 rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col items-center">
            {/* Target Reticle circle */}
            <div className="relative w-44 h-44 rounded-full border-2 border-cyan-500/40 flex flex-col items-center justify-center p-4">
              <div className="absolute inset-1 rounded-full border border-dashed border-cyan-400/30 animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-dotted border-cyan-300/20 animate-[spin_25s_linear_infinite_reverse]" />
              
              <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-bold">
                {monthName}
              </span>
              <span className="text-4xl font-extrabold text-cyan-200 tracking-tight my-0.5 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                {dateNum}
              </span>
              <span className="text-[11px] text-cyan-400 tracking-wider font-semibold">
                {dayName}
              </span>
              <div className="mt-1 flex items-center gap-1 text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40 font-mono">
                <Clock className="h-3 w-3" />
                <span>{timeStr}</span>
              </div>
            </div>

            {/* Sub-telemetry readout */}
            <div className="w-full mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-cyan-400/90 border-b border-cyan-900/40 pb-1">
                <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" /> Full Capacity:</span>
                <span className="font-bold text-white">{telemetry.disk_total_gb} GB</span>
              </div>
              <div className="flex justify-between items-center text-cyan-400/90 border-b border-cyan-900/40 pb-1">
                <span>▶ Primary Storage:</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-cyan-400/90">
                <span>▶ Free Capacity:</span>
                <span className="font-bold text-cyan-200">{telemetry.disk_free_gb} GB</span>
              </div>
            </div>
          </div>

          {/* Middle Left: Power & Arc Battery Gauge */}
          <div className="p-4 rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Battery className="h-4 w-4" /> Power Telemetry
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-bold">
                {telemetry.battery_percent}% {telemetry.battery_plugged ? 'CHARGING' : 'HIGH'}
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-900 border border-cyan-500/40 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                style={{ width: `${telemetry.battery_percent}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-cyan-400/80">
              <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-900/40">
                <span>ARC PWR:</span> <span className="text-white font-bold">1.21 GW</span>
              </div>
              <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-900/40">
                <span>STATUS:</span> <span className="text-emerald-400 font-bold">NOMINAL</span>
              </div>
            </div>
          </div>

          {/* Bottom Left: CPU & Memory diagnostics */}
          <div className="p-4 rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-md text-xs space-y-2">
            <div className="flex items-center justify-between text-cyan-300 font-bold">
              <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> Core CPU:</span>
              <span className="text-white font-mono">{telemetry.cpu_percent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${Math.min(telemetry.cpu_percent, 100)}%` }} />
            </div>

            <div className="flex items-center justify-between text-cyan-300 font-bold pt-1">
              <span>RAM Allocation:</span>
              <span className="text-white font-mono">{telemetry.ram_used_gb} / {telemetry.ram_total_gb} GB</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: `${telemetry.ram_percent}%` }} />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER COLUMN: Concentric Arc Reactor & Dynamic Dialogue */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col items-center justify-between space-y-4">
          {/* Status Radar Banner */}
          <div
            className={`px-4 py-1.5 rounded-full border text-xs tracking-wider flex items-center gap-2 backdrop-blur-md shadow-lg ${
              isRecording
                ? 'bg-rose-950/80 border-rose-400 text-rose-300 shadow-rose-500/20'
                : assistantState === 'SPEAKING'
                ? 'bg-cyan-950/80 border-cyan-300 text-cyan-200 shadow-cyan-500/30'
                : 'bg-black/70 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>{getStatusLabel(assistantState, isRecording)}</span>
          </div>

          {/* Central 3D Concentric Arc Reactor Button */}
          <div className="relative flex items-center justify-center w-60 h-60 sm:w-64 sm:h-64 my-auto">
            {/* Reticle crosshair lines */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />

            {/* Calibration degree markers */}
            <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/80 tracking-widest">▲ 000° ARC</span>
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/80 tracking-widest">▼ 180° PWR</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/80 tracking-widest">◀ 270°</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-mono text-cyan-400/80 tracking-widest">090° ▶</span>

            {/* Outer segmented rotating HUD ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-1000 ${
                isRecording
                  ? 'border-rose-400 animate-[spin_4s_linear_infinite]'
                  : assistantState === 'SPEAKING'
                  ? 'border-cyan-300 animate-[spin_6s_linear_infinite]'
                  : 'border-cyan-500/40 animate-[spin_20s_linear_infinite]'
              }`}
            />

            {/* Middle counter-rotating notched ring */}
            <div
              className={`absolute inset-5 rounded-full border transition-all duration-1000 ${
                isRecording
                  ? 'border-rose-500/60 animate-[spin_3s_linear_infinite_reverse]'
                  : 'border-cyan-400/30 border-dotted animate-[spin_12s_linear_infinite_reverse]'
              }`}
            />

            {/* Core push / listening reactor core */}
            <button
              onClick={handleToggleVoice}
              className={`group relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl focus:outline-none ${
                isRecording
                  ? 'bg-gradient-to-tr from-rose-700 via-rose-600 to-amber-500 shadow-rose-500/70 ring-8 ring-rose-500/30 scale-105'
                  : assistantState === 'SPEAKING'
                  ? 'bg-gradient-to-tr from-cyan-600 via-teal-500 to-cyan-300 shadow-cyan-400/80 ring-8 ring-cyan-400/40 scale-105'
                  : assistantState === 'THINKING' || assistantState === 'PROCESSING'
                  ? 'bg-gradient-to-tr from-cyan-700 via-blue-600 to-indigo-600 shadow-cyan-500/50 animate-pulse ring-8 ring-cyan-500/30'
                  : 'bg-gradient-to-tr from-slate-950 via-cyan-950 to-slate-900 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:scale-105 hover:border-cyan-300'
              }`}
            >
              <div className="mb-1">
                {isRecording ? (
                  <MicOff className="h-12 w-12 text-white animate-bounce" />
                ) : assistantState === 'THINKING' ? (
                  <Sparkles className="h-12 w-12 animate-spin text-cyan-200" />
                ) : (
                  <Mic className="h-12 w-12 text-cyan-300 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                )}
              </div>

              <span className="text-[11px] uppercase tracking-wider font-bold text-white drop-shadow-md">
                {isRecording
                  ? 'LISTENING'
                  : isStreaming
                  ? 'SPEAKING'
                  : handsFreeMode
                  ? 'HANDS-FREE ON'
                  : 'TAP TO TALK'}
              </span>

              <span className="text-[9px] text-cyan-300/80 mt-0.5">
                {isRecording ? 'Pause to send' : handsFreeMode ? 'Zero-Touch' : 'Stark Link'}
              </span>
            </button>
          </div>

          {/* Audio Waveform visualization */}
          <div className="w-full max-w-md">
            <VoiceWaveform
              active={isRecording || assistantState === 'SPEAKING'}
              state={assistantState}
              color={starkTheme}
            />
          </div>

          {/* Dynamic Holographic Dialogue & Subtitles Console */}
          <div className="w-full max-w-2xl min-h-[140px] max-h-48 overflow-y-auto px-6 py-4 rounded-2xl border border-cyan-500/40 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col justify-start">
            {/* Console Header */}
            <div className="flex items-center justify-between text-[10px] text-cyan-500/80 border-b border-cyan-900/60 pb-1.5 mb-2 font-mono">
              <span>// HOLOGRAPHIC TRANSCEIVER CHANNEL: 142.85 MHz</span>
              <span className="text-emerald-400 flex items-center gap-1">● ENCRYPTED LINK</span>
            </div>

            {/* User speech line */}
            {(interimTranscript || voiceTranscript || lastUserPrompt) && (
              <div className="mb-2">
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold mr-2">
                  YOU:
                </span>
                <span className="text-xs text-cyan-100 font-mono">
                  "{interimTranscript || voiceTranscript || lastUserPrompt}"
                </span>
              </div>
            )}

            {/* Jarvis response line */}
            {currentStreamText || lastReply ? (
              <div className="text-sm text-slate-100 font-sans leading-relaxed">
                <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold font-mono mr-2">
                  JARVIS:
                </span>
                <span className="font-medium text-slate-100">
                  {currentStreamText || lastReply}
                </span>
              </div>
            ) : isStreaming ? (
              <div className="text-xs text-cyan-400 font-mono animate-pulse">
                <span>JARVIS: Synthesizing real-time neural answer...</span>
              </div>
            ) : !interimTranscript && !voiceTranscript ? (
              <div className="text-xs text-cyan-400/80 font-mono italic my-auto">
                "All systems nominal, boss. Speak naturally without touching anything — I am listening."
              </div>
            ) : null}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Quick System Launchers & Mission Notes Card */}
        {/* ======================================================== */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between space-y-4">
          {/* Quick System Launchers (Matching reference image links!) */}
          <div className="p-4 rounded-2xl border border-cyan-500/30 bg-black/60 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between mb-3 text-xs text-cyan-400 font-bold border-b border-cyan-900/60 pb-1.5">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> SYSTEM CONTROL</span>
              <span className="text-[10px] text-cyan-500">WIN-EXEC</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleLaunchApp('vs code', 'VS Code')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <Code2 className="h-4 w-4 text-cyan-400" />
                <span>VS Code</span>
              </button>

              <button
                onClick={() => handleLaunchApp('whatsapp', 'WhatsApp')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleLaunchApp('chrome', 'Chrome')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <Globe className="h-4 w-4 text-blue-400" />
                <span>Chrome</span>
              </button>

              <button
                onClick={() => handleLaunchApp('notepad', 'Notepad')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <FileText className="h-4 w-4 text-yellow-400" />
                <span>Notepad</span>
              </button>

              <button
                onClick={() => handleLaunchApp('calculator', 'Calculator')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <Calculator className="h-4 w-4 text-purple-400" />
                <span>Calculator</span>
              </button>

              <button
                onClick={() => handleLaunchApp('spotify', 'Spotify')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <Music2 className="h-4 w-4 text-green-400" />
                <span>Spotify</span>
              </button>

              <button
                onClick={() => handleLaunchApp('youtube', 'YouTube')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <Tv className="h-4 w-4 text-red-400" />
                <span>YouTube</span>
              </button>

              <button
                onClick={() => handleLaunchApp('explorer', 'Files')}
                className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 hover:border-cyan-400 text-cyan-200 transition"
              >
                <FolderOpen className="h-4 w-4 text-amber-400" />
                <span>Files</span>
              </button>

              <button
                onClick={() => handleLaunchApp('lock pc', 'Lock Screen')}
                className="flex items-center gap-2 p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 hover:border-red-400 text-red-300 transition"
              >
                <Lock className="h-4 w-4 text-red-400" />
                <span>Lock PC</span>
              </button>

              <button
                onClick={() => handleLaunchApp('mute', 'Mute')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
              >
                <VolumeX className="h-4 w-4 text-slate-400" />
                <span>Mute Audio</span>
              </button>
            </div>
          </div>

          {/* Notes / Mission Directives HUD Box (exact match to reference image!) */}
          <div className="relative p-4 rounded-2xl border-2 border-cyan-400/60 bg-black/75 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)] flex flex-col justify-between flex-1 max-h-[310px]">
            {/* Corner Bracket Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/40 pb-2 mb-2">
              <span className="text-xs uppercase font-extrabold text-cyan-300 tracking-widest">
                [ NOTES & DIRECTIVES ]
              </span>
              <button
                onClick={() => setIsAddingNote(!isAddingNote)}
                className="p-1 rounded hover:bg-cyan-950 text-cyan-400 border border-cyan-500/40 transition"
                title="Add quick directive"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Inline Note Creator */}
            {isAddingNote && (
              <form onSubmit={handleAddDirective} className="mb-2 flex items-center gap-1">
                <input
                  type="text"
                  value={newDirective}
                  onChange={(e) => setNewDirective(e.target.value)}
                  placeholder="New directive..."
                  className="w-full px-2 py-1 text-xs bg-slate-950 border border-cyan-500/50 rounded text-cyan-200 focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="p-1 bg-cyan-600 text-white rounded">
                  <Send className="h-3 w-3" />
                </button>
              </form>
            )}

            {/* List of notes matching the styling from Iron Man reference image */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs text-cyan-300/90 font-mono">
              {directives.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-cyan-400 font-bold">-</span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-cyan-900/60 flex justify-between text-[10px] text-cyan-500/70">
              <span>SYSTEM: SYNCED</span>
              <span>SUPABASE PG</span>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM QUICK COMMANDS BAR */}
      <footer className="relative z-20 w-full px-8 py-3 bg-black/60 backdrop-blur-md border-t border-cyan-900/40">
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
          {[
            'Open WhatsApp',
            'Open VS Code',
            'System status report',
            'Open YouTube',
            'What is our storage capacity?',
            'Lock PC',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleQuickCommand(prompt)}
              className="px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 text-xs font-mono bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/40 hover:border-cyan-400 text-cyan-200 shadow-md"
            >
              <Zap className="h-3 w-3 text-cyan-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>,
    document.body
  );
};
