import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Clock, Ban } from 'lucide-react';

export default function StatusBadge({ status, size = 'md', showText = true }) {
  const norm = (status || 'QUEUED').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3.5 py-1.5 gap-2'
  };

  if (norm === 'LIVE' || norm === 'SUCCESS' || norm === 'SUCCESSFUL') {
    return (
      <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)] ${sizeClasses[size]}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        {showText && <span>LIVE</span>}
      </span>
    );
  }

  if (norm === 'BUILDING' || norm === 'CLONING' || norm === 'INSTALLING' || norm === 'IN_PROGRESS') {
    return (
      <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)] ${sizeClasses[size]}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
        {showText && <span>BUILDING</span>}
      </span>
    );
  }

  if (norm === 'FAILED' || norm === 'ERROR') {
    return (
      <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_14px_rgba(244,63,94,0.25)] ${sizeClasses[size]}`}>
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        {showText && <span>FAILED</span>}
      </span>
    );
  }

  // QUEUED / CANCELLED / OTHER
  return (
    <span className={`inline-flex items-center rounded-full bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 ${sizeClasses[size]}`}>
      <span className="inline-flex rounded-full h-2 w-2 bg-zinc-400"></span>
      {showText && <span>{norm}</span>}
    </span>
  );
}
