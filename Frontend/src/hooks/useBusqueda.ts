import { createContext, useContext } from 'react';

export interface BusquedaContextType {
  busqueda: string;
  setBusqueda: (valor: string) => void;
  busquedaUsuarios: string;
  setBusquedaUsuarios: (valor: string) => void;
  busquedaPersonal: string;
  setBusquedaPersonal: (valor: string) => void;
  filtroDocencia: string;
  setFiltroDocencia: (valor: string) => void;
  filtroEstadoPersonal: string;
  setFiltroEstadoPersonal: (valor: string) => void;
  busquedaInscripciones: string;
  setBusquedaInscripciones: (valor: string) => void;
  busquedaMatriculados: string;
  setBusquedaMatriculados: (valor: string) => void;
}

// Canal de comunicación para las búsquedas del sistema
export const BusquedaContext = createContext<BusquedaContextType | null>(null);

// Cualquier componente dentro del Provider puede leer/escribir las búsquedas
export function useBusqueda(): BusquedaContextType {
  const ctx = useContext(BusquedaContext);
  if (!ctx) throw new Error('useBusqueda debe usarse dentro de <BusquedaProvider>');
  return ctx;
}
