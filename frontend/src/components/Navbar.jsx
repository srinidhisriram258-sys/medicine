import React from 'react';
import { Activity, Lock, Unlock, RefreshCw, Cpu, Smartphone } from 'lucide-react';

export default function Navbar({ health, aiStatus, vaultUnlocked, onLockVault, onOpenVaultModal, onRefresh, installPrompt, onInstallPWA }) {
  const isReady = aiStatus?.inference_ready;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Hero Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D2FF] via-[#0EA5E9] to-[#A855F7] p-0.5 shadow-[0_0_15px_rgba(0,210,255,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#00D2FF] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-[#00D2FF] bg-clip-text text-transparent">
                AURA-MED
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/30 text-[10px] font-mono text-[#00D2FF] font-semibold">
                CYBER-MEDICAL AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Intelligent Medicine Reminder & Adherence System
            </p>
          </div>
        </div>

        {/* Live System Status Banners */}
        <div className="flex items-center gap-3">
          
          {/* PWA INSTALL BUTTON */}
          {installPrompt && (
            <button
              onClick={onInstallPWA}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#00D2FF] to-[#0EA5E9] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,210,255,0.4)] flex items-center gap-1.5 animate-pulse"
            >
              <Smartphone className="w-3.5 h-3.5" />
              INSTALL PWA APP
            </button>
          )}

          {/* VAULT SECURITY LOCK STATUS BUTTON */}
          <button
            onClick={vaultUnlocked ? onLockVault : onOpenVaultModal}
            className={`px-3 py-1.5 rounded-full border text-xs font-mono flex items-center gap-2 backdrop-blur-md transition-all ${
              vaultUnlocked
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-[#00D2FF]/50'
            }`}
          >
            {vaultUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-[#FFD700]" />}
            <span className="font-semibold">{vaultUnlocked ? 'VAULT UNLOCKED' : 'MEDICATION VAULT'}</span>
          </button>

          {/* PyTorch Model Status Badge */}
          <div className={`px-3 py-1.5 rounded-full border text-xs font-mono flex items-center gap-2 backdrop-blur-md hidden md:flex ${
            isReady ? 'bg-[#00D2FF]/10 border-[#00D2FF]/40 text-[#00D2FF]' : 'bg-[#FFD700]/10 border-[#FFD700]/40 text-[#FFD700]'
          }`}>
            <Cpu className="w-3.5 h-3.5" />
            <span>{isReady ? 'PYTORCH MODEL READY' : 'AI MODEL NOT READY'}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-[#00D2FF]/50 transition-all active:scale-95"
            title="Refresh System Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
