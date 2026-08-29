import React from 'react';
import { Clock, CheckCircle2, XCircle, Pill, Calendar } from 'lucide-react';

export default function TodaysDoses({ reminders, onMarkTaken, onMarkMissed, onSnooze }) {
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  // Filter today's reminders
  const todayReminders = (reminders || []).filter(r => {
    const rDate = new Date(r.scheduled_for).toDateString();
    return rDate === new Date().toDateString();
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div className="glass-panel p-6 rounded-2xl border border-[#00D2FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/30 text-xs font-mono text-[#00D2FF] font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            TODAY'S SCHEDULE
          </div>
          <h2 className="text-2xl font-black text-white">Today's Prescribed Doses</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">{todayStr}</p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
          Total Today: <strong className="text-[#00D2FF]">{todayReminders.length} Doses</strong>
        </div>
      </div>

      {todayReminders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {todayReminders.map((rem) => {
            const isTaken = rem.status === 'taken';
            const isMissed = rem.status === 'missed';
            const isPending = rem.status === 'pending';

            return (
              <div
                key={rem.id}
                className={`p-6 rounded-2xl glass-card border transition-all space-y-4 ${
                  isTaken ? 'border-emerald-500/40 bg-emerald-500/5' :
                  isMissed ? 'border-rose-500/40 bg-rose-500/5' :
                  'border-[#00D2FF]/40 bg-[#00D2FF]/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${
                      isTaken ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      isMissed ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                      'bg-[#00D2FF]/10 border-[#00D2FF]/30 text-[#00D2FF]'
                    }`}>
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{rem.medicine_name}</h3>
                      <p className="text-xs font-mono text-[#00D2FF]">Dosage: {rem.dosage}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    isTaken ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    isMissed ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30'
                  }`}>
                    {rem.status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Scheduled: <strong className="text-slate-200">{new Date(rem.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  {rem.taken_at && <span className="text-emerald-400">Taken: {new Date(rem.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onMarkTaken(rem.id)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      TAKEN
                    </button>

                    <button
                      onClick={() => onMarkMissed(rem.id)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      MISSED
                    </button>

                    <button
                      onClick={() => onSnooze(rem.id)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Clock className="w-4 h-4 text-[#FFD700]" />
                      SNOOZE
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 text-slate-400 font-mono text-sm">
          No prescribed doses scheduled for today.
        </div>
      )}

    </div>
  );
}
