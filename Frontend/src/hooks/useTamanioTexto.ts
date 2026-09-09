// ── Hook personalizado ────────────────────────────────────────────────────────
// Mismo patrón que useTema.ts: createContext + hook propio, separados del
// Provider (que vive en context/TamanioTextoContext.tsx).

import { createContext, useContext } from 'react';

// Tres escalones nada más: alcanza para el pedido de "letra más grande" sin
// convertir esto en un slider continuo que nadie va a terminar de ajustar.
export type TamanioTexto = 'normal' | 'grande' | 'extra-grande';

export const NIVELES_TAMANIO_TEXTO: TamanioTexto[] = ['normal', 'grande', 'extra-grande'];

export interface TamanioTextoContextType {
  tamanio: TamanioTexto;
  aumentarTamanio: () => void;
  disminuirTamanio: () => void;
}

export const TamanioTextoContext = createContext<TamanioTextoContextType | null>(null);

export function useTamanioTexto(): TamanioTextoContextType {
  const ctx = useContext(TamanioTextoContext);
  if (!ctx) throw new Error('useTamanioTexto debe usarse dentro de <TamanioTextoProvider>');
  return ctx;
}
