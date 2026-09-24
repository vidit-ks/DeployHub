import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TerminalCard({
  title = "DeployHub Engine",
  lines = [],
  status = "LIVE",
  url = "https://my-app.deployhub.app",
  interactive = false,
  autoType = false,
  className = ""
}) {
  const [copied, setCopied] = useState(false);
  const [displayedLines, setDisplayedLines] = useState(autoType ? [] : lines);

  // If autoType is true, stream the lines line-by-line
  useEffect(() => {
    const validLines = Array.isArray(lines) ? lines : [];
    if (!autoType) {
      setDisplayedLines(validLines);
      return;
    }

    setDisplayedLines([]);
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < validLines.length) {
        setDisplayedLines(prev => [...prev, validLines[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [lines, autoType]);

  const copyToClipboard = () => {
    const text = displayedLines
      .map(l => (typeof l === 'string' ? l : l?.message || ''))
      .filter(Boolean)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative rounded-2xl overflow-hidden glass-panel border border-pink-500/25 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(236,72,153,0.15)] ${className}`}
    >
      {/* Subtle top pink glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-500 to-transparent" />

      {/* Terminal Window Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a10]/90 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/40 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40 inline-block" />
          </div>
          <div className="ml-2 flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <Terminal className="w-3.5 h-3.5 text-pink-400" />
            <span>{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={status} size="sm" />
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-zinc-400 hover:text-pink-300 rounded-md hover:bg-zinc-800/60 transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-5 font-mono text-xs sm:text-[13px] leading-relaxed space-y-2 bg-[#060609]/95 text-zinc-300 max-h-[360px] overflow-y-auto">
        {displayedLines.map((line, idx) => {
          if (!line) return null;
          const text = typeof line === 'string' ? line : line?.message || '';
          const level = typeof line === 'object' ? line?.log_level : null;

          let colorClass = 'text-zinc-300';
          if (text.startsWith('$')) colorClass = 'text-pink-400 font-semibold';
          else if (text.startsWith('✓') || text.includes('successful') || text.includes('LIVE')) colorClass = 'text-emerald-400 font-medium';
          else if (text.startsWith('●')) colorClass = 'text-amber-300';
          else if (text.startsWith('✕') || text.startsWith('FATAL') || text.includes('error') || level === 'error') colorClass = 'text-rose-400';
          else if (text.startsWith('▲') || text.startsWith('✨')) colorClass = 'text-fuchsia-400 font-medium';

          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-zinc-600 select-none text-[11px] w-5 text-right font-mono">
                {idx + 1}
              </span>
              <span className={`break-all whitespace-pre-wrap ${colorClass}`}>
                {text}
              </span>
            </div>
          );
        })}

        {/* Live URL footer when LIVE */}
        {status === 'LIVE' && url && (
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-zinc-950/40 p-2.5 rounded-lg border border-pink-500/20">
            <div>
              <span className="text-zinc-500 font-mono block text-[10px] uppercase tracking-wider">Production URL</span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-pink-400 hover:text-pink-300 underline underline-offset-2 flex items-center gap-1 font-mono font-medium"
              >
                {url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-mono">STATUS</span>
              <StatusBadge status="LIVE" size="sm" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
