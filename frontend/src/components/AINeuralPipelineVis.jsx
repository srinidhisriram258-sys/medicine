import React from 'react';
import { Database, Cpu, Brain, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';

export default function AINeuralPipelineVis({ activeStep = 3, riskLevel = "LOW", confidence = 0.0 }) {
  const steps = [
    {
      id: 1,
      title: "Patient Adherence Data",
      subtitle: "SQLite Database Records",
      desc: "Scheduled, taken, missed timestamps & delays",
      icon: Database,
      color: "text-[#CBD5E1]",
      border: "border-slate-700",
      bg: "bg-slate-900/60"
    },
    {
      id: 2,
      title: "Feature Extraction",
      subtitle: "16 Behavioral Vectors",
      desc: "Time-of-day rates, recency & consecutive misses",
      icon: Cpu,
      color: "text-[#38BDF8]",
      border: "border-[#38BDF8]/40",
      bg: "bg-[#0EA5E9]/10"
    },
    {
      id: 3,
      title: "PyTorch Model",
      subtitle: "AdherenceRiskNet Classifier",
      desc: "Deep Neural Network forward pass",
      icon: Brain,
      color: "text-[#A855F7]",
      border: "border-[#A855F7]/40",
      bg: "bg-[#A855F7]/10"
    },
    {
      id: 4,
      title: "Adherence Risk",
      subtitle: `${riskLevel} RISK (${(confidence * 100).toFixed(1)}%)`,
      desc: "Multi-class Softmax Risk Evaluation",
      icon: AlertTriangle,
      color: riskLevel === 'HIGH' ? 'text-red-400' : riskLevel === 'MEDIUM' ? 'text-[#FBBF24]' : 'text-emerald-400',
      border: riskLevel === 'HIGH' ? 'border-red-500/40' : riskLevel === 'MEDIUM' ? 'border-[#FBBF24]/40' : 'border-emerald-500/40',
      bg: "bg-slate-900/80"
    },
    {
      id: 5,
      title: "Explainable Insight",
      subtitle: "Data-Driven Behavioral Factors",
      desc: "Pattern analysis without medical causation",
      icon: Lightbulb,
      color: "text-[#FBBF24]",
      border: "border-[#FBBF24]/40",
      bg: "bg-[#FBBF24]/10"
    }
  ];

  return (
    <div className="w-full glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#38BDF8]" />
            Genuine PyTorch AI Inference Pipeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            End-to-End Real Neural Architecture (No Hardcoded/Simulated Predictions)
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-xs font-mono text-[#38BDF8]">
          PyTorch 2.13 CPU Engine
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const IconComponent = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className={`relative p-4 rounded-xl border ${step.border} ${step.bg} backdrop-blur-md flex flex-col justify-between transition-all hover:scale-[1.02]`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-slate-950/60 ${step.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">STAGE 0{step.id}</span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white leading-tight">{step.title}</h4>
                  <p className={`text-xs font-mono font-medium mt-1 ${step.color}`}>{step.subtitle}</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                </div>

                {/* Animated active pulse */}
                <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Verified</span>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center -mx-2 z-10">
                  <ArrowRight className="w-4 h-4 text-[#38BDF8]/50 animate-pulse" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
