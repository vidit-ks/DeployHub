import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Zap, 
  Sparkles, 
  Layers, 
  Terminal, 
  Key, 
  Plus, 
  Trash2, 
  Lock, 
  CheckCircle2, 
  HelpCircle,
  ExternalLink,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import GithubIcon from '../components/GithubIcon';
import { useApp } from '../context/AppContext';

export default function NewProjectWizard() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  // Wizard state (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Step 1: Repository
  const [repoInput, setRepoInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [popularTemplates, setPopularTemplates] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);

  // Step 2: Project Config
  const [projectName, setProjectName] = useState('');
  const [framework, setFramework] = useState('React');
  const [buildCommand, setBuildCommand] = useState('npm run build');
  const [startCommand, setStartCommand] = useState('npm start');
  const [outputDir, setOutputDir] = useState('dist');
  const [rootDir, setRootDir] = useState('/');
  const [branch, setBranch] = useState('main');
  const [availableBranches, setAvailableBranches] = useState(['main', 'develop']);

  // Step 3: Environment Variables
  const [envVars, setEnvVars] = useState([
    { key: 'NODE_ENV', value: 'production', is_secret: false },
    { key: 'DATABASE_URL', value: 'postgresql://postgres:secret@db.deployhub:5432/main', is_secret: true }
  ]);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newEnvSecret, setNewEnvSecret] = useState(true);

  // Step 4: Deploying
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templates = await api.searchGithubRepos('');
      setPopularTemplates(templates);
    } catch {
      // ignore
    }
  };

  const handleSearchRepos = async (q) => {
    setSearchQuery(q);
    if (!q) {
      loadTemplates();
      return;
    }
    setSearching(true);
    try {
      const results = await api.searchGithubRepos(q);
      setPopularTemplates(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectTemplate = (template) => {
    setRepoInput(template.full_name);
    setSelectedRepo(template);
    setProjectName(template.name.replace(/[^a-zA-Z0-9_-]/g, '-'));
    setFramework(template.framework || 'React');
    adjustDefaultsForFramework(template.framework || 'React');
  };

  const adjustDefaultsForFramework = (fw) => {
    if (fw === 'Next.js') {
      setBuildCommand('npm run build');
      setStartCommand('npm start');
      setOutputDir('.next');
    } else if (fw === 'React' || fw === 'Vue.js') {
      setBuildCommand('npm run build');
      setStartCommand('npm run preview');
      setOutputDir('dist');
    } else if (fw === 'Node.js') {
      setBuildCommand('npm run build');
      setStartCommand('npm start');
      setOutputDir('dist');
    } else if (fw === 'Python') {
      setBuildCommand('pip install -r requirements.txt');
      setStartCommand('uvicorn main:app --host 0.0.0.0 --port 8000');
      setOutputDir('.');
    }
  };

  const handleConnectRepo = async () => {
    if (!repoInput.trim()) {
      addToast('Please enter a GitHub repository URL or select a template', 'error');
      return;
    }

    setLoading(true);
    try {
      const info = await api.getGithubRepo(repoInput.trim());
      setSelectedRepo(info);
      setProjectName(info.name || repoInput.split('/').pop().replace('.git', ''));
      setFramework(info.framework || 'React');
      adjustDefaultsForFramework(info.framework || 'React');
      setBranch(info.default_branch || 'main');
      if (info.branches?.length) {
        setAvailableBranches(info.branches);
      }
      setCurrentStep(2);
      addToast('Repository connected successfully', 'success');
    } catch (err) {
      // If error, generate valid fallback config
      const parts = repoInput.replace(/^https?:\/\/github\.com\//, '').split('/');
      const repoName = parts[1] || parts[0] || 'my-app';
      setSelectedRepo({
        full_name: repoInput,
        name: repoName,
        framework: 'React',
        default_branch: 'main'
      });
      setProjectName(repoName);
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnv = () => {
    if (!newEnvKey.trim() || !newEnvValue.trim()) return;
    setEnvVars(prev => [...prev, {
      key: newEnvKey.trim().toUpperCase(),
      value: newEnvValue.trim(),
      is_secret: newEnvSecret
    }]);
    setNewEnvKey('');
    setNewEnvValue('');
  };

  const removeEnv = (idx) => {
    setEnvVars(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinalDeploy = async () => {
    setDeploying(true);
    try {
      // Trigger canvas confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#f43f5e', '#a855f7', '#38bdf8']
      });

      const res = await api.createProject({
        name: projectName,
        repo_url: selectedRepo?.clone_url || (repoInput.startsWith('http') ? repoInput : `https://github.com/${repoInput}`),
        repo_name: selectedRepo?.full_name || repoInput,
        branch,
        framework,
        build_command: buildCommand,
        start_command: startCommand,
        output_dir: outputDir,
        root_dir: rootDir,
        env_vars: envVars,
        trigger_initial_deploy: true
      });

      addToast('Project created & build started!', 'success');

      if (res.initialDeployment?.id) {
        navigate(`/deployments/${res.initialDeployment.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      addToast(err.message || 'Deployment failed to initialize', 'error');
      setDeploying(false);
    }
  };

  const steps = [
    { num: 1, title: 'Connect Repo' },
    { num: 2, title: 'Configure' },
    { num: 3, title: 'Environment' },
    { num: 4, title: 'Review & Deploy' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-pink-400 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
          Deployment Wizard
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create New Project
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Import a Git repository, configure environment variables, and trigger automated builds.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-zinc-800/90 shadow-xl">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : isCurrent
                        ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)] scale-105'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      isCurrent ? 'text-pink-300 font-bold' : isDone ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-3 rounded-full transition-all ${
                      currentStep > s.num ? 'bg-pink-500' : 'bg-zinc-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-pink-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(236,72,153,0.1)] relative">
        <AnimatePresence mode="wait">
          {/* STEP 1: Connect Repository */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <GithubIcon className="w-5 h-5 text-pink-400" />
                  Step 1: Connect Repository
                </h2>
                <p className="text-xs text-zinc-400">
                  Enter a public or private GitHub repository URL or choose a template below.
                </p>
              </div>

              {/* GitHub Input */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-semibold uppercase text-zinc-400 block">
                  GitHub Repository URL / Slug
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <GithubIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="https://github.com/username/project or username/project"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConnectRepo()}
                      className="w-full bg-[#12121b] border border-zinc-700/80 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleConnectRepo}
                    disabled={loading || !repoInput.trim()}
                    className="btn-neon-pink px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.35)] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>Connect Repository</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Starter Templates */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Or select a 1-click starter template
                  </span>
                  <div className="relative">
                    <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => handleSearchRepos(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-pink-500 w-44"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularTemplates.slice(0, 4).map((tpl) => (
                    <div
                      key={tpl.name}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`p-3.5 rounded-xl bg-[#12121a] border transition-all cursor-pointer flex flex-col justify-between space-y-2 hover:bg-[#181824] ${
                        repoInput === tpl.full_name
                          ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{tpl.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">
                          {tpl.framework}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{tpl.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Configure Project */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-pink-400" />
                  Step 2: Configure Project
                </h2>
                <p className="text-xs text-zinc-400">
                  DeployHub auto-detected your framework. Adjust build scripts or root directory if needed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-[#12121b] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                {/* Framework */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Framework Preset
                  </label>
                  <select
                    value={framework}
                    onChange={(e) => {
                      setFramework(e.target.value);
                      adjustDefaultsForFramework(e.target.value);
                    }}
                    className="w-full bg-[#12121b] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                  >
                    <option value="React">React (Vite / CRA)</option>
                    <option value="Next.js">Next.js (App Router)</option>
                    <option value="Node.js">Node.js / Express API</option>
                    <option value="Python">Python (FastAPI / Flask)</option>
                    <option value="Vue.js">Vue 3 + Vite</option>
                    <option value="Astro">Astro Edge</option>
                    <option value="Static HTML">Static HTML / Jamstack</option>
                  </select>
                </div>

                {/* Build Command */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Build Command
                  </label>
                  <input
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    className="w-full bg-[#12121b] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-pink-300 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                {/* Start Command */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Start Command
                  </label>
                  <input
                    type="text"
                    value={startCommand}
                    onChange={(e) => setStartCommand(e.target.value)}
                    className="w-full bg-[#12121b] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-pink-300 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#12121b] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                  >
                    {availableBranches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Root Directory */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold uppercase text-zinc-400">
                    Root Directory
                  </label>
                  <input
                    type="text"
                    value={rootDir}
                    onChange={(e) => setRootDir(e.target.value)}
                    className="w-full bg-[#12121b] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-neon-pink px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Continue to Environment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Environment Variables */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-pink-400" />
                  Step 3: Environment Variables
                </h2>
                <p className="text-xs text-zinc-400">
                  Add secrets, database connection strings, and API keys. These are injected securely during runtime.
                </p>
              </div>

              {/* Add Key-Value Bar */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="DATABASE_URL, API_KEY..."
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                    className="bg-[#12121b] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type={newEnvSecret ? 'password' : 'text'}
                    placeholder="Value (e.g. postgres://...)"
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                    className="bg-[#12121b] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEnvSecret}
                      onChange={(e) => setNewEnvSecret(e.target.checked)}
                      className="rounded text-pink-500 focus:ring-pink-500"
                    />
                    <span>Hide as encrypted secret</span>
                  </label>

                  <button
                    onClick={handleAddEnv}
                    disabled={!newEnvKey.trim() || !newEnvValue.trim()}
                    className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Variable</span>
                  </button>
                </div>
              </div>

              {/* Existing Variables */}
              <div className="space-y-2">
                {envVars.map((env, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#14141e] border border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-pink-400 font-semibold">{env.key}</span>
                      <span className="text-zinc-400 truncate max-w-[200px]">
                        {env.is_secret ? '••••••••••••••••' : env.value}
                      </span>
                    </div>
                    <button
                      onClick={() => removeEnv(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Step Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="btn-neon-pink px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Review & Deploy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Ready to Deploy */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Step 4: Ready to Deploy
                </h2>
                <p className="text-xs text-zinc-400">
                  Review your project specifications before launching to the DeployHub container network.
                </p>
              </div>

              {/* Review Summary Card */}
              <div className="p-5 rounded-2xl bg-[#12121c] border border-pink-500/30 space-y-4 font-mono text-xs shadow-[0_0_25px_rgba(236,72,153,0.12)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-zinc-500 uppercase block text-[10px]">Project Name</span>
                    <span className="text-white font-bold text-sm font-sans">{projectName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase block text-[10px]">Framework</span>
                    <span className="text-pink-400 font-semibold">{framework}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase block text-[10px]">Repository</span>
                    <span className="text-zinc-200">{selectedRepo?.full_name || repoInput}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase block text-[10px]">Branch</span>
                    <span className="text-zinc-200">{branch}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase block text-[10px]">Build Command</span>
                    <span className="text-pink-300 font-semibold">{buildCommand}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 uppercase block text-[10px]">Start Command</span>
                    <span className="text-pink-300">{startCommand}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Target Edge Domain:</span>
                  <span className="text-pink-400 font-semibold">https://{projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.deployhub.app</span>
                </div>
              </div>

              {/* Step Navigation & Deploy Trigger */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={deploying}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={handleFinalDeploy}
                  disabled={deploying}
                  className="btn-neon-pink px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_0_35px_rgba(236,72,153,0.5)] disabled:opacity-50"
                >
                  {deploying ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Provisioning Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Deploy Project</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
