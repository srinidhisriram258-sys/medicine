import React, { useEffect, useState } from 'react';
import { Activity, Bell, Cpu, CheckCircle2, XCircle, Clock, RefreshCw, Send } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationDiagnostics() {
  const [diagData, setDiagData] = useState(null);
  const [permission, setPermission] = useState('DEFAULT');
  const [swRegistered, setSwRegistered] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const fetchDiagnostics = async () => {
    // 1. Browser Notification Permission
    if ('Notification' in window) {
      setPermission(Notification.permission.toUpperCase());
    }

    // 2. Service Worker registration check
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      setSwRegistered(Boolean(reg));
    }

    // 3. Backend Diagnostics
    try {
      const data = await api.getNotificationDiagnostics();
      setDiagData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleTriggerTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.triggerTestNotification('Web Push');
      setTestResult(res);
      await fetchDiagnostics();
    } catch (err) {
      setTestResult({ status: 'FAILED', message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[#38BDF8]/30 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#38BDF8]" />
            Real-Time Reminder Notification Diagnostics
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            System & Browser Infrastructure Health Inspection (No Fake Status)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDiagnostics}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Refresh Diagnostics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerTest}
            disabled={testing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {testing ? 'SENDING...' : 'TEST REMINDER'}
          </button>
        </div>
      </div>

      {/* DIAGNOSTICS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono text-xs">
        
        {/* Permission */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px]">Permission</span>
          <div className={`font-bold ${permission === 'GRANTED' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {permission}
          </div>
        </div>

        {/* SW Registered */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px]">Service Worker</span>
          <div className={`font-bold ${swRegistered ? 'text-emerald-400' : 'text-rose-400'}`}>
            {swRegistered ? 'REGISTERED' : 'NOT FOUND'}
          </div>
        </div>

        {/* Push Subscription */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px]">Push Subscription</span>
          <div className={`font-bold ${diagData?.push_subscription_status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {diagData?.push_subscription_status || 'CHECKING...'}
          </div>
        </div>

        {/* Scheduler */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px]">APScheduler Engine</span>
          <div className={`font-bold ${diagData?.scheduler_running ? 'text-emerald-400' : 'text-rose-400'}`}>
            {diagData?.scheduler_running ? 'RUNNING' : 'STOPPED'}
          </div>
        </div>

        {/* Pending Doses */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px]">Pending Doses</span>
          <div className="font-bold text-white text-base">
            {diagData?.pending_doses ?? 0}
          </div>
        </div>

        {/* Next Reminder */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px]">Next Due Dose</span>
          <div className="font-bold text-[#38BDF8] text-[11px] truncate">
            {diagData?.next_reminder ? new Date(diagData.next_reminder).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None'}
          </div>
        </div>

      </div>

      {/* TEST RESULT OUTPUT */}
      {testResult && (
        <div className={`p-4 rounded-xl border font-mono text-xs ${
          testResult.status === 'DELIVERED' || testResult.status === 'SENT' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div className="font-bold">STATUS: {testResult.status}</div>
          <div className="text-slate-300 font-sans mt-1">{testResult.message}</div>
        </div>
      )}

    </div>
  );
}
