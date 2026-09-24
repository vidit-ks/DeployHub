import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Layers, 
  Search, 
  GitBranch, 
  ExternalLink, 
  Zap, 
  Settings, 
  Trash2, 
  Clock, 
  Key, 
  Code, 
  Check, 
  Eye, 
  EyeOff, 
  X,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import GithubIcon from '../components/GithubIcon';
import { useApp } from '../context/AppContext';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('ALL');
  
  // Selected project for Settings/Env Drawer
  const [activeProject, setActiveProject] = useState(null);
  const [envVars, setEnvVars] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isSecret, setIsSecret] = useState(true);
  const [revealedKeys, setRevealedKeys] = useState({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      addToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (projectId) => {
    try {
      addToast('Starting deployment pipeline...', 'info');
      const res = await api.deployProject(projectId);
      addToast('Deployment queued', 'success');
      if (res.data?.id) {
        navigate(`/deployments/${res.data.id}`);
      }
    } catch (err) {
      addToast(err.message || 'Deployment trigger failed', 'error');
    }
  };

  const openProjectSettings = async (project) => {
    setActiveProject(project);
    try {
      const vars = await api.getProjectEnv(project.id);
      setEnvVars(vars);
    } catch {
      setEnvVars([]);
    }
  };

  const handleAddEnv = async () => {
    if (!newKey.trim() || !newValue.trim() || !activeProject) return;
    try {
      await api.setProjectEnv(activeProject.id, {
        key: newKey.trim(),
        value: newValue.trim(),
        is_secret: isSecret,
        environment: 'production'
      });
      const updated = await api.getProjectEnv(activeProject.id);
      setEnvVars(updated);
      setNewKey('');
      setNewValue('');
      addToast(`Variable ${newKey} saved`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save variable', 'error');
    }
  };

  const handleDeleteEnv = async (envId) => {
    if (!activeProject) return;
    try {
      await api.deleteProjectEnv(activeProject.id, envId);
      setEnvVars(prev => prev.filter(e => e.id !== envId));
      addToast('Environment variable removed', 'success');
    } catch (err) {
      addToast('Failed to delete variable', 'error');
    }
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await api.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProject?.id === id) setActiveProject(null);
      addToast(`Project ${name} deleted`, 'success');
    } catch (err) {
      addToast('Failed to delete project', 'error');
    }
  };

  const toggleReveal = (key) => {
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const frameworks = ['ALL', 'React', 'Next.js', 'Node.js', 'Python', 'Vue.js', 'Astro'];

  const filteredProjects = projects.filter((p) => {
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.repo_url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFw = selectedFramework === 'ALL' || p.framework.toLowerCase() === selectedFramework.toLowerCase();
    return matchSearch && matchFw;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-pink-400" />
            Projects
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your connected repositories, deployment targets, build environments, and domains.
          </p>
        </div>

        <button
          onClick={() => navigate('/new')}
          className="btn-neon-pink px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.35)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Framework Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {frameworks.map((fw) => (
            <button
              key={fw}
              onClick={() => setSelectedFramework(fw)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors shrink-0 ${
                selectedFramework === fw
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.2)] font-semibold'
                  : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/80 hover:border-pink-500/40 flex flex-col justify-between space-y-5 group relative"
          >
            {/* Card Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-zinc-800/90 text-zinc-200 border border-zinc-700">
                    {project.framework}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {project.deploy_count} deploys
                  </span>
                </div>
                <StatusBadge status={project.current_status} size="sm" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              {/* GitHub & Branch Info */}
              <div className="space-y-1 pt-1 font-mono text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 truncate">
                  <GithubIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-pink-400 truncate text-[11px]"
                  >
                    {project.repo_name || project.repo_url.replace('https://github.com/', '')}
                  </a>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                  <GitBranch className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{project.branch}</span>
                  <span>• Node {project.node_version || '20.x'}</span>
                </div>
              </div>

              {/* Live URL */}
              {project.live_url && (
                <div className="pt-2">
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-pink-400 hover:text-pink-300 hover:underline truncate max-w-full"
                  >
                    {project.live_url.replace('https://', '')}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openProjectSettings(project)}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Environment Variables & Settings"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id, project.name)}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-700 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeploy(project.id)}
                  className="btn-neon-pink px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Deploy</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Environment Variables & Settings Modal Drawer */}
      <AnimatePresence>
        {activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#0e0e14] border border-pink-500/30 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(236,72,153,0.2)] overflow-hidden z-10 my-8"
            >
              <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600" />

              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-[#09090e]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                    <Key className="w-4 h-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Environment Variables & Secrets</h3>
                    <p className="text-xs text-zinc-400 font-mono">{activeProject.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveProject(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Add New Key-Value */}
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    Add Environment Variable
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="KEY_NAME (e.g. DATABASE_URL)"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                      className="bg-[#14141d] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                    <input
                      type={isSecret ? 'password' : 'text'}
                      placeholder="Variable value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="bg-[#14141d] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSecret}
                        onChange={(e) => setIsSecret(e.target.checked)}
                        className="rounded border-zinc-700 text-pink-500 focus:ring-pink-500"
                      />
                      <span>Encrypt as secret</span>
                    </label>

                    <button
                      onClick={handleAddEnv}
                      disabled={!newKey.trim() || !newValue.trim()}
                      className="btn-neon-pink px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      Save Variable
                    </button>
                  </div>
                </div>

                {/* Existing Variables List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    Configured Variables ({envVars.length})
                  </h4>

                  {envVars.length === 0 ? (
                    <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-500 font-mono">
                      No environment variables configured for this project yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {envVars.map((env) => {
                        const isRevealed = revealedKeys[env.id];
                        return (
                          <div
                            key={env.id}
                            className="p-3 rounded-xl bg-[#14141e] border border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className="text-pink-400 font-semibold">{env.key}</span>
                              <span className="text-zinc-400 truncate max-w-[200px]">
                                {env.is_secret && !isRevealed ? '••••••••••••••••' : env.value}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {env.is_secret && (
                                <button
                                  onClick={() => toggleReveal(env.id)}
                                  className="text-zinc-400 hover:text-white p-1"
                                  title={isRevealed ? 'Hide' : 'Reveal'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteEnv(env.id)}
                                className="text-zinc-500 hover:text-rose-400 p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#09090e] border-t border-zinc-800 flex items-center justify-end">
                <button
                  onClick={() => setActiveProject(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
