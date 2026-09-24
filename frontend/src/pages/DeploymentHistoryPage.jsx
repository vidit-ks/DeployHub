import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  GitBranch, 
  Clock, 
  RotateCcw, 
  ArrowRight, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

export default function DeploymentHistoryPage() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('ALL');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deps, projs] = await Promise.all([
        api.getDeployments(),
        api.getProjects()
      ]);
      setDeployments(deps);
      setProjects(projs);
    } catch (err) {
      addToast('Failed to load deployment timeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (dep) => {
    if (!window.confirm(`Rollback to deployment #${dep.deployment_number} (${dep.commit_sha})?`)) return;
    try {
      addToast('Initiating rollback pipeline...', 'info');
      const res = await api.rollback(dep.id);
      addToast('Rollback build launched', 'success');
      if (res.data?.id) {
        navigate(`/deployments/${res.data.id}`);
      } else {
        loadData();
      }
    } catch (err) {
      addToast(err.message || 'Rollback failed', 'error');
    }
  };

  const getRelativeTime = (isoString) => {
    if (!isoString) return 'just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return `${Math.max(1, diffSec)}s ago`;
  };

  const filteredDeployments = deployments.filter((d) => {
    const matchProject = filterProject === 'ALL' || d.project_id === filterProject;
    const matchSearch = !searchQuery ||
      (d.project?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.commit_message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.commit_sha || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.branch || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchProject && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-pink-400" />
            Deployment History & Timeline
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete audit trail of all builds, commits, and instant rollback capabilities.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-pink-500/40 transition-colors self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase text-zinc-400">Project:</span>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SHA, branch, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500 w-full sm:w-64 font-mono"
          />
        </div>
      </div>

      {/* Deployments Timeline List */}
      <div className="space-y-3">
        {filteredDeployments.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-mono glass-panel rounded-2xl border border-zinc-800">
            No deployments found.
          </div>
        ) : (
          filteredDeployments.map((dep, idx) => {
            const isLive = dep.status === 'LIVE';
            const isFailed = dep.status === 'FAILED';

            return (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => navigate(`/deployments/${dep.id}`)}
                className="p-4 sm:p-5 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/80 hover:border-pink-500/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: Deployment #, Branch, Message */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-sm font-bold text-pink-400 group-hover:scale-105 group-hover:border-pink-500/40 transition-all shrink-0">
                    #{dep.deployment_number}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                        {dep.project?.name || dep.project_id}
                      </span>
                      <span className="font-mono text-xs text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                        {dep.commit_sha}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-1 max-w-lg">
                      {dep.commit_message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-zinc-500" />
                        {dep.branch}
                      </span>
                      <span>•</span>
                      <span>{getRelativeTime(dep.started_at)}</span>
                      <span>•</span>
                      <span>{dep.duration_seconds || 0}s duration</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Rollback / Inspect Buttons */}
                <div className="flex items-center gap-3 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={dep.status} size="sm" />

                  {isLive && (
                    <button
                      onClick={() => handleRollback(dep)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-pink-500/20 text-zinc-400 hover:text-pink-300 border border-zinc-800 hover:border-pink-500/40 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                      title="Rollback production to this deployment"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Rollback</span>
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/deployments/${dep.id}`)}
                    className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white group-hover:bg-zinc-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
