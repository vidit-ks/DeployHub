import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Terminal, 
  Search, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Layers, 
  Filter, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

export default function LogsPage() {
  const { addToast } = useApp();

  const [deployments, setDeployments] = useState([]);
  const [selectedDepId, setSelectedDepId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadDeployments();
  }, []);

  useEffect(() => {
    if (selectedDepId) {
      loadLogs(selectedDepId);
    }
  }, [selectedDepId]);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      const list = await api.getDeployments();
      setDeployments(list);
      if (list.length > 0) {
        setSelectedDepId(list[0].id);
      }
    } catch (err) {
      addToast('Failed to load deployments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (depId) => {
    try {
      const data = await api.getDeploymentLogs(depId);
      setLogs(data);
    } catch (err) {
      addToast('Failed to fetch deployment logs', 'error');
    }
  };

  const copyLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.log_level}] [${l.stage}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Logs copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.log_level}] [${l.stage}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployhub-logs-${selectedDepId}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedDeployment = deployments.find(d => d.id === selectedDepId);

  const filteredLogs = logs.filter((l) => {
    const matchSearch = !searchQuery || l.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = selectedLevel === 'ALL' || l.log_level.toLowerCase() === selectedLevel.toLowerCase();
    return matchSearch && matchLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-pink-400" />
            Build & Deployment Logs
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time stdout/stderr stream inspector and historical runtime logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadLogs(selectedDepId)}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-pink-500/40 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Deployment Selector, Log Level Filter, Search */}
      <div className="p-4 rounded-2xl glass-panel border border-zinc-800/90 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Deployment Dropdown */}
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-mono font-semibold uppercase text-zinc-400 shrink-0">
            Deployment:
          </span>
          <select
            value={selectedDepId}
            onChange={(e) => setSelectedDepId(e.target.value)}
            className="w-full sm:w-auto flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-pink-500"
          >
            {deployments.map((d) => (
              <option key={d.id} value={d.id}>
                #{d.deployment_number} - {d.project?.name || d.project_id} ({d.branch} - {d.commit_sha}) [{d.status}]
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
            {['ALL', 'info', 'command', 'system', 'error'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                  selectedLevel === lvl
                    ? 'bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {lvl.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500 w-44 sm:w-56 font-mono"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={copyLogs}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-pink-500/40 transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download Button */}
          <button
            onClick={downloadLogs}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-pink-500/40 transition-colors"
            title="Download Log File"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Deployment Info Header */}
      {selectedDeployment && (
        <div className="p-4 rounded-xl bg-[#0e0e16] border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm font-sans">{selectedDeployment.project?.name}</span>
            <span className="text-pink-400 font-semibold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
              {selectedDeployment.commit_sha}
            </span>
            <span className="text-zinc-400">{selectedDeployment.commit_message}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Duration: {selectedDeployment.duration_seconds || 0}s</span>
            <StatusBadge status={selectedDeployment.status} size="sm" />
          </div>
        </div>
      )}

      {/* Full Developer Terminal Window */}
      <div className="rounded-2xl glass-panel border border-pink-500/25 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-3.5 bg-[#09090f] border-b border-zinc-800 font-mono text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-pink-400" />
            <span>Console Output Stream</span>
            <span className="text-[10px] text-zinc-500">({filteredLogs.length} lines)</span>
          </div>
        </div>

        <div className="p-5 font-mono text-xs leading-relaxed space-y-1.5 bg-[#060609] text-zinc-300 min-h-[480px] max-h-[640px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 font-mono">
              No logs found matching current search/filter.
            </div>
          ) : (
            filteredLogs.map((l, idx) => {
              const text = l.message || '';
              const level = l.log_level;

              let colorClass = 'text-zinc-300';
              let badgeBg = 'bg-zinc-800 text-zinc-400';

              if (level === 'command' || text.startsWith('$')) {
                colorClass = 'text-pink-400 font-semibold';
                badgeBg = 'bg-pink-500/15 text-pink-300 border border-pink-500/30';
              } else if (level === 'error' || text.includes('error') || text.includes('FATAL')) {
                colorClass = 'text-rose-400 font-semibold';
                badgeBg = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
              } else if (text.startsWith('✓') || text.includes('successful') || text.includes('LIVE')) {
                colorClass = 'text-emerald-400 font-medium';
                badgeBg = 'bg-emerald-500/20 text-emerald-300';
              } else if (text.startsWith('●')) {
                colorClass = 'text-amber-300';
                badgeBg = 'bg-amber-500/20 text-amber-300';
              } else if (level === 'system') {
                colorClass = 'text-zinc-400';
                badgeBg = 'bg-zinc-800/80 text-zinc-400';
              }

              return (
                <div key={l.id || idx} className="flex items-start gap-3 hover:bg-zinc-900/40 p-0.5 rounded transition-colors group">
                  <span className="text-zinc-600 select-none text-[11px] w-6 text-right font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-500 select-none text-[10px] shrink-0 font-mono hidden md:inline">
                    {new Date(l.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.2 rounded shrink-0 hidden sm:inline ${badgeBg}`}>
                    {l.stage || level || 'log'}
                  </span>
                  <span className={`break-all whitespace-pre-wrap ${colorClass}`}>
                    {text}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
