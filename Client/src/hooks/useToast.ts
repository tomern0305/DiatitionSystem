import { useState } from "react";
import type { ToastType } from "../components/layout/Toast";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = (message: string, type: ToastType) => setToast({ message, type });
  const dismissToast = () => setToast(null);
  return { toast, showToast, dismissToast };
}
