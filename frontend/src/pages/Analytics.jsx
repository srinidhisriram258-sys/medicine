import React from 'react';
import { BarChart3, TrendingUp, PieChart as PieIcon, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export default function Analytics({ analytics }) {
  if (!analytics) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400 font-mono">
        Loading interactive analytics from backend database...
      </div>
    );
  }

  const { trend_7d, trend_30d, medicine_breakdown, time_of_day_breakdown, day_of_week_breakdown, overall } = analytics;

  const pieData = [
    { name: 'Taken', value: overall?.taken || 0, color: '#10B981' },
    { name: 'Missed', value: overall?.missed || 0, color: '#F43F5E' },
  ];

  return (
    <div className="space-y-8">
      
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#38BDF8]" />
          Interactive Adherence Analytics & Visualizations
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Visualizing real SQLite adherence database records over time.
        </p>
      </div>

      {/* CHARTS GRID 1: 7-DAY TREND & TAKEN VS MISSED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 7-DAY AREA CHART */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#38BDF8]" />
            7-Day Adherence Trend (%)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend_7d}>
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#080A0F', borderColor: '#38BDF8', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="adherence" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#skyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TAKEN VS MISSED PIE CHART */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#A855F7]" />
            Overall Taken vs Missed
          </h3>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#080A0F', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around font-mono text-xs pt-2 border-t border-slate-800">
            <span className="text-emerald-400">Taken: {overall?.taken}</span>
            <span className="text-rose-400">Missed: {overall?.missed}</span>
          </div>
        </div>

      </div>

      {/* CHARTS GRID 2: TIME OF DAY & MEDICINE-WISE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIME OF DAY BAR CHART */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Adherence by Time of Day</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={time_of_day_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time_slot" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#080A0F', borderRadius: '12px' }} />
                <Bar dataKey="adherence" fill="#FBBF24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MEDICINE WISE BAR CHART */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Medicine-Wise Adherence Rates</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medicine_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#080A0F', borderRadius: '12px' }} />
                <Bar dataKey="adherence" fill="#A855F7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
