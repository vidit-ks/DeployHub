import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Terminal, Check, Copy, RefreshCw, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useApp } from '../context/AppContext';

export default function AIDiagnosisModal({ isOpen, onClose, data, onRedeploy }) {
  const { apiKey, addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [redeploying, setRedeploying] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      fetchDiagnosis();
    } else {
      setDiagnosis(null);
    }
  }, [isOpen, data]);

  const fetchDiagnosis = async () => {
    setLoading(true);
    setDiagnosis(null);

    try {
      const res = await api.explainError({
        deploymentId: data.deploymentId || data.id,
        errorMessage: data.errorMessage || data.error_message,
        logs: data.logs,
        framework: data.framework || 'React',
        buildCommand: data.buildCommand || 'npm run build',
        apiKey: apiKey || undefined
      });

      setDiagnosis(res);
    } catch (err) {
      console.error('Error fetching AI diagnosis:', err);
      addToast(err.response?.data?.error || 'Failed to generate AI diagnosis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyCommand = (cmd) => {
    if (!cmd) return;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    addToast('Command copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeploy = async () => {
    if (!onRedeploy && !data?.deploymentId && !data?.id) return;
    setRedeploying(true);
    try {
      if (onRedeploy) {
        await onRedeploy();
      } else {
        await api.redeploy(data.deploymentId || data.id);
        addToast('Fresh deployment triggered with fix', 'success');
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to redeploy', 'error');
    } finally {
      setRedeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#0e0e14] border border-pink-500/40 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(236,72,153,0.25)] overflow-hidden z-10 my-8"
        >
          {/* Header Glow Bar */}
          <div className="h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600" />

          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-[#09090e]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <Sparkles className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  AI Error Doctor
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Gemini 1.5
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">Intelligent root-cause diagnosis and actionable resolution</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-pink-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Analyzing build stack trace & logs...</h4>
                  <p className="text-xs text-zinc-400 mt-1">Gemini AI is examining package resolution, config files, and compiler errors.</p>
                </div>
              </div>
            ) : diagnosis ? (
              <>
                {/* Headline Banner */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold block">
                      Identified Failure
                    </span>
                    <h4 className="text-sm font-bold text-rose-200 mt-0.5">
                      {diagnosis.headline}
                    </h4>
                  </div>
                </div>

                {/* What Happened */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    What Happened
                  </h5>
                  <p className="text-sm text-zinc-200 leading-relaxed bg-[#13131b] p-3.5 rounded-xl border border-zinc-800/80">
                    {diagnosis.whatHappened}
                  </p>
                </div>

                {/* Why It Happened */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    Technical Root Cause
                  </h5>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-[#13131b] p-3.5 rounded-xl border border-zinc-800/80">
                    {diagnosis.whyItHappened}
                  </p>
                </div>

                {/* Possible Solution */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold text-pink-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                    Recommended Fix
                  </h5>
                  <div className="bg-[#13131b] p-4 rounded-xl border border-pink-500/30 space-y-3">
                    <p className="text-sm text-zinc-200 leading-relaxed">
                      {diagnosis.possibleSolution}
                    </p>

                    {/* Command Box if available */}
                    {diagnosis.recommendedCommand && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-black/60 border border-zinc-700/80 font-mono text-xs text-pink-300">
                        <div className="flex items-center gap-2 overflow-x-auto">
                          <span className="text-zinc-500 select-none">$</span>
                          <span>{diagnosis.recommendedCommand}</span>
                        </div>
                        <button
                          onClick={() => copyCommand(diagnosis.recommendedCommand)}
                          className="px-2.5 py-1 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs flex items-center gap-1 shrink-0 transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prevention Tip */}
                {diagnosis.preventionTip && (
                  <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2">
                    <span className="text-pink-400 font-semibold font-mono">PRO TIP:</span>
                    <span>{diagnosis.preventionTip}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-zinc-400 text-sm">
                No error logs available to analyze.
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between p-4 bg-[#09090e] border-t border-zinc-800/80">
            <button
              onClick={fetchDiagnosis}
              disabled={loading}
              className="text-xs text-zinc-400 hover:text-pink-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleRedeploy}
                disabled={redeploying || loading}
                className="btn-neon-pink px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)] disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${redeploying ? 'animate-spin' : ''}`} />
                {redeploying ? 'Triggering...' : 'Redeploy Project'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
