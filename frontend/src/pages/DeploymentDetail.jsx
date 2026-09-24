import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  GitBranch, 
  Copy, 
  Check, 
  ArrowLeft, 
  RotateCcw, 
  Clock, 
  Server,
  Layers,
  ChevronDown,
  Download,
  Search,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import AIDiagnosisModal from '../components/AIDiagnosisModal';
import { useApp } from '../context/AppContext';

export default function DeploymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [deployment, setDeployment] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [logFilter, setLogFilter] = useState('');
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const terminalEndRef = useRef(null);

  useEffect(() => {
    loadDeployment();
  }, [id]);

  // Connect SSE Live Log Stream if active
  useEffect(() => {
    if (!id) return;

    const disconnectStream = api.connectLogStream(id, {
      onLog: (newLog) => {
        setLogs(prev => {
          if (prev.some(l => l.id === newLog.id || (l.message === newLog.message && l.timestamp === newLog.timestamp))) {
            return prev;
          }
          return [...prev, newLog];
        });
      },
      onStatus: (statusData) => {
        setDeployment(prev => {
          if (!prev) return null;
          const updated = { ...prev, status: statusData.status };
          if (statusData.duration) updated.duration_seconds = statusData.duration;
          if (statusData.live_url) updated.live_url = statusData.live_url;
          return updated;
        });

        if (statusData.status === 'LIVE' && !hasCelebrated) {
          setHasCelebrated(true);
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#10b981', '#a855f7']
          });
        }
      }
    });

    return () => {
      disconnectStream();
    };
  }, [id, hasCelebrated]);

  // Auto scroll terminal
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const loadDeployment = async () => {
    try {
      setLoading(true);
      const data = await api.getDeployment(id);
      setDeployment(data);
      setLogs(data.logs || []);
    } catch (err) {
      addToast('Failed to load deployment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeploy = async (simulateFailure = false) => {
    try {
      addToast('Triggering redeployment...', 'info');
      const res = await api.redeploy(id, { simulateFailure });
      addToast('Redeploy pipeline started', 'success');
      if (res.data?.id) {
        navigate(`/deployments/${res.data.id}`);
      }
    } catch (err) {
      addToast(err.message || 'Redeploy failed', 'error');
    }
  };

  const copyUrl = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    addToast('Live URL copied', 'success');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyAllLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.stage || 'build'}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    addToast('Terminal logs copied to clipboard', 'success');
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const downloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.stage || 'build'}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployhub-${deployment?.project?.slug || 'build'}-${deployment?.deployment_number || id}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine active stage status for the pipeline stepper
  const getStageStatus = (stageName) => {
    if (!deployment) return 'pending';
    const status = deployment.status;

    if (status === 'LIVE') return 'completed';
    if (status === 'FAILED') {
      if (stageName === 'clone' || stageName === 'install') return 'completed';
      if (stageName === 'build') return 'failed';
      return 'pending';
    }

    // While BUILDING
    const stageOrder = ['clone', 'install', 'build', 'containerize', 'health_check'];
    const hasLogForStage = logs.some(l => l.stage === stageName);
    const lastLogStage = logs[logs.length - 1]?.stage || 'clone';

    if (hasLogForStage && lastLogStage !== stageName) return 'completed';
    if (lastLogStage === stageName) return 'active';
    return 'pending';
  };

  const pipelineStages = [
    { key: 'clone', label: 'Repository cloned' },
    { key: 'install', label: 'Dependencies installed' },
    { key: 'build', label: 'Building application' },
    { key: 'containerize', label: 'Starting server & sandbox' },
    { key: 'health_check', label: 'Health check & Edge routing' },
  ];

  const filteredLogs = logs.filter(l => 
    !logFilter || l.message.toLowerCase().includes(logFilter.toLowerCase())
  );

  if (loading && !deployment) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin" />
        <span className="text-xs font-mono text-zinc-400">Loading deployment metadata...</span>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Deployment not found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-neon-pink px-4 py-2 rounded-xl text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isLive = deployment.status === 'LIVE';
  const isFailed = deployment.status === 'FAILED';
  const isBuilding = deployment.status === 'BUILDING' || deployment.status === 'QUEUED';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/deployments')}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">Project:</span>
              <span className="text-base font-bold text-white font-sans">{deployment.project?.name || 'MyApp'}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                #{deployment.deployment_number}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono mt-0.5">
              <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
              <span>{deployment.branch}</span>
              <span>•</span>
              <span className="text-pink-400 font-semibold">{deployment.commit_sha}</span>
              <span className="truncate max-w-[220px] text-zinc-400">"{deployment.commit_message}"</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <StatusBadge status={deployment.status} size="lg" />

          <button
            onClick={() => handleRedeploy(false)}
            className="btn-neon-pink px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Redeploy</span>
          </button>
        </div>
      </div>

      {/* STATE 1: Live Deployment Success Celebration Banner */}
      {isLive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/40 bg-gradient-to-r from-emerald-950/20 via-[#0e0e14] to-pink-950/20 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                ✓ Deployment Successful
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300">
              Your application is live and accessible on DeployHub Global Edge network.
            </p>
            <div className="pt-2 flex items-center gap-2 font-mono text-xs text-pink-400">
              <span className="text-zinc-500">Live URL:</span>
              <a
                href={deployment.live_url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-pink-300 font-semibold flex items-center gap-1"
              >
                {deployment.live_url}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => copyUrl(deployment.live_url)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-pink-500/40 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied URL' : 'Copy URL'}</span>
            </button>

            <a
              href={deployment.live_url}
              target="_blank"
              rel="noreferrer"
              className="btn-neon-pink px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
            >
              <span>Open Application</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}

      {/* STATE 2: Deployment Failure Banner with AI Error Doctor */}
      {isFailed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-[#0e0e14] to-pink-950/20 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(244,63,94,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Deployment Failed
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-rose-200 font-mono">
              Error: {deployment.error_message || "Module not found: Can't resolve '@radix-ui/react-tooltip'"}
            </p>
            <p className="text-xs text-zinc-400">
              Build stopped prematurely. Inspect the terminal logs below or trigger the Gemini AI Doctor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="btn-neon-pink px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(236,72,153,0.45)]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explain Error with AI</span>
            </button>

            <button
              onClick={() => handleRedeploy(false)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-pink-500/40 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Redeploy</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Pipeline Stage Stepper */}
      <div className="p-6 rounded-2xl glass-panel border border-zinc-800/80 space-y-4">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Execution Pipeline Stages</span>
          <span className="text-zinc-500 font-normal">
            Build Duration: {deployment.duration_seconds || 0}s
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {pipelineStages.map((stage) => {
            const status = getStageStatus(stage.key);

            let borderClass = 'border-zinc-800 bg-zinc-950/40 text-zinc-500';
            let icon = <span className="w-2 h-2 rounded-full bg-zinc-600" />;

            if (status === 'completed') {
              borderClass = 'border-emerald-500/30 bg-emerald-950/15 text-emerald-300';
              icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            } else if (status === 'active') {
              borderClass = 'border-amber-500/40 bg-amber-950/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
              icon = <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />;
            } else if (status === 'failed') {
              borderClass = 'border-rose-500/40 bg-rose-950/20 text-rose-300';
              icon = <AlertCircle className="w-4 h-4 text-rose-400" />;
            }

            return (
              <div
                key={stage.key}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono transition-all ${borderClass}`}
              >
                <div className="shrink-0">{icon}</div>
                <span className="truncate">{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Developer Live Terminal / Log Panel */}
      <div className="rounded-2xl glass-panel border border-pink-500/25 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(236,72,153,0.15)]">
        {/* Terminal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#09090f] border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40 inline-block" />
            </div>
            <div className="ml-2 flex items-center gap-1.5 text-xs font-mono text-zinc-300">
              <Terminal className="w-4 h-4 text-pink-400" />
              <span>DeployHub Container Terminal Stream</span>
              {isBuilding && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] animate-pulse">
                  Streaming Live
                </span>
              )}
            </div>
          </div>

          {/* Terminal Controls */}
          <div className="flex items-center gap-2">
            {/* Log Search Filter */}
            <div className="relative">
              <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter terminal output..."
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500 w-36 sm:w-48 font-mono"
              />
            </div>

            {/* Auto-scroll toggle */}
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition-colors ${
                autoScroll
                  ? 'bg-pink-500/15 border-pink-500/30 text-pink-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              Auto-scroll
            </button>

            {/* Copy Logs */}
            <button
              onClick={copyAllLogs}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="Copy All Logs"
            >
              {copiedLog ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Download Logs */}
            <button
              onClick={downloadLogs}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              title="Download Logs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-5 font-mono text-xs sm:text-[13px] leading-relaxed space-y-2 bg-[#060609] text-zinc-300 min-h-[380px] max-h-[520px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono">
              Waiting for container process stream...
            </div>
          ) : (
            filteredLogs.map((l, idx) => {
              const text = l.message || '';
              const level = l.log_level;

              let colorClass = 'text-zinc-300';
              if (text.startsWith('$')) colorClass = 'text-pink-400 font-semibold';
              else if (text.startsWith('✓') || text.includes('successful') || text.includes('LIVE')) colorClass = 'text-emerald-400 font-medium';
              else if (text.startsWith('●')) colorClass = 'text-amber-300';
              else if (text.startsWith('✕') || text.startsWith('FATAL') || text.includes('error') || level === 'error') colorClass = 'text-rose-400 font-semibold';
              else if (text.startsWith('▲') || text.startsWith('✨')) colorClass = 'text-fuchsia-400 font-medium';
              else if (level === 'system') colorClass = 'text-zinc-400';

              return (
                <div key={l.id || idx} className="flex items-start gap-3 group">
                  <span className="text-zinc-600 select-none text-[11px] w-6 text-right font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-600 select-none text-[10px] shrink-0 font-mono hidden sm:inline">
                    {new Date(l.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className={`break-all whitespace-pre-wrap ${colorClass}`}>
                    {text}
                  </span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* AI Diagnosis Modal */}
      <AIDiagnosisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        data={{
          deploymentId: deployment.id,
          errorMessage: deployment.error_message,
          logs: logs,
          framework: deployment.project?.framework || 'React',
          buildCommand: deployment.project?.build_command || 'npm run build'
        }}
        onRedeploy={() => handleRedeploy(false)}
      />
    </div>
  );
}
