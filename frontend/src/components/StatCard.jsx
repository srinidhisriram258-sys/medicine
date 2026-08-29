import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'sky', trend }) {
  const colorMap = {
    sky: 'border-[#38BDF8]/30 text-[#38BDF8] bg-[#0EA5E9]/10 shadow-[0_0_20px_rgba(56,189,248,0.1)]',
    gold: 'border-[#FBBF24]/30 text-[#FBBF24] bg-[#FBBF24]/10 shadow-[0_0_20px_rgba(251,191,36,0.1)]',
    purple: 'border-[#A855F7]/30 text-[#A855F7] bg-[#A855F7]/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
  };

  return (
    <div className={`p-5 rounded-2xl glass-card relative overflow-hidden flex flex-col justify-between border ${colorMap[color] || colorMap.sky}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="my-3">
        <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-mono">{subtitle}</p>}
      </div>

      {trend && (
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 border-t border-white/5 pt-2">
          {trend}
        </div>
      )}
    </div>
  );
}
