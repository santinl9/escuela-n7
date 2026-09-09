// ─────────────────────────────────────────────────────────────────────────────
// ¿Por qué useContext para la búsqueda de estudiantes?
//
// Sin context, `busqueda` vive en GestionEstudiantes como estado local.
// Esto tiene dos limitaciones:
//
//   1. Si otro componente (p.ej. el Topbar) quisiera mostrar u operar sobre
//      la búsqueda, no podría sin hacer prop drilling hasta la raíz.
//
//   2. Al navegar a DetalleEstudiante y volver, el estado local se destruye
//      y la búsqueda se resetea a ''. Con context, el valor persiste mientras
//      el Provider esté montado (toda la sesión).
//
// Estructura (ver TemaContext para la explicación completa de useContext,
// y hooks/useBusqueda.ts para el canal y el hook):
//
//   <BusquedaProvider>          ← "canal": pone { busqueda, setBusqueda, ... }
//     <App>
//       <GestionEstudiantes />  ← useBusqueda() lee y escribe busqueda
//       <RolesYUsuarios />      ← useBusqueda() lee y escribe busquedaUsuarios
//     </App>
//   </BusquedaProvider>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from 'react';
import { BusquedaContext } from '../hooks/useBusqueda';

export function BusquedaProvider({ children }: { children: ReactNode }) {
  const [busqueda,          setBusqueda]          = useState<string>('');
  const [busquedaUsuarios,  setBusquedaUsuarios]  = useState<string>('');
  const [busquedaPersonal,  setBusquedaPersonal]  = useState<string>('');
  const [filtroDocencia,    setFiltroDocencia]    = useState<string>('');
  const [filtroEstadoPersonal, setFiltroEstadoPersonal] = useState<string>('activo');
  const [busquedaInscripciones, setBusquedaInscripciones] = useState<string>('');
  const [busquedaMatriculados,  setBusquedaMatriculados]  = useState<string>('');

  // Expone todos los textos de búsqueda y sus setters a todos los descendientes
  return (
    <BusquedaContext.Provider value={{
      busqueda, setBusqueda,
      busquedaUsuarios, setBusquedaUsuarios,
      busquedaPersonal, setBusquedaPersonal,
      filtroDocencia, setFiltroDocencia,
      filtroEstadoPersonal, setFiltroEstadoPersonal,
      busquedaInscripciones, setBusquedaInscripciones,
      busquedaMatriculados, setBusquedaMatriculados,
    }}>
      {children}
    </BusquedaContext.Provider>
  );
}
