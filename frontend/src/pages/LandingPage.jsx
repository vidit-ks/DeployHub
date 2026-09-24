import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  RotateCcw,
  Activity,
  Server,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import TerminalCard from '../components/TerminalCard';
import GithubIcon from '../components/GithubIcon';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('raw'); // 'raw' vs 'ai' for AI Doctor demo

  const heroTerminalLines = [
    '$ deployhub deploy',
    '✓ Repository connected: github.com/user/nexus-ai-studio',
    '✓ Installing dependencies (pnpm 8.15.4)',
    '✓ Building Next.js application & server components',
    '✓ Container image optimized (84MB OCI runtime)',
    '✓ Edge Anycast route assigned',
    '✓ Deployment successful',
    '✨ Production URL: https://my-app.deployhub.app'
  ];

  const features = [
    {
      icon: Zap,
      title: 'Zero-Config Builds',
      description: 'Auto-detects React, Next.js, Node, Python, Vite, and Astro with optimized container runtime presets.'
    },
    {
      icon: Sparkles,
      title: 'Gemini AI Error Doctor',
      description: 'Never decipher cryptic stack traces again. Instant plain-English root cause analysis and 1-click terminal fixes.'
    },
    {
      icon: Terminal,
      title: 'Live Streamed Logs',
      description: 'Sub-millisecond Server-Sent Events stream build stdout/stderr with syntax highlighting and instant filtering.'
    },
    {
      icon: Globe,
      title: 'Global Edge Anycast',
      description: 'Instant SSL provisioning and multi-region edge routing with automated health check probes.'
    },
    {
      icon: Lock,
      title: 'Encrypted Secrets Vault',
      description: 'Manage production and preview environment variables with AES-256 client-side masking.'
    },
    {
      icon: RotateCcw,
      title: 'Instant 1-Click Rollbacks',
      description: 'Pin-point previous immutable build artifacts and restore previous live versions in under 3 seconds.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Connect Repository',
      description: 'Paste any public or private GitHub repository, branch, or choose from ready-to-deploy starter templates.'
    },
    {
      step: '02',
      title: 'Configure Engine',
      description: 'Auto-detect build scripts, inject encrypted environment variables, and customize Node runtime versions.'
    },
    {
      step: '03',
      title: 'Instant Containerization',
      description: 'Isolated OCI sandbox compiles your assets, runs automated health checks, and spawns container instances.'
    },
    {
      step: '04',
      title: 'Live & Monitored',
      description: 'Receive a lightning-fast HTTPS production URL with continuous telemetry, error alerts, and AI diagnostics.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#070709] overflow-hidden">
      {/* Background Decorative Grids and Radial Neon Blobs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
      
      {/* Top Pink Gradient Blob */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-pink-600/20 via-fuchsia-600/10 to-transparent blur-[120px] pointer-events-none" />
      
      {/* Side Ambient Glows */}
      <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] bg-pink-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-[400px] h-[400px] bg-purple-600/10 blur-[130px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono shadow-[0_0_15px_rgba(236,72,153,0.2)]">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span>DeployHub Platform v2.4 • Next-Gen Cloud Engine</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans">
              Deploy your code. <br />
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-fuchsia-400 bg-clip-text text-transparent glow-pink-text">
                Watch it come alive.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
              Connect your GitHub repository, deploy your application, and monitor everything from one place. Built for modern engineering teams with real-time logs and Gemini AI error diagnosis.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/new')}
                className="btn-neon-pink px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(236,72,153,0.45)] group cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Deploy a Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-zinc-200 bg-zinc-900/90 border border-zinc-700/80 hover:border-pink-500/50 hover:bg-zinc-800/80 hover:text-white transition-all flex items-center gap-2 shadow-lg"
              >
                <Layers className="w-4 h-4 text-pink-400" />
                <span>View Dashboard</span>
              </button>
            </div>

            {/* Micro badges */}
            <div className="flex items-center gap-6 pt-4 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400" />
                <span>Docker sandboxing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Gemini AI Doctor</span>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Interactive Terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            {/* Glow backdrop */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-500/30 to-purple-600/30 rounded-3xl blur-xl opacity-75 animate-glow-pulse" />
            
            <div className="relative animate-float">
              <TerminalCard
                title="deployhub-cli — build-session #42"
                lines={heroTerminalLines}
                status="LIVE"
                url="https://my-app.deployhub.app"
                autoType={true}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Platform Stats */}
      <section className="border-y border-zinc-800/80 bg-[#0a0a10]/60 backdrop-blur-md py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40">
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">99.99%</div>
              <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">Uptime SLA</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40">
              <div className="text-2xl sm:text-3xl font-extrabold text-pink-400 font-mono">&lt; 35s</div>
              <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">Average Build Time</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">140k+</div>
              <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">Containers Deployed</div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">1-Click</div>
              <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">Instant Rollbacks</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Deployment Workflow) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-pink-400 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
            Workflow Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            From Git commit to global Edge in seconds
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            DeployHub automates repository cloning, dependency resolution, OCI containerization, and edge domain routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="relative p-6 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/80 hover:border-pink-500/40 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-2xl font-extrabold text-pink-500 font-mono block">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center text-[11px] font-mono text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mr-2" />
                <span>Automated Hook</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Error Explanation Showcase (Interactive Demo) */}
      <section className="py-20 bg-[#09090f] border-y border-zinc-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left AI Text */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Powered by Gemini 1.5</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                No more confusing <br />
                <span className="text-rose-400 font-mono">500-line stack traces</span>
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                When a build fails, DeployHub doesn't leave you stranded. Our built-in AI Error Doctor analyzes compiler errors, missing dependencies, or missing env vars and provides a 1-click terminal command to resolve it.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Root Cause:</strong> Pinpoints the exact file and package.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>1-Click Fix Command:</strong> Direct copy-paste fix for your shell.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Hallucination:</strong> Explains real logs with developer precision.</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => navigate('/deployments/dep_41_vortex')}
                  className="px-4 py-2.5 rounded-xl bg-pink-500/15 border border-pink-500/40 text-pink-300 text-xs font-semibold hover:bg-pink-500/25 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Test AI Doctor on Sample Failed Build</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Interactive AI Demo Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl glass-panel border border-pink-500/30 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(236,72,153,0.15)]">
                {/* Switcher Header */}
                <div className="flex items-center justify-between p-3.5 bg-[#0b0b12] border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                        activeTab === 'raw'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Raw Build Stack Trace
                    </button>
                    <button
                      onClick={() => setActiveTab('ai')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                        activeTab === 'ai'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      Gemini AI Diagnosis
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500">Interactive Preview</span>
                </div>

                {/* Switcher Content */}
                <div className="p-5 font-mono text-xs min-h-[260px] bg-[#07070a]">
                  {activeTab === 'raw' ? (
                    <div className="space-y-2 text-zinc-300">
                      <div className="text-zinc-500">$ npm run build</div>
                      <div className="text-zinc-400">vite v5.3.4 building for production...</div>
                      <div className="text-rose-400 p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 whitespace-pre-wrap">
{`error during build:
[vite:load-fallback] Could not resolve '@radix-ui/react-tooltip' from 'src/components/Tooltip.tsx'
file: /app/src/components/Tooltip.tsx:4:31
  2 | import React from 'react';
  3 | import { cn } from '../utils';
> 4 | import * as TooltipPrimitive from '@radix-ui/react-tooltip';
    |                                    ^
  5 | export const Tooltip = TooltipPrimitive.Root;

FATAL: Build exited with code 1.`}
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setActiveTab('ai')}
                          className="btn-neon-pink px-3.5 py-1.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Explain with Gemini AI</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3.5 font-sans"
                    >
                      <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-pink-300 text-xs font-semibold">
                          <Sparkles className="w-4 h-4 text-pink-400" />
                          <span>Missing Package: "@radix-ui/react-tooltip"</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Fix Verified
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        The build failed because <code className="text-pink-300 bg-zinc-800 px-1 py-0.5 rounded font-mono">src/components/Tooltip.tsx</code> imports <code className="text-pink-300 bg-zinc-800 px-1 py-0.5 rounded font-mono">@radix-ui/react-tooltip</code> which is missing from dependencies.
                      </p>

                      <div className="p-3 rounded-xl bg-black/70 border border-pink-500/30 flex items-center justify-between gap-2 font-mono text-xs text-pink-300">
                        <span>$ npm install @radix-ui/react-tooltip</span>
                        <span className="text-[11px] text-zinc-500 font-sans">1-Click Terminal Command</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-pink-400 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Built for velocity. Engineered for scale.
          </h2>
          <p className="text-sm text-zinc-400">
            Everything you need to ship frontend, full-stack, and backend microservices with extreme confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="p-6 rounded-2xl glass-panel glass-panel-hover border border-zinc-800/80 hover:border-pink-500/35 space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-pink-500/40 p-8 sm:p-14 text-center space-y-6 shadow-[0_20px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(236,72,153,0.25)]">
          {/* Top glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600" />
          <div className="absolute inset-0 bg-radial-pink pointer-events-none opacity-40" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            Ready for Production
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-2xl mx-auto">
            Ready to experience frictionless cloud deployment?
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Connect your repository now and get your project live in under 60 seconds with real-time logs and AI diagnostics.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/new')}
              className="btn-neon-pink px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_0_35px_rgba(236,72,153,0.5)] group"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Deploy a Project Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-900 border border-zinc-700 hover:border-pink-500/50 hover:text-white transition-all"
            >
              Explore Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#050508] py-8 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">DeployHub</span>
            <span>— Developer Cloud Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="hover:text-pink-400">Dashboard</button>
            <button onClick={() => navigate('/projects')} className="hover:text-pink-400">Projects</button>
            <button onClick={() => navigate('/logs')} className="hover:text-pink-400">Live Logs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
