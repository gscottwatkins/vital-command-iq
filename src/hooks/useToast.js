import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, duration = 2500) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  return { toast, showToast: show };
}
