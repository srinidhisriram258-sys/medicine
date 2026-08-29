import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Database, Shield, Globe, MessageSquare, CheckCircle2, XCircle, AlertTriangle, Send } from 'lucide-react';
import { api } from '../services/api';

export default function Settings({ onRefreshData }) {
  const [testChannel, setTestChannel] = useState('Web Push');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  useEffect(() => {
    // Load notification logs & whatsapp status
    api.getNotificationLogs().then(setNotificationLogs).catch(console.error);
    api.getWhatsAppStatus().then(setWhatsappStatus).catch(console.error);
  }, []);

  const handleTestNotification = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.triggerTestNotification(testChannel);
      setTestResult(res);
      const updatedLogs = await api.getNotificationLogs().catch(() => []);
      setNotificationLogs(updatedLogs);
    } catch (err) {
      setTestResult({ status: 'FAILED', message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleRunSeeder = async () => {
    setSeeding(true);
    setSeedMessage('Executing seed_demo.py seeder script...');
    try {
      await onRefreshData();
      setSeedMessage('Successfully re-synced SQLite database seeder output!');
    } catch (err) {
      setSeedMessage(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#38BDF8]" />
          Platform System Settings & Notification Test Mode
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Web Push PWA configurations, notification delivery test mode, and timezone settings.
        </p>
      </div>

      {/* NOTIFICATION TEST MODE WIDGET */}
      <div className="glass-panel p-6 rounded-2xl border border-[#38BDF8]/30 space-y-6">
        <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#38BDF8]" />
              NOTIFICATION TEST MODE
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Trigger a real test notification to verify delivery channels without fake status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
            >
              <option value="Web Push">Web Push / PWA</option>
              <option value="Browser System">Browser Alert & Sound</option>
              <option value="WhatsApp">WhatsApp Provider</option>
            </select>

            <button
              onClick={handleTestNotification}
              disabled={testing}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {testing ? 'TRIGGERING...' : 'TEST REMINDER'}
            </button>
          </div>
        </div>

        {/* REAL TEST RESULT DISPLAY */}
        {testResult && (
          <div className={`p-4 rounded-xl border font-mono text-xs space-y-1 ${
            testResult.status === 'DELIVERED' || testResult.status === 'SENT' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            testResult.status === 'NOT CONFIGURED' ? 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]' :
            'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="font-bold uppercase flex items-center gap-2">
              {testResult.status === 'DELIVERED' || testResult.status === 'SENT' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              DELIVERY STATUS: {testResult.status}
            </div>
            <p className="text-slate-300 font-sans mt-1">{testResult.message}</p>
          </div>
        )}
      </div>

      {/* WHATSAPP PROVIDER CONFIGURATION STATUS */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          WhatsApp Integration Status
        </h3>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-sm">Provider API Configuration</div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{whatsappStatus?.message}</p>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
            whatsappStatus?.configured ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            {whatsappStatus?.status || 'NOT CONFIGURED'}
          </span>
        </div>
      </div>

      {/* TIMEZONE SETTINGS */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#38BDF8]" />
          Timezone-Aware Scheduling
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div>
            <div className="font-bold text-white text-sm">Patient Primary Timezone</div>
            <p className="text-xs text-slate-400">Server scheduler evaluates medication times relative to patient timezone.</p>
          </div>

          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white outline-none"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
            <option value="America/New_York">America/New_York (EST -5:00)</option>
            <option value="Europe/London">Europe/London (GMT +0:00)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST +9:00)</option>
          </select>
        </div>
      </div>

      {/* NOTIFICATION AUDIT LOGS TABLE */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Recent Notification Audit Logs</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">MEDICINE</th>
                <th className="p-3">CHANNEL</th>
                <th className="p-3">NOTIFICATION TIME</th>
                <th className="p-3">DELIVERY STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {notificationLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-bold text-white">{log.medicine_name}</td>
                  <td className="p-3 text-[#38BDF8]">{log.channel}</td>
                  <td className="p-3 text-slate-300">{new Date(log.notification_time).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'DELIVERED' || log.status === 'SENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
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

      {/* DEMO DATA SEEDER PANEL */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-[#38BDF8]" />
          Demo Data Seeder Management
        </h3>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleRunSeeder}
            disabled={seeding}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs hover:border-[#38BDF8] active:scale-95 transition-all disabled:opacity-50"
          >
            {seeding ? 'SEEDING DATABASE...' : 'RE-SYNC DEMO DATA'}
          </button>
          {seedMessage && <span className="text-xs font-mono text-emerald-400">{seedMessage}</span>}
        </div>
      </div>

    </div>
  );
}
