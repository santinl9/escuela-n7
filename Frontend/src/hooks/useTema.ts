// ── Hook personalizado ────────────────────────────────────────────────────────
// Envolver useContext en un hook propio es un patrón recomendado porque:
//  - El nombre useTema() es más claro que useContext(TemaContext)
//  - El guard (si !ctx throw) avisa en desarrollo si olvidamos el Provider

import { createContext, useContext } from 'react';

// Forma de los datos que el contexto va a exponer
export interface TemaContextType {
  esOscuro: boolean;
  cambiarTema: () => void;
}

// Se crea el canal. El argumento es el valor por defecto si alguien llama
// useContext fuera de un Provider (nunca debería ocurrir, por eso null).
export const TemaContext = createContext<TemaContextType | null>(null);

export function useTema(): TemaContextType {
  // useContext se suscribe al canal y devuelve el valor actual.
  // Cada vez que el Provider actualice su value, este hook re-renderiza
  // el componente que lo llama con el nuevo valor.
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema debe usarse dentro de <TemaProvider>');
  return ctx;
}
