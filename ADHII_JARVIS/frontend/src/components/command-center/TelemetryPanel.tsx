import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Cpu,
  Zap,
  Clock,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';
import { TelemetryData } from './types';

interface TelemetryPanelProps {
  telemetry: TelemetryData | null;
  desktopConnected: boolean;
  lastHeartbeatSecondsAgo: number;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  telemetry,
  desktopConnected,
  lastHeartbeatSecondsAgo,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticker every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedMonth = currentTime.toLocaleString('en-US', { month: 'long' }).toUpperCase();
  const formattedDay = currentTime.getDate().toString().padStart(2, '0');
  const formattedWeekday = currentTime.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
  const formattedTime = currentTime.toTimeString().split(' ')[0];

  return (
    <aside className="w-full flex flex-col gap-4 text-slate-200 select-none">
      {/* SECTION A — DATE / TIME CIRCULAR HUD WIDGET */}
      <div className="relative p-5 rounded-2xl bg-[#09111f]/80 border border-cyan-500/25 shadow-[0_0_20px_rgba(6,182,212,0.08)] overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_0.75px,transparent_0.75px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center">
          {/* Luminous Circular HUD Gauge */}
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.2)] bg-gradient-to-b from-cyan-950/20 to-slate-950/60 mb-3">
            {/* Outer Dotted Rotating Ring */}
            <div className="absolute inset-1 rounded-full border-2 border-dashed border-cyan-400/30 animate-[spin_40s_linear_infinite]" />
            {/* Inner Glowing Ring */}
            <div className="absolute inset-3 rounded-full border border-cyan-400/20" />

            <div className="flex flex-col items-center text-center z-10">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400/90 uppercase font-semibold">
                {formattedMonth}
              </span>
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight leading-tight my-0.5 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                {formattedDay}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
                {formattedWeekday}
              </span>
            </div>
          </div>

          {/* Digital Time HUD pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wider">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* SECTION B — STORAGE METRICS */}
      <div className="p-4 rounded-2xl bg-[#09111f]/80 border border-cyan-500/20 shadow-md">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white tracking-wider">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>PRIMARY STORAGE</span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              desktopConnected && telemetry?.disk_total_gb
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-900/60 text-slate-500'
            }`}
          >
            {desktopConnected && telemetry?.disk_total_gb ? 'ONLINE' : 'UNAVAILABLE'}
          </span>
        </div>

        {desktopConnected && telemetry ? (
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Full Capacity:
              </span>
              <span className="text-white font-bold">{telemetry.disk_total_gb} GB</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Used Capacity:
              </span>
              <span className="text-white font-bold">{telemetry.disk_used_gb} GB</span>
            </div>

            <div className="flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Free Capacity:
              </span>
              <span className="text-emerald-400 font-bold">{telemetry.disk_free_gb} GB</span>
            </div>

            {/* Visual Storage Meter Bar */}
            <div className="mt-2.5">
              <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_10px_#06b6d4] transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, telemetry.disk_percent))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 GB</span>
                <span>{telemetry.disk_percent}% USED</span>
                <span>{telemetry.disk_total_gb} GB</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs font-mono text-slate-500">
            Storage metrics require Desktop Companion
          </div>
        )}
      </div>

      {/* SECTION C — POWER & TELEMETRY */}
      <div className="p-4 rounded-2xl bg-[#09111f]/80 border border-cyan-500/20 shadow-md space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>POWER TELEMETRY</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300">
            {desktopConnected && telemetry?.charging ? 'CHARGING' : 'NOMINAL'}
          </span>
        </div>

        {desktopConnected && telemetry ? (
          <>
            {/* Battery bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Battery Level:</span>
                <span className="text-white font-bold">{telemetry.battery_percent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    telemetry.battery_percent > 30
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_8px_#10b981]'
                      : 'bg-gradient-to-r from-rose-500 to-amber-500 shadow-[0_0_8px_#f43f5e]'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, telemetry.battery_percent))}%` }}
                />
              </div>
            </div>

            {/* Core CPU Meter */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Core CPU:
                </span>
                <span className="text-white font-bold">{telemetry.cpu_percent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#06b6d4] transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, telemetry.cpu_percent))}%` }}
                />
              </div>
            </div>

            {/* RAM Allocation Meter */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  RAM Allocation:
                </span>
                <span className="text-white font-bold">
                  {telemetry.ram_used_gb} / {telemetry.ram_total_gb} GB
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 shadow-[0_0_8px_#6366f1] transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, telemetry.ram_percent))}%` }}
                />
              </div>
            </div>

            {/* Uptime and process info */}
            <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[11px] font-mono text-slate-400">
              <span>System Uptime:</span>
              <span className="text-cyan-300 font-semibold">{telemetry.uptime_formatted}</span>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-xs font-mono text-slate-500 flex flex-col items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500/70" />
            <span>Desktop Agent is currently offline.</span>
            <span className="text-[10px] text-slate-600">
              Run the desktop companion to view live hardware metrics.
            </span>
          </div>
        )}
      </div>

      {/* SECTION D — DEVICE DETAILS & HEARTBEAT */}
      <div className="p-3.5 rounded-2xl bg-[#09111f]/60 border border-slate-800 text-[11px] font-mono space-y-1.5">
        <div className="flex justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            Desktop Device:
          </span>
          <span className="text-white font-semibold">
            {telemetry?.device_id || 'DESKTOP-01'}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Operating System:</span>
          <span className="text-slate-200">{telemetry?.os || 'Windows'}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Agent Status:</span>
          <span className={desktopConnected ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
            {desktopConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-800/60">
          <span>Last Heartbeat:</span>
          <span>
            {desktopConnected ? `${lastHeartbeatSecondsAgo}s ago` : 'No signal'}
          </span>
        </div>
      </div>
    </aside>
  );
};
