import React, { useState } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';

export default function Reminders({ reminders, onMarkTaken, onMarkMissed, onSnooze }) {
  const [filter, setFilter] = useState('ALL');

  const filteredReminders = reminders?.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status.toUpperCase() === filter;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#38BDF8]" />
            Live Reminders Timeline & Status
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time medication schedule alerts and dose log controls.
          </p>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {['ALL', 'PENDING', 'TAKEN', 'MISSED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                filter === f
                  ? 'bg-[#38BDF8] text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* REMINDERS TIMELINE GRID */}
      <div className="space-y-3">
        {filteredReminders?.map((r) => (
          <div
            key={r.id}
            className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl border ${
                r.status === 'taken' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                r.status === 'missed' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]'
              }`}>
                {r.status === 'taken' ? <CheckCircle2 className="w-5 h-5" /> :
                 r.status === 'missed' ? <XCircle className="w-5 h-5" /> :
                 <Clock className="w-5 h-5 animate-pulse" />}
              </div>

              <div>
                <h4 className="font-bold text-white text-base">{r.medicine_name}</h4>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                  <span>Dosage: <strong className="text-slate-200">{r.dosage}</strong></span>
                  <span>•</span>
                  <span>Scheduled: <strong className="text-[#38BDF8]">{new Date(r.scheduled_for).toLocaleString()}</strong></span>
                </div>
                {r.delay_minutes > 0 && r.status === 'taken' && (
                  <p className="text-[11px] font-mono text-[#FBBF24] mt-1">
                    Recorded Delay: {r.delay_minutes.toFixed(0)} minutes
                  </p>
                )}
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {r.status !== 'taken' && (
                <button
                  onClick={() => onMarkTaken(r.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  TAKEN
                </button>
              )}

              {r.status !== 'missed' && (
                <button
                  onClick={() => onMarkMissed(r.id)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs transition-all active:scale-95 flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  MISSED
                </button>
              )}

              {r.status === 'pending' && (
                <button
                  onClick={() => onSnooze(r.id)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95 flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
                  SNOOZE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
