import React from 'react';
import { ShieldAlert, Check, X, Wrench } from 'lucide-react';

interface Props {
  activityId: string;
  toolName: string;
  summary: string;
  parameters: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ToolConfirmationCard: React.FC<Props> = ({
  toolName,
  summary,
  parameters,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="my-4 p-5 rounded-2xl bg-gradient-to-br from-jarvis-card to-jarvis-surface border border-amber-500/40 shadow-xl shadow-amber-500/5 max-w-lg">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
              Action Confirmation Required
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              {toolName}
            </span>
          </div>
          <h4 className="text-base font-semibold text-white mt-0.5">{summary}</h4>
        </div>
      </div>

      {parameters && Object.keys(parameters).length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
          {Object.entries(parameters).map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="text-cyan-400">{key}:</span>
              <span className="text-slate-200 truncate">{String(val)}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mb-4">
        Adhii Jarvis requires your explicit authorization before modifying stored data.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onConfirm}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Check className="h-4 w-4" />
          Authorize & Execute
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 transition-all duration-200 active:scale-95"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};
