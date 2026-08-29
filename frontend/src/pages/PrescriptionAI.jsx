import React, { useState } from 'react';
import { FileSearch, UploadCloud, CheckCircle2, AlertTriangle, Cpu, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function PrescriptionAI({ onAddParsedMedicine }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.uploadPrescriptionOCR(formData);
      setOcrResult(res);
    } catch (err) {
      setError(err.message || 'Failed to process prescription image.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* HEADER */}
      <div className="glass-panel p-6 rounded-2xl border border-[#00D2FF]/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D2FF]/10 border border-[#00D2FF]/30 text-xs font-mono text-[#00D2FF] font-semibold mb-3">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          DEEP LEARNING VISION OCR ENGINE
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide">
          Smart Prescription AI Scanner
        </h2>
        <p className="text-xs text-slate-300 font-mono mt-1">
          Upload a prescription document or medicine strip image. Real Deep Vision OCR extracts name, dosage, and scheduled timings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* UPLOAD & SCAN CARD */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#00D2FF]" />
            Upload Prescription Document / Medicine Label
          </h3>

          <label className="border-2 border-dashed border-slate-700 hover:border-[#00D2FF]/60 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 transition-all group">
            {previewUrl ? (
              <img src={previewUrl} alt="Prescription Preview" className="max-h-56 rounded-xl object-contain shadow-lg" />
            ) : (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00D2FF]/10 text-[#00D2FF] flex items-center justify-center border border-[#00D2FF]/30 group-hover:scale-110 transition-transform">
                  <FileSearch className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Click or drag image to upload</p>
                  <p className="text-xs text-slate-500 font-mono mt-1">Supports PNG, JPG, JPEG, WEBP (Max 10 MB)</p>
                </div>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          {selectedFile && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400 truncate max-w-xs">{selectedFile.name}</span>
              <button
                onClick={handleScan}
                disabled={scanning}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00D2FF] to-[#0EA5E9] text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {scanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                {scanning ? 'SCANNING...' : 'SCAN PRESCRIPTION'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* OCR EXTRACTION RESULT */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            AI Extracted Verification Panel
          </h3>

          {ocrResult ? (
            <div className="space-y-6">
              
              {/* DISCLAIMER BANNER */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-200 uppercase mb-0.5">Verification Required</strong>
                  {ocrResult.disclaimer}
                </div>
              </div>

              {/* PARSED FIELDS GRID */}
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">Extracted Medicine Name</span>
                  <div className="text-lg font-bold text-white">{ocrResult.medicine_name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px]">Extracted Dosage</span>
                    <div className="text-sm font-bold text-[#00D2FF]">{ocrResult.dosage}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px]">Extracted Frequency</span>
                    <div className="text-sm font-bold text-white">{ocrResult.frequency}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[10px]">OCR Vision Method</span>
                  <div className="text-xs text-slate-300">{ocrResult.method} (Confidence: {(ocrResult.confidence * 100).toFixed(0)}%)</div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={() => onAddParsedMedicine && onAddParsedMedicine({
                  name: ocrResult.medicine_name,
                  dosage: ocrResult.dosage,
                  frequency: ocrResult.frequency,
                  scheduled_times: ['08:00', '20:00']
                })}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                ADD TO MEDICATION SCHEDULE
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          ) : (
            <div className="h-64 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500 font-mono text-xs">
              <FileSearch className="w-10 h-10 text-slate-700" />
              <p>Upload prescription image on the left and click "Scan Prescription" to extract medication schedule.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
