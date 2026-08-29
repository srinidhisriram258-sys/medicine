import React from 'react';
import { Pill, CheckCircle2, XCircle, Clock, Lock, ArrowRight, Activity, PlusCircle, ShieldCheck } from 'lucide-react';
import Stethoscope3D from '../components/Stethoscope3D';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard({
  stats,
  aiPrediction,
  reminders,
  onMarkTaken,
  onMarkMissed,
  onSnooze,
  onNavigate,
  vaultUnlocked,
  onOpenVault
}) {
  // Dynamically filter ONLY future/grace-period pending doses for Next Scheduled Medicine
  const now = new Date();
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);

  const pendingDoses = (reminders || [])
    .filter(r => r.status === 'pending' && new Date(r.scheduled_for) >= thirtyMinAgo)
    .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));

  const nextReminder = pendingDoses[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* DASHBOARD HERO — CLEAN PATIENT GREETING */}
      <div className="relative rounded-3xl glass-panel-glow p-8 overflow-hidden border border-[#38BDF8]/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#38BDF8]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#A855F7]/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-xs font-mono text-[#38BDF8] font-semibold">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              AI-POWERED MEDICATION REMINDER PLATFORM
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Good Day, John!
            </h1>

            <p className="text-sm text-slate-300 font-light max-w-xl leading-relaxed">
              Welcome to your personal medication adherence dashboard. Your next upcoming prescription dose is displayed below with real-time push controls.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (vaultUnlocked) onNavigate('medicines');
                  else onOpenVault();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
              >
                {vaultUnlocked ? <PlusCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                VIEW TODAY'S MEDICINES
              </button>

              <button
                onClick={() => {
                  if (vaultUnlocked) onNavigate('adherence');
                  else onOpenVault();
                }}
                className="px-6 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white font-semibold text-sm hover:border-[#38BDF8]/50 hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                ADHERENCE STATS
                <ArrowRight className="w-4 h-4 text-[#38BDF8]" />
              </button>
            </div>
          </div>

          {/* 3D MEDICAL VISUAL */}
          <div className="lg:col-span-1 h-[220px]">
            <Stethoscope3D />
          </div>

        </div>
      </div>

      {/* CLEAN DASHBOARD SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Today's Adherence"
          value={`${stats?.today_adherence || 100}%`}
          subtitle="7-Day Rate"
          icon={Activity}
          color="sky"
        />

        <StatCard
          title="Doses Taken"
          value={stats?.total_taken || 0}
          subtitle="On-time & Delayed"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Doses Missed"
          value={stats?.total_missed || 0}
          subtitle="Unacknowledged Doses"
          icon={XCircle}
          color="rose"
        />

        {/* AI RISK BADGE CARD */}
        <div className="p-5 rounded-2xl glass-card border border-[#38BDF8]/30 flex flex-col justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">AI Risk Status</span>
          <div className="my-2">
            <RiskBadge
              level={aiPrediction?.risk_level}
              confidence={aiPrediction?.confidence}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {aiPrediction?.model_status === 'loaded' ? `Softmax: ${(aiPrediction?.confidence * 100).toFixed(0)}%` : 'Model Not Ready'}
          </span>
        </div>
      </div>

      {/* NEXT SCHEDULED DOSE ACTION CARD */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">NEXT SCHEDULED MEDICINE</h3>
              <p className="text-xs text-slate-400 font-mono">Dynamic Real-Time Dose Reminder</p>
            </div>
          </div>

          {nextReminder && (
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-[#38BDF8]">
              {nextReminder.status.toUpperCase()}
            </span>
          )}
        </div>

        {nextReminder ? (
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xl font-bold text-white">{nextReminder.medicine_name}</h4>
              <p className="text-sm text-[#38BDF8] font-mono mt-0.5">Dosage: {nextReminder.dosage}</p>
              <p className="text-xs text-slate-400 mt-2">
                Scheduled For: <strong className="text-slate-200">{new Date(nextReminder.scheduled_for).toLocaleString()}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onMarkTaken(nextReminder.id)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                TAKEN
              </button>

              <button
                onClick={() => onMarkMissed(nextReminder.id)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                MISSED
              </button>

              <button
                onClick={() => onSnooze(nextReminder.id)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-[#FBBF24]" />
                SNOOZE (15m)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-mono text-sm">
            No upcoming pending reminders due right now.
          </div>
        )}
      </div>

      {/* PATIENT MEDICATION VAULT NOTICE */}
      {!vaultUnlocked && (
        <div className="p-6 rounded-2xl glass-panel border border-[#38BDF8]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">PATIENT MEDICATION VAULT PROTECTED</h4>
              <p className="text-xs text-slate-400 font-mono">
                Full prescription history and clinical notes require PIN authentication.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenVault}
            className="px-5 py-2.5 rounded-xl bg-[#38BDF8] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            UNLOCK VAULT (PIN: 1234)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
