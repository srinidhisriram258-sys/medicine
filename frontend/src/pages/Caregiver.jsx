import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, HeartPulse, Clock, AlertTriangle, User } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Caregiver() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCaregiverOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center font-mono text-slate-400">
        Loading Caregiver Patient Overview...
      </div>
    );
  }

  const patient = data?.patient;
  const adherence = data?.adherence;
  const aiRisk = data?.ai_risk;
  const history = data?.recent_history || [];

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#38BDF8]" />
            Caregiver Monitoring Command Center
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Remote adherence oversight with strict privacy controls (No diagnosis/clinical data exposed).
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          PRIVACY & SAFETY COMPLIANT
        </div>
      </div>

      {/* PATIENT PROFILE CARD */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#A855F7] p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-7 h-7 text-[#38BDF8]" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{patient?.name || 'John Doe'}</h3>
            <p className="text-xs font-mono text-slate-400">{patient?.email}</p>
            <span className="text-xs font-mono text-[#38BDF8] mt-1 inline-block">
              {patient?.total_medicines} Registered Prescriptions
            </span>
          </div>
        </div>

        <RiskBadge
          level={aiRisk?.risk_level}
          confidence={aiRisk?.confidence}
        />
      </div>

      {/* PATIENT ADHERENCE STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400">Weekly Adherence Rate</span>
          <div className="text-3xl font-extrabold text-white">{adherence?.weekly_adherence}%</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400">Monthly Adherence Rate</span>
          <div className="text-3xl font-extrabold text-white">{adherence?.monthly_adherence}%</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400">Total Missed Doses</span>
          <div className="text-3xl font-extrabold text-rose-400">{adherence?.missed_today}</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-xs font-mono text-slate-400">Consecutive Misses</span>
          <div className="text-3xl font-extrabold text-[#FBBF24]">{adherence?.consecutive_missed}</div>
        </div>
      </div>

      {/* RECENT PATIENT HISTORY LOG FOR CAREGIVER */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Recent Patient Adherence Events</h3>
        <div className="space-y-2">
          {history?.map((h) => (
            <div key={h.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-white font-bold">{h.medicine_name}</span>
                <span className="text-slate-500 ml-3">{new Date(h.scheduled_for).toLocaleString()}</span>
              </div>
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                h.status === 'taken' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                h.status === 'missed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30'
              }`}>
                {h.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
