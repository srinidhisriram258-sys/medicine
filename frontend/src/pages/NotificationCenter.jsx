import React, { useEffect, useState } from 'react';
import { Bell, Activity, Send, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import NotificationDiagnostics from '../components/NotificationDiagnostics';
import { api } from '../services/api';

export default function NotificationCenter() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getNotificationLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div className="glass-panel p-6 rounded-2xl border border-[#00D2FF]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/30 text-xs font-mono text-[#00D2FF] font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            NOTIFICATION CONTROL CENTER
          </div>
          <h2 className="text-2xl font-black text-white">Web Push Notification & Delivery Logs</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Audit history of server-side APScheduler reminder dispatches and PWA service worker delivery events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all self-start sm:self-auto"
          title="Refresh Audit Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* EMBEDDED DIAGNOSTICS INSPECTOR */}
      <NotificationDiagnostics />

      {/* NOTIFICATION LOGS AUDIT TABLE */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Recent Delivery Audit Trail</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">MEDICINE</th>
                <th className="p-3">DOSAGE</th>
                <th className="p-3">CHANNEL</th>
                <th className="p-3">NOTIFICATION TIME</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="p-3 text-slate-500">#{log.id}</td>
                  <td className="p-3 font-bold text-white">{log.medicine_name}</td>
                  <td className="p-3 text-[#00D2FF]">{log.dosage}</td>
                  <td className="p-3 text-slate-300">{log.channel}</td>
                  <td className="p-3 text-slate-400">{new Date(log.notification_time).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'DELIVERED' || log.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
