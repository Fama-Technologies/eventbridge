'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-accents-discount" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-errors-main" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-primary-01" />;
      default:
        return <Info className="w-5 h-5 text-accents-link" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-accents-discount bg-shades-white';
      case 'error':
        return 'border-errors-main bg-errors-bg';
      case 'warning':
        return 'border-primary-01 bg-accents-peach';
      default:
        return 'border-accents-link bg-shades-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg
            ${getStyles(toast.type)}
            animate-slide-in-right
          `}
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`,
          }}
        >
          {getIcon(toast.type)}
          <p className="text-sm text-shades-black font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 rounded-full hover:bg-neutrals-03 transition-colors"
          >
            <X className="w-4 h-4 text-neutrals-07" />
          </button>
        </div>
      ))}
    </div>
  );
}
