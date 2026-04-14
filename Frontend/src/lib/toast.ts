export type ToastTone = "success" | "error" | "neutral";

export interface ToastPayload {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
}

const TOAST_EVENT_NAME = "consulta-tce:toast";

// Dispara um evento global simples para evitar acoplamento entre as telas e o viewport de toast.
export function showToast(payload: ToastPayload) {
  if (typeof window === "undefined" || !payload.message.trim()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, {
      detail: payload,
    }),
  );
}

export function subscribeToToast(listener: (payload: ToastPayload) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const wrappedListener = (event: Event) => {
    const customEvent = event as CustomEvent<ToastPayload>;
    listener(customEvent.detail);
  };

  window.addEventListener(TOAST_EVENT_NAME, wrappedListener);

  return () => {
    window.removeEventListener(TOAST_EVENT_NAME, wrappedListener);
  };
}
