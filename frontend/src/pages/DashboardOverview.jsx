import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Layers, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  ArrowUpRight, 
  GitBranch, 
  Terminal,
  Search,
  Activity,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LivePreviewModal from '../components/LivePreviewModal';
import { useApp } from '../context/AppContext';

export default function DashboardOverview() {
  const navigate = useNavigate();
  const { greeting, setAiModalData, addToast } = useApp();
  
  const [metrics, setMetrics] = useState({
    totalProjects: 4,
    totalDeployments: 42,
    successfulDeployments: 38,
    failedDeployments: 4,
    avgDuration: 34,
    successRate: 90
  });

  const [recentDeployments, setRecentDeployments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewModal, setPreviewModal] = useState({ isOpen: false, url: '', title: '' });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [m, d, p] = await Promise.all([
        api.getMetricsOverview().catch(() => null),
        api.getDeployments().catch(() => []),
        api.getProjects().catch(() => [])
      ]);

      if (m) setMetrics(m);
      if (d) setRecentDeployments(d);
      if (p) setProjects(p);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDeploy = async (projectId) => {
    try {
      addToast('Triggering deployment...', 'info');
      const res = await api.deployProject(projectId);
      addToast('Deployment queued', 'success');
      if (res.data?.id) {
        navigate(`/deployments/${res.data.id}`);
      } else {
        loadDashboardData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to trigger deployment', 'error');
    }
  };

  const filteredDeployments = recentDeployments.filter((d) => {
    const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
    const matchesSearch = !searchQuery || 
      (d.project?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.commit_message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.commit_sha || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans flex items-center gap-2.5">
            {greeting}
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Global Edge status is healthy. 4 active container services running across us-east and eu-west.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadDashboardData()}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-pink-500/40 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/new')}
            className="btn-neon-pink px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.35)]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Projects Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navigate('/projects')}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/90 hover:border-pink-500/40 cursor-pointer space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Projects</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{projects.length || metrics.totalProjects}</div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <span className="text-emerald-400">●</span> {projects.filter(p => p.current_status === 'LIVE').length} production live
          </div>
        </motion.div>

        {/* Deployments Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          onClick={() => navigate('/deployments')}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/90 hover:border-pink-500/40 cursor-pointer space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Deployments</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{recentDeployments.length || metrics.totalDeployments}</div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
            <span>Avg {metrics.avgDuration}s build speed</span>
          </div>
        </motion.div>

        {/* Successful Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => setFilterStatus('LIVE')}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/90 hover:border-emerald-500/40 cursor-pointer space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-emerald-400">Successful</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            {recentDeployments.filter(d => d.status === 'LIVE').length || metrics.successfulDeployments}
          </div>
          <div className="text-[11px] text-zinc-500">
            <span className="text-emerald-400 font-semibold">{metrics.successRate}%</span> overall reliability
          </div>
        </motion.div>

        {/* Failed Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          onClick={() => setFilterStatus('FAILED')}
          className="p-5 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/90 hover:border-rose-500/40 cursor-pointer space-y-2 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-rose-400">Failed</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            {recentDeployments.filter(d => d.status === 'FAILED').length || metrics.failedDeployments}
          </div>
          <div className="text-[11px] text-pink-400 flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3" />
            <span>AI Doctor Ready</span>
          </div>
        </motion.div>
      </div>

      {/* Active Projects Quick Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-400" />
            Active Projects
          </h2>
          <Link to="/projects" className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-mono">
            View All Projects ({projects.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl glass-panel glass-panel-hover border border-zinc-800/80 hover:border-pink-500/35 space-y-3 relative group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {project.framework}
                  </span>
                  <StatusBadge status={project.current_status} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {project.description || project.repo_url}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                {project.live_url ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewModal({ isOpen: true, url: project.live_url, title: project.name })}
                      className="text-pink-400 hover:text-pink-300 flex items-center gap-1 text-[11px] font-mono hover:underline"
                    >
                      <span>Preview</span>
                    </button>
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-zinc-300"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : <span className="text-zinc-600 text-[11px] font-mono">Not live</span>}

                <button
                  onClick={() => handleQuickDeploy(project.id)}
                  className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Deployments Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-400" />
              Recent Deployments
            </h2>
            <p className="text-xs text-zinc-400">Live deployment pipelines across branches and revisions</p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search commit or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-pink-500"
            >
              <option value="ALL">All Status</option>
              <option value="LIVE">Live</option>
              <option value="BUILDING">Building</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Deployments Table Card */}
        <div className="rounded-2xl glass-panel border border-zinc-800/90 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0b12] text-zinc-400 uppercase tracking-wider font-mono text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Commit & Branch</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {filteredDeployments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-zinc-500 font-mono">
                      No deployments found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredDeployments.map((dep) => {
                    const isFailed = dep.status === 'FAILED';
                    return (
                      <tr
                        key={dep.id}
                        className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/deployments/${dep.id}`)}
                      >
                        {/* Project Name */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white group-hover:text-pink-400 transition-colors flex items-center gap-2">
                            <span>{dep.project?.name || dep.project_id}</span>
                            <span className="text-[10px] font-mono text-zinc-500">#{dep.deployment_number}</span>
                          </div>
                          {dep.live_url && (
                            <a
                              href={dep.live_url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] text-zinc-400 hover:text-pink-300 font-mono flex items-center gap-1 mt-0.5"
                            >
                              {dep.live_url.replace('https://', '')}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>

                        {/* Commit & Branch */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-zinc-200">
                            <span className="font-mono text-pink-400 font-semibold bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 text-[11px]">
                              {dep.commit_sha}
                            </span>
                            <span className="truncate max-w-[180px] text-zinc-300 text-xs">
                              {dep.commit_message}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono mt-0.5">
                            <GitBranch className="w-3 h-3 text-zinc-500" />
                            <span>{dep.branch}</span>
                            <span>• by {dep.commit_author}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={dep.status} size="sm" />
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-4 font-mono text-zinc-300">
                          {dep.duration_seconds ? `${dep.duration_seconds}s` : '—'}
                        </td>

                        {/* Time */}
                        <td className="px-4 py-4 font-mono text-zinc-400 text-[11px]">
                          {new Date(dep.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {isFailed && (
                              <button
                                onClick={() => setAiModalData({
                                  deploymentId: dep.id,
                                  errorMessage: dep.error_message,
                                  logs: null,
                                  framework: dep.project?.framework || 'React',
                                  buildCommand: dep.project?.build_command || 'npm run build'
                                })}
                                className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-300 hover:bg-pink-500/30 border border-pink-500/40 text-xs font-medium flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>AI Doctor</span>
                              </button>
                            )}

                            <button
                              onClick={() => navigate(`/deployments/${dep.id}`)}
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                              title="View Logs"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => navigate(`/deployments/${dep.id}`)}
                              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-pink-300 hover:bg-zinc-700 transition-colors"
                              title="Inspect Details"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fullscreen Live Preview Modal */}
      <LivePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, url: '', title: '' })}
        liveUrl={previewModal.url}
        title={previewModal.title}
      />
    </div>
  );
}
