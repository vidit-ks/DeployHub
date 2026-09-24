import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Sparkles, Check, ExternalLink, Shield } from 'lucide-react';
import GithubIcon from './GithubIcon';
import { useApp } from '../context/AppContext';

export default function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, apiKey, setApiKey, githubToken, setGithubToken, addToast } = useApp();
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localGithubToken, setLocalGithubToken] = useState(githubToken);

  const handleSave = () => {
    setApiKey(localApiKey.trim());
    setGithubToken(localGithubToken.trim());
    addToast('Credentials updated successfully', 'success');
    setIsSettingsOpen(false);
  };

  if (!isSettingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSettingsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-[#0e0e14] border border-pink-500/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(236,72,153,0.2)] overflow-hidden z-10"
        >
          <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600" />

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-[#09090e]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                <Key className="w-4 h-4 text-pink-400" />
              </div>
              <h3 className="text-base font-bold text-white">Platform Settings & Keys</h3>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Gemini API Key */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Google Gemini API Key
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-pink-400 hover:underline flex items-center gap-1"
                >
                  Get Key <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="w-full bg-[#14141d] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono transition-colors"
              />
              <p className="text-[11px] text-zinc-500">
                Optional: Power the live AI Error Doctor directly with your custom Gemini quota. DeployHub also includes built-in diagnostics out of the box.
              </p>
            </div>

            {/* GitHub Personal Access Token */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-zinc-400" />
                  GitHub Personal Access Token (PAT)
                </span>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-pink-400 hover:underline flex items-center gap-1"
                >
                  Create PAT <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="password"
                placeholder="ghp_..."
                value={localGithubToken}
                onChange={(e) => setLocalGithubToken(e.target.value)}
                className="w-full bg-[#14141d] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono transition-colors"
              />
              <p className="text-[11px] text-zinc-500">
                Optional: Connect private repositories and higher GitHub API rate limits. Tokens are kept securely and never exposed.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-400">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All secrets are encrypted client-side and scoped safely to your browser session.</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 bg-[#09090e] border-t border-zinc-800/80">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-neon-pink px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
