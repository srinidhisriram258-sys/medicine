import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskBadge({ level = "UNKNOWN", confidence = 0.0, showConfidence = true }) {
  if (level === 'LOW') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>LOW ADHERENCE RISK</span>
        {showConfidence && confidence > 0 && (
          <span className="ml-1 opacity-75">({(confidence * 100).toFixed(0)}%)</span>
        )}
      </div>
    );
  }

  if (level === 'MEDIUM') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/40 text-[#FBBF24] text-xs font-mono font-semibold shadow-[0_0_15px_rgba(251,191,36,0.15)]">
        <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
        <span>MEDIUM ADHERENCE RISK</span>
        {showConfidence && confidence > 0 && (
          <span className="ml-1 opacity-75">({(confidence * 100).toFixed(0)}%)</span>
        )}
      </div>
    );
  }

  if (level === 'HIGH') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-mono font-semibold shadow-[0_0_15px_rgba(239,68,68,0.2)]">
        <AlertOctagon className="w-4 h-4 text-red-400 animate-pulse" />
        <span>HIGH ADHERENCE RISK</span>
        {showConfidence && confidence > 0 && (
          <span className="ml-1 opacity-75">({(confidence * 100).toFixed(0)}%)</span>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono">
      <AlertTriangle className="w-4 h-4 text-slate-400" />
      <span>AI MODEL NOT READY</span>
    </div>
  );
}
