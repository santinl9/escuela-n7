// ─────────────────────────────────────────────────────────────────────────────
// El ciclo lectivo "activo" que elige cada usuario (p.ej. desde Gestión de
// Ciclos Lectivos) se guarda en sessionStorage, no en los datos del ciclo:
//
//   - Vive mientras dure la sesión del navegador (se pierde al cerrar la
//     pestaña), a diferencia de localStorage.
//   - Es independiente por sesión/usuario: dos personas usando el sistema
//     al mismo tiempo pueden estar paradas en ciclos lectivos distintos sin
//     pisarse.
//   - Nunca se escribe de vuelta en el campo `activo` de CicloLectivo (ese
//     campo queda como el valor semilla del mock; no se persiste el cambio).
//
// Mientras la sesión no eligió nada todavía (sessionStorage vacío, p.ej. al
// reiniciar el navegador), se usa como valor por defecto el ciclo lectivo
// actual (el más reciente por fecha de inicio) sin necesidad de que nadie lo
// marque a mano. Al iniciar sesión (login) se vuelve a parar explícitamente
// en el ciclo actual, pisando cualquier elección de una sesión anterior.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from 'react';
import { useFetch } from '../hooks/useFetch';
import { CicloLectivoContext } from '../hooks/useCicloLectivo';
import { cicloLectivoActual, type CicloLectivo } from '../types/CicloLectivo';

const CLAVE_SESSION = 'cicloLectivoActivoId';

export function CicloLectivoProvider({ children }: { children: ReactNode }) {
  const { data: ciclosData } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const ciclos = ciclosData ?? [];

  const [cicloLectivoActivoIdSesion, setCicloLectivoActivoIdSesion] = useState<number | null>(() => {
    const guardado = sessionStorage.getItem(CLAVE_SESSION);
    return guardado ? Number(guardado) : null;
  });

  const cicloLectivoActivoId = cicloLectivoActivoIdSesion ?? cicloLectivoActual(ciclos)?.id ?? null;

  const seleccionarCicloLectivoActivo = (id: number) => {
    setCicloLectivoActivoIdSesion(id);
    sessionStorage.setItem(CLAVE_SESSION, String(id));
  };

  // Se invoca al iniciar sesión (login): vuelve a parar el ciclo activo en
  // el actual, sin importar qué haya quedado elegido en una sesión previa.
  const reiniciarCicloLectivoActivo = () => {
    const actual = cicloLectivoActual(ciclos);
    if (actual) seleccionarCicloLectivoActivo(actual.id);
  };

  return (
    <CicloLectivoContext.Provider
      value={{ cicloLectivoActivoId, seleccionarCicloLectivoActivo, reiniciarCicloLectivoActivo }}
    >
      {children}
    </CicloLectivoContext.Provider>
  );
}
