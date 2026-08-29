import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-slate-800/80 py-6 px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Mandatory Safety Disclaimer */}
        <div className="flex items-start gap-3 max-w-3xl">
          <ShieldAlert className="w-5 h-5 text-[#FBBF24] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            <strong className="text-white">FINAL SAFETY DISCLAIMER:</strong> MEDIADHERE AI is a medication reminder and adherence monitoring tool. It does not diagnose medical conditions, recommend treatment, or replace professional medical advice. Medication schedules and dosages should follow instructions from a qualified healthcare professional.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 whitespace-nowrap">
          &copy; 2026 MEDIADHERE AI Platform
        </div>
      </div>
    </footer>
  );
}
