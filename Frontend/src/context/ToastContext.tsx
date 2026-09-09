import { useState, useRef, useEffect, type ReactNode } from 'react';
import { TOAST } from '../constants/toastMessages';
import { ToastContext } from '../hooks/useToast';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible]   = useState(false);
  const [fadeOut, setFadeOut]   = useState(false);
  const [mensaje, setMensaje]   = useState<string>(TOAST.CAMBIOS_GUARDADOS);
  // Ref para guardar los IDs de los timers y poder cancelarlos si el toast
  // se dispara de nuevo antes de que termine la animación anterior.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Limpieza al desmontar (por buenas prácticas, aunque el Provider vive toda la sesión)
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const mostrarToast = (msg: string = TOAST.CAMBIOS_GUARDADOS) => {
    // Cancelar cualquier ciclo anterior en curso
    timers.current.forEach(clearTimeout);

    setMensaje(msg);
    setFadeOut(false);
    setVisible(true);

    // Después de 1.2 s de ser visible, arranca el fade-out de 1 s
    const t1 = setTimeout(() => setFadeOut(true), 1200);
    // Después de 2.2 s totales, lo quitamos del DOM
    const t2 = setTimeout(() => { setVisible(false); setFadeOut(false); }, 2200);
    timers.current = [t1, t2];
  };

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      {/* ── Toast ── */}
      {visible && (
        <div
          style={{
            opacity:    fadeOut ? 0 : 1,
            transition: fadeOut ? 'opacity 1s ease' : 'opacity 0.15s ease',
          }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background/75 backdrop-blur-md border border-outline-variant shadow-md font-body text-body-sm text-on-surface whitespace-nowrap pointer-events-none"
        >
          <span className="material-symbols-outlined text-primary text-[1.1rem]">check_circle</span>
          {mensaje}
        </div>
      )}
    </ToastContext.Provider>
  );
}
