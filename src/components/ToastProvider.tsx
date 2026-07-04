"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
  const counter = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current);
    counter.current += 1;
    setToast({ message, key: counter.current });
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          key={toast.key}
          className="animate-vt-toast fixed bottom-8 left-1/2 z-50 rounded-full bg-vt-accent px-6 py-3 text-sm font-bold text-vt-accent-fg shadow-[0_12px_30px_rgba(0,0,0,.4)]"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
