import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ShieldAlert, CheckCircle, Clock, Wrench } from 'lucide-react';
import { settingsApi } from '../api/client';

export const ToolActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await settingsApi.getToolActivity();
        setActivities(data);
      } catch (e) {
        console.error('Error fetching tool activity:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Activity className="h-6 w-6 text-cyan-400" />
          <span>AI Tool Activity & Transparency Audit</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete, tamper-evident log of all tool calls, safety gates, and state modifications.
        </p>
      </div>

      {/* Safety Policy Callout */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          <strong>Security Protocol:</strong> Read-only tools (calculator, date/time, weather, search, document retrieval) execute immediately. All state-mutating actions (tasks, notes, reminders) require user confirmation cards before database commits.
        </p>
      </div>

      {/* Activity Table / Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading audit log...</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-jarvis-card/40 border border-slate-800 text-slate-500 text-xs">
            No tool activity logged yet. Try asking: "What is 18% of 42000?" or "Create a task..." in chat.
          </div>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-2xl bg-jarvis-card/80 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex-shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-white uppercase text-[11px]">
                      {act.tool_name}
                    </span>
                    {act.requires_confirmation ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        Confirmation Gated
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Safe Read-Only
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 font-medium truncate">{act.request_summary}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px] self-end sm:self-auto flex-shrink-0">
                <span
                  className={`px-2 py-0.5 rounded capitalize ${
                    act.status === 'executed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : act.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {act.status}
                </span>
                <span className="text-slate-500">
                  {new Date(act.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
