import { type FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { subscribeToToast, type ToastPayload } from "../lib/toast";

interface ActiveToast extends Required<Pick<ToastPayload, "message" | "tone" | "durationMs">> {
  id: number;
}

export const ToastViewport: FunctionalComponent = () => {
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToToast((payload) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      const nextToast: ActiveToast = {
        id: Date.now(),
        message: payload.message,
        tone: payload.tone ?? "neutral",
        durationMs: payload.durationMs ?? 3000,
      };

      setActiveToast(nextToast);

      timeoutRef.current = window.setTimeout(() => {
        setActiveToast((currentToast) => (currentToast?.id === nextToast.id ? null : currentToast));
        timeoutRef.current = null;
      }, nextToast.durationMs);
    });

    return () => {
      unsubscribe();

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!activeToast) {
    return null;
  }

  return (
    <div class="toast-viewport" aria-live="polite" aria-atomic="true">
      <div class={`toast toast--${activeToast.tone}`} key={activeToast.id} role="status">
        <span>{activeToast.message}</span>
      </div>
    </div>
  );
};
