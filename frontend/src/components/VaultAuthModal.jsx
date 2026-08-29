import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function VaultAuthModal({ isOpen, onSuccess, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.verifyVaultPin(pin);
      if (res.unlocked) {
        onSuccess(res.token);
        setPin('');
      }
    } catch (err) {
      setError(err.message || 'Invalid Vault Security PIN. Default PIN is 1234.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-6 rounded-3xl glass-panel-glow border border-[#38BDF8]/40 shadow-2xl relative space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#38BDF8] via-[#0EA5E9] to-[#A855F7] p-0.5 shadow-[0_0_25px_rgba(56,189,248,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Lock className="w-7 h-7 text-[#38BDF8] animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white tracking-wide">
            PATIENT MEDICATION VAULT
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Security Authentication Required to View Private Prescription Data
          </p>
        </div>

        {/* PIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1 text-center">
              Enter 4-Digit Vault Security PIN
            </label>
            <div className="flex justify-center">
              <input
                type="password"
                maxLength="6"
                required
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-48 text-center text-2xl tracking-[0.5em] font-mono px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-[#38BDF8] focus:border-[#38BDF8] outline-none shadow-inner"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono text-center mt-2">
              Default Development Vault PIN: <strong className="text-slate-300">1234</strong>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono text-center flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white transition-all"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'VERIFYING...' : 'UNLOCK VAULT'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
