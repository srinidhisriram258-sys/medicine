import React, { useEffect, useState } from 'react';
import { Lock, Unlock, ShieldCheck, FileText, UserCheck, HeartPulse, PlusCircle } from 'lucide-react';
import { api } from '../services/api';

export default function MedicationVault({ medicines, onOpenVaultModal, vaultUnlocked }) {
  const [caregiver, setCaregiver] = useState(null);

  useEffect(() => {
    if (vaultUnlocked) {
      api.getCaregiverOverview().then(setCaregiver).catch(console.error);
    }
  }, [vaultUnlocked]);

  if (!vaultUnlocked) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-[#00D2FF]/30 text-center max-w-xl mx-auto my-12 space-y-6 animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center justify-center">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">PATIENT MEDICATION VAULT LOCKED</h2>
          <p className="text-xs text-slate-400 font-mono mt-2 leading-relaxed">
            Sensitive prescription records, healthcare provider clinical notes, complete history, and caregiver oversight are protected behind Vault PIN authentication.
          </p>
        </div>

        <button
          onClick={onOpenVaultModal}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0EA5E9] text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:brightness-110 transition-all"
        >
          UNLOCK MEDICATION VAULT (PIN: 1234)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-semibold mb-2">
            <Unlock className="w-3.5 h-3.5" />
            VAULT AUTHENTICATED
          </div>
          <h2 className="text-2xl font-black text-white">Protected Patient Medication Vault</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Complete active prescriptions, healthcare provider instructions, and authorized caregiver controls.
          </p>
        </div>

        <span className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 font-bold">
          SECURITY ACCESS GRANTED
        </span>
      </div>

      {/* PRESCRIPTIONS LIST */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00D2FF]" />
          Active Prescribed Medicines & Doctor Instructions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medicines.map((med) => (
            <div key={med.id} className="p-6 rounded-2xl glass-card border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-white">{med.name}</h4>
                  <p className="text-xs font-mono text-[#00D2FF]">Dosage: {med.dosage}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
                  {med.frequency}
                </span>
              </div>

              {med.notes && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-mono">
                  <strong className="text-slate-400">Doctor Notes:</strong> {med.notes}
                </div>
              )}

              <div className="pt-2 text-[11px] font-mono text-slate-500 flex justify-between">
                <span>Start: {med.start_date}</span>
                <span>End: {med.end_date || 'Ongoing'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAREGIVER SECTION */}
      {caregiver && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#A855F7]" />
            Authorized Caregiver Oversight Details
          </h3>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm">{caregiver.caregiver_name} ({caregiver.relationship})</div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Contact: {caregiver.contact_email} | Notification Escalation Active</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#A855F7]/10 border border-[#A855F7]/30 text-xs font-mono text-[#A855F7] font-bold">
              CONNECTED
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
