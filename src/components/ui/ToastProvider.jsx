"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

import styles from "./Toast.module.scss";

const ToastContext = createContext(null);

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, variant = "success") => {
      dismiss();
      setToast({ message, variant });
      timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  useEffect(() => () => dismiss(), [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      {toast ? (
        <div
          className={styles.viewport}
          role={toast.variant === "error" ? "alert" : "status"}
          aria-live={toast.variant === "error" ? "assertive" : "polite"}
        >
          <div
            className={`${styles.toast} ${styles[toast.variant] || styles.success}`}
          >
            {toast.variant === "error" ? (
              <AlertCircle className={styles.icon} aria-hidden />
            ) : (
              <CheckCircle className={styles.icon} aria-hidden />
            )}
            <span className={styles.message}>{toast.message}</span>
            <button
              type="button"
              className={styles.close}
              onClick={dismiss}
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
