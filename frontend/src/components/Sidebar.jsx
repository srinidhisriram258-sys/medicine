import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Clock,
  Calendar,
  Activity,
  BarChart3,
  BrainCircuit,
  FileSearch,
  Users,
  History,
  Bell,
  Cpu,
  Lock,
  Settings
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'reminders', label: 'Reminders', icon: Clock },
    { id: 'todays-doses', label: "Today's Doses", icon: Calendar },
    { id: 'adherence', label: 'Adherence', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Insights', icon: BrainCircuit },
    { id: 'prescription-ai', label: 'Prescription AI', icon: FileSearch, badge: 'OCR' },
    { id: 'caregiver', label: 'Caregiver', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'notification-center', label: 'Notification Center', icon: Bell },
    { id: 'model-status', label: 'AI Model Status', icon: Cpu },
    { id: 'medication-vault', label: 'Medication Vault', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 glass-panel p-4 flex flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-64px)]">
      
      <div className="space-y-6">
        
        {/* NAV SECTION HEADER */}
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3">
            AURA-MED NAVIGATION
          </span>

          <nav className="mt-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00D2FF]/20 to-[#0EA5E9]/20 text-[#00D2FF] border border-[#00D2FF]/40 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00D2FF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* SYSTEM DISCLAIMER FOOTER */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] font-mono text-slate-500 space-y-1">
        <div className="font-bold text-slate-400">AURA-MED SAFETY NOTICE</div>
        <p className="leading-tight">
          Medication schedule & adherence tool only. Does not diagnose or recommend treatment.
        </p>
      </div>

    </aside>
  );
}
