import { createContext, useContext } from 'react';

export interface ToastContextType {
  mostrarToast: (mensaje?: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
