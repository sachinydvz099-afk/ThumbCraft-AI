import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  actionUrl?: string;
  actionLabel?: string;
}

let toastListeners: Array<(toast: ToastMessage) => void> = [];

export function showToast(toast: Omit<ToastMessage, 'id'>) {
  const newToast: ToastMessage = {
    ...toast,
    id: Math.random().toString(36).substring(2, 9),
    duration: toast.duration || 5000,
  };
  toastListeners.forEach(listener => listener(newToast));
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (toast: ToastMessage) => {
      setToasts(prev => [...prev, toast]);

      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
      }
    };

    toastListeners.push(handler);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handler);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => {
        let borderClass = 'border-indigo-500/30';
        let bgClass = 'bg-[#111827]/95 text-slate-100';
        let icon = <Info className="w-5 h-5 text-indigo-400 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/40';
          icon = <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/40';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border ${borderClass} ${bgClass} transition-all duration-300 transform translate-y-0`}
          >
            {icon}
            <div className="flex-1 text-sm">
              {toast.title && <h4 className="font-semibold text-white mb-0.5">{toast.title}</h4>}
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">{toast.message}</p>
              {toast.actionUrl && (
                <a
                  href={toast.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 underline"
                >
                  {toast.actionLabel || 'View Image'} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
