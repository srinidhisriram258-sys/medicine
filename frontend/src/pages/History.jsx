import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Search, Calendar, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    api.getAdherenceHistory(100)
      .then((res) => setHistory(res.history || []))
      .catch(console.error);
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.medicine_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || item.status.toUpperCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-[#38BDF8]" />
            Chronological Adherence History Log
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Complete audited log of all scheduled, taken, missed, and snoozed medication events.
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-[#38BDF8]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {['ALL', 'TAKEN', 'MISSED', 'SNOOZED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterStatus === st ? 'bg-[#38BDF8] text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LOG TABLE */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-4">RECORD ID</th>
              <th className="p-4">MEDICINE</th>
              <th className="p-4">DOSAGE</th>
              <th className="p-4">SCHEDULED FOR</th>
              <th className="p-4">STATUS</th>
              <th className="p-4">DELAY (MIN)</th>
              <th className="p-4">TAG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredHistory.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-4 text-slate-500">#{row.id}</td>
                <td className="p-4 font-bold text-white font-sans text-sm">{row.medicine_name}</td>
                <td className="p-4 text-[#38BDF8]">{row.dosage}</td>
                <td className="p-4 text-slate-300">{new Date(row.scheduled_for).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    row.status === 'taken' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    row.status === 'missed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                    'bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/30'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{row.delay_minutes ? `${row.delay_minutes.toFixed(0)} min` : '-'}</td>
                <td className="p-4 text-slate-500">
                  {row.is_demo ? <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">DEMO DATA</span> : <span className="px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] text-[10px]">REAL RECORD</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
