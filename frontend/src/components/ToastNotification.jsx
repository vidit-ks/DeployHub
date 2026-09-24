import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastNotification() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Info className="w-4 h-4 text-pink-400 shrink-0" />;
          let borderClass = 'border-pink-500/30';
          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            borderClass = 'border-emerald-500/40';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            borderClass = 'border-rose-500/40';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto p-3.5 rounded-xl bg-[#0f0f17]/95 backdrop-blur-xl border ${borderClass} shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_15px_rgba(236,72,153,0.15)] flex items-center justify-between gap-3 text-xs text-zinc-200`}
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span className="font-medium leading-snug">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-white p-1 rounded transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
