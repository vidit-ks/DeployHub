import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Plus, Settings, Activity, Terminal, LayoutDashboard, Layers, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsSettingsOpen } = useApp();

  const isLanding = location.pathname === '/';

  const navLinks = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Layers },
    { name: 'Deployments', path: '/deployments', icon: Zap },
    { name: 'Logs', path: '/logs', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#070709]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-600 via-pink-500 to-fuchsia-500 p-0.5 shadow-[0_0_18px_rgba(236,72,153,0.5)] group-hover:shadow-[0_0_26px_rgba(236,72,153,0.8)] transition-all">
              <div className="w-full h-full bg-[#09090e] rounded-[10px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight text-white font-sans">Deploy<span className="text-pink-500">Hub</span></span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20">v2.4</span>
            </div>
          </Link>

          {/* Nav links for desktop (hidden on landing page) */}
          {!isLanding && (
            <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-zinc-800">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'text-pink-300 bg-pink-500/10 border border-pink-500/20 shadow-[0_0_12px_rgba(236,72,153,0.15)]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Edge All Systems 100%</span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-zinc-400 hover:text-pink-300 rounded-lg hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700 transition-colors"
            title="Settings & API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Quick Deploy CTA Button */}
          <button
            onClick={() => navigate('/new')}
            className="btn-neon-pink px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_18px_rgba(236,72,153,0.35)]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Project</span>
          </button>

          {/* If on landing, link to dashboard */}
          {isLanding && (
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-zinc-900/90 border border-zinc-700/80 hover:border-pink-500/40 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
