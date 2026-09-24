import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  RefreshCw, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Copy, 
  Check, 
  ShieldCheck,
  Maximize2
} from 'lucide-react';

export default function LivePreviewModal({ isOpen, onClose, liveUrl, title }) {
  const [device, setDevice] = useState('desktop'); // desktop, tablet, mobile
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !liveUrl) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFrameWidth = () => {
    switch (device) {
      case 'mobile': return 'max-w-[390px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-6xl h-[90vh] bg-[#0c0c14] border border-pink-500/30 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(236,72,153,0.2)] overflow-hidden"
        >
          {/* Top Browser Bar */}
          <div className="px-4 py-3 bg-[#08080d] border-b border-zinc-800/80 flex items-center justify-between gap-3 shrink-0">
            {/* Window Controls & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer" onClick={onClose} />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500" />
              </div>
              <div className="text-xs font-semibold text-white truncate hidden sm:inline-block">
                {title || 'Live Application Preview'}
              </div>
            </div>

            {/* Address Bar */}
            <div className="flex-1 max-w-xl mx-2">
              <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-mono text-zinc-300">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate text-[11px] text-pink-300">{liveUrl}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    onClick={handleCopy}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy URL"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  </button>
                  <button 
                    onClick={() => setIframeKey(k => k + 1)}
                    className="p-1 hover:text-white transition-colors"
                    title="Reload"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Device Toggles & Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Responsive Toggles */}
              <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${device === 'desktop' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${device === 'tablet' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${device === 'mobile' ? 'bg-pink-500/20 text-pink-400' : 'text-zinc-400 hover:text-white'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-neon-pink px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Frame Container */}
          <div className="flex-1 bg-[#06060a] p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className={`h-full ${getFrameWidth()} transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800/80 shadow-2xl bg-[#09090f]`}>
              <iframe
                key={iframeKey}
                src={liveUrl}
                title={title || "Deployment Preview"}
                className="w-full h-full border-0 bg-transparent"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
