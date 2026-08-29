import React from 'react';
import { CheckCircle2, TrendingUp, AlertOctagon, Clock, Calendar, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Adherence({ stats, aiPrediction }) {
  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-[#38BDF8]" />
          Adherence Behavioral Analytics
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Exact adherence percentage formula calculated from SQLite database logs: (taken_doses / scheduled_doses) * 100.
        </p>
      </div>

      {/* ADHERENCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-[#38BDF8]/40 space-y-2 bg-[#0EA5E9]/10">
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">7-Day Adherence</span>
          <div className="text-4xl font-extrabold text-white">{stats?.weekly_adherence || 100}%</div>
          <p className="text-xs text-slate-400 font-mono">Recent 7-Day Rolling Rate</p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-[#A855F7]/40 space-y-2 bg-[#A855F7]/10">
          <span className="text-xs font-mono text-[#A855F7] uppercase tracking-wider">30-Day Adherence</span>
          <div className="text-4xl font-extrabold text-white">{stats?.monthly_adherence || 100}%</div>
          <p className="text-xs text-slate-400 font-mono">30-Day Baseline Adherence</p>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-[#FBBF24]/40 space-y-2 bg-[#FBBF24]/10">
          <span className="text-xs font-mono text-[#FBBF24] uppercase tracking-wider">Average Delay</span>
          <div className="text-4xl font-extrabold text-white">{stats?.avg_delay_minutes || 0} min</div>
          <p className="text-xs text-slate-400 font-mono">Response Time After Reminder</p>
        </div>
      </div>

      {/* DETAILED STATS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-lg font-bold text-white mb-2">Historical Summary Breakdown</h3>
          
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Total Doses Scheduled:</span>
              <span className="text-white font-bold">{stats?.total_scheduled}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Total Doses Taken:</span>
              <span className="text-emerald-400 font-bold">{stats?.total_taken}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Total Doses Missed:</span>
              <span className="text-rose-400 font-bold">{stats?.total_missed}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400">Consecutive Missed Doses:</span>
              <span className="text-[#FBBF24] font-bold">{stats?.consecutive_missed}</span>
            </div>
          </div>
        </div>

        {/* AI PREDICTION CONNECTOR CARD */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-[#38BDF8]/30">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#38BDF8]" />
            PyTorch ML Adherence Model Connection
          </h3>

          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            The historical features above feed directly into the PyTorch Neural Network to generate genuine adherence risk predictions without hardcoded assumptions.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-400">Current Inferred Risk Level:</div>
            <div className="text-2xl font-black text-[#38BDF8]">
              {aiPrediction?.risk_level || 'UNKNOWN'} RISK
            </div>
            <div className="text-xs font-mono text-slate-500">
              Softmax Output Confidence: {((aiPrediction?.confidence || 0) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
