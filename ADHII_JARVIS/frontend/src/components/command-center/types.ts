export type AssistantState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'TRANSCRIBING'
  | 'THINKING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'ERROR';

export interface TelemetryData {
  status: string;
  device_id: string;
  os: string;
  agent_connected: boolean;
  cpu_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  ram_percent: number;
  disk_used_gb: number;
  disk_free_gb: number;
  disk_total_gb: number;
  disk_percent: number;
  battery_percent: number;
  charging: boolean;
  uptime_seconds: number;
  uptime_formatted: string;
  process_count?: number;
  last_heartbeat: string;
}

export interface DesktopStatus {
  status: string;
  device_id: string;
  os: string;
  agent_connected: boolean;
  last_heartbeat: string;
}

export interface SpotifyTrackState {
  connected: boolean;
  playing: boolean;
  track?: string;
  artist?: string;
  album?: string;
  album_art?: string;
  progress_ms?: number;
  duration_ms?: number;
  device?: string;
}

export interface NoteDirective {
  id: string;
  title: string;
  completed: boolean;
  created_at?: string;
}

export interface TerminalMessage {
  id: string;
  sender: 'YOU' | 'JARVIS';
  text: string;
  toolName?: string;
  toolStatus?: 'running' | 'success' | 'error';
  timestamp: string;
}

export interface PendingConfirmation {
  command_id: string;
  tool: string;
  action: string;
  parameters?: Record<string, any>;
  message: string;
  device_id: string;
  expires_at: number; // timestamp
}
