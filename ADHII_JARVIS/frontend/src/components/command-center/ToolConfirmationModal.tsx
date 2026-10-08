import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Check, X, Clock } from 'lucide-react';
import { PendingConfirmation } from './types';

interface ToolConfirmationModalProps {
  confirmation: PendingConfirmation | null;
  onConfirm: (commandId: string) => void;
  onCancel: (commandId: string) => void;
}

export const ToolConfirmationModal: React.FC<ToolConfirmationModalProps> = ({
  confirmation,
  onConfirm,
  onCancel,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(15);

  useEffect(() => {
    if (!confirmation) {
      setSecondsRemaining(15);
      return;
    }

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((confirmation.expires_at - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        onCancel(confirmation.command_id);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [confirmation, onCancel]);

  if (!confirmation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0b1322] border-2 border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col gap-4 font-mono select-none">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-white tracking-widest uppercase">
              ACTION CONFIRMATION REQUEST
            </h3>
            <span className="text-[11px] text-red-400/90 font-semibold">
              SECURITY PROTOCOL RESTRICTED
            </span>
          </div>
        </div>

        {/* DETAILS */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-red-900/40 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Action:</span>
            <span className="text-white font-bold capitalize">
              {confirmation.action === 'lock' ? 'Lock Windows PC' : confirmation.action}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Target Device:</span>
            <span className="text-cyan-300 font-bold">{confirmation.device_id}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tool Handler:</span>
            <span className="text-slate-200">{confirmation.tool}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
            {confirmation.message}
          </div>
        </div>

        {/* COUNTDOWN TIMER */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            Auto-cancel in:
          </span>
          <span className="font-bold text-white text-sm">{secondsRemaining}s</span>
        </div>

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onCancel(confirmation.command_id)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs tracking-wider transition"
          >
            <X className="w-4 h-4" />
            <span>CANCEL</span>
          </button>

          <button
            onClick={() => onConfirm(confirmation.command_id)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition"
          >
            <Check className="w-4 h-4" />
            <span>CONFIRM EXECUTION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
