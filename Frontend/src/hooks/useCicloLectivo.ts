import { createContext, useContext } from 'react';

// Forma de los datos que el contexto va a exponer
export interface CicloLectivoContextType {
  cicloLectivoActivoId: number | null;
  seleccionarCicloLectivoActivo: (id: number) => void;
  reiniciarCicloLectivoActivo: () => void;
}

// Se crea el canal. El argumento es el valor por defecto si alguien llama
// useContext fuera de un Provider (nunca debería ocurrir, por eso null).
export const CicloLectivoContext = createContext<CicloLectivoContextType | null>(null);

export function useCicloLectivo(): CicloLectivoContextType {
  const ctx = useContext(CicloLectivoContext);
  if (!ctx) throw new Error('useCicloLectivo debe usarse dentro de <CicloLectivoProvider>');
  return ctx;
}
