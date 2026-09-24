import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Zap, 
  FileText, 
  Settings, 
  Sparkles, 
  Plus, 
  Server,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const { setIsSettingsOpen } = useApp();

  const links = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Layers },
    { name: 'Deployments', path: '/deployments', icon: Zap },
    { name: 'Logs', path: '/logs', icon: FileText },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between border-r border-zinc-800/80 bg-[#08080c]/60 backdrop-blur-xl p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Quick Deploy Button */}
        <div>
          <button
            onClick={() => navigate('/new')}
            className="btn-neon-pink w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>New Project</span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block mb-2">
            Navigation
          </span>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-pink-300 bg-pink-500/10 border border-pink-500/25 shadow-[0_0_15px_rgba(236,72,153,0.12)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </NavLink>
            );
          })}
        </div>

        {/* Developer Diagnostics Box */}
        <div className="p-3.5 rounded-2xl bg-[#0f0f18] border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.08)] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>AI Error Doctor</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-300">Active</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Gemini AI automatically inspects build stack traces and suggests instant 1-click fixes.
          </p>
        </div>
      </div>

      {/* Bottom User & Settings Card */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-2">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Settings & Tokens</span>
          </div>
        </button>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Node: us-east-4</span>
          </div>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            99.98%
          </span>
        </div>
      </div>
    </aside>
  );
}
