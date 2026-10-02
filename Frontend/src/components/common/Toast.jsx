import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2.5 sm:max-w-sm pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              item.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-[#0f291e]/95 dark:border-emerald-500/40 dark:text-emerald-100'
                : item.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-[#2a1215]/95 dark:border-rose-500/40 dark:text-rose-100'
                : item.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-[#291e0a]/95 dark:border-amber-500/40 dark:text-amber-100'
                : 'bg-cyan-50 text-cyan-900 border-cyan-300 dark:bg-[#111827]/95 dark:border-cyan-500/40 dark:text-cyan-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
            </div>

            <p className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">{item.message}</p>

            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
