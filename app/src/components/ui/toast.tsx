"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";

type ToastKind = "success" | "error";
interface ToastState {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const VISIBLE_MS = 2800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((kind: ToastKind, message: string) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), kind, message });
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => show("success", m), error: (m) => show("error", m) }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      {/* aria-live so screen readers announce changes without stealing focus */}
      <div aria-live="polite" className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 pointer-events-none">
        {toast && (
          <div
            key={toast.id}
            className="animate-fade-in bg-espresso text-ivory px-4 py-3 rounded-xl shadow-floating flex items-center gap-2.5 text-xs max-w-xs"
          >
            {toast.kind === "success" ? (
              <CheckCircleIcon size={16} weight="fill" className="text-sage shrink-0 [filter:brightness(1.8)]" />
            ) : (
              <WarningIcon size={16} weight="fill" className="text-ochre shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
