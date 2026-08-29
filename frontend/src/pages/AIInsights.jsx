import React from 'react';
import { Brain, Lightbulb, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import AINeuralPipelineVis from '../components/AINeuralPipelineVis';
import RiskBadge from '../components/RiskBadge';

export default function AIInsights({ aiPrediction, stats }) {
  const isLoaded = aiPrediction?.model_status === 'loaded';
  const features = aiPrediction?.feature_summary || {};
  const insights = aiPrediction?.insights || [];

  return (
    <div className="space-y-8">
      
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#38BDF8]" />
          Explainable AI Behavioral Insights
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Behavioral pattern analysis generated from actual database records and PyTorch inference vectors.
        </p>
      </div>

      {/* NEURAL PIPELINE VISUALIZATION */}
      <AINeuralPipelineVis
        activeStep={isLoaded ? 4 : 2}
        riskLevel={aiPrediction?.risk_level}
        confidence={aiPrediction?.confidence}
      />

      {/* AI INSIGHTS STATEMENTS */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#FBBF24]" />
          Calculated Adherence Behavioral Patterns
        </h3>

        <div className="space-y-3">
          {insights?.map((insight, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-sm text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] shrink-0 mt-2" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* WHY DID AI PREDICT THIS? */}
      <div className="glass-panel p-6 rounded-2xl border border-[#38BDF8]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#38BDF8]" />
              WHY DID AI PREDICT THIS?
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Primary Behavioral Features Feeding PyTorch Softmax Class Probabilities
            </p>
          </div>

          <RiskBadge
            level={aiPrediction?.risk_level}
            confidence={aiPrediction?.confidence}
          />
        </div>

        {isLoaded ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-slate-400">Recent 7-Day Adherence</span>
                <div className="text-2xl font-bold text-white">{(features.recent_7d_adherence || 0).toFixed(1)}%</div>
                <p className="text-[11px] text-slate-500 font-mono">Weight Factor: High</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-slate-400">Consecutive Missed Doses</span>
                <div className="text-2xl font-bold text-[#FBBF24]">{features.consecutive_missed_doses || 0}</div>
                <p className="text-[11px] text-slate-500 font-mono">Weight Factor: Critical</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-slate-400">Avg Response Delay</span>
                <div className="text-2xl font-bold text-white">{(features.avg_delay_minutes || 0).toFixed(0)} min</div>
                <p className="text-[11px] text-slate-500 font-mono">Weight Factor: Moderate</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-xs font-mono text-slate-400">Evening Adherence</span>
                <div className="text-2xl font-bold text-white">{((features.evening_adherence_rate || 0) * 100).toFixed(0)}%</div>
                <p className="text-[11px] text-slate-500 font-mono">Weight Factor: Moderate</p>
              </div>

            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-400 leading-relaxed">
              <strong className="text-[#38BDF8]">BEHAVIORAL EXPLANATION:</strong> These calculated historical adherence factors contributed to the current adherence-risk estimate. This AI output describes adherence timing behavior only and does not claim medical causation.
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 font-mono text-sm">
            AI Model is not currently loaded. Run <code className="text-[#38BDF8]">python -m ml.train</code> to generate model weights.
          </div>
        )}
      </div>

    </div>
  );
}
