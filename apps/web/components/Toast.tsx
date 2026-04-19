'use client';
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: {
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    text: '#34d399',
  },
  error: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    text: '#ef4444',
  },
  warning: {
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.3)',
    text: '#f59e0b',
  },
  info: {
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.3)',
    text: '#818cf8',
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [exiting, setExiting] = useState(false);
  const colors = TOAST_COLORS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        borderRadius: 14,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        animation: exiting ? 'toastOut 0.3s ease forwards' : 'toastIn 0.35s ease',
        maxWidth: 420,
        width: '100%',
      }}
    >
      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{TOAST_ICONS[toast.type]}</span>
      <span style={{
        color: colors.text,
        fontSize: '0.9rem',
        fontWeight: 600,
        lineHeight: 1.5,
        flex: 1,
      }}>
        {toast.message}
      </span>
      <span style={{
        color: 'var(--text-dim)',
        fontSize: '0.75rem',
        flexShrink: 0,
        opacity: 0.6,
      }}>✕</span>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 20,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 420,
          width: 'calc(100% - 40px)',
        }}>
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
