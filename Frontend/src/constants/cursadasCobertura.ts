import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import type { BloqueHorario } from '../types/BloqueHorario';
import type { Cursada } from '../types/Cursada';
import { estaVigente } from './fechas';

/**
 * La asignación horaria de Profesor, vigente, cuyos bloques cubren actualmente una cursada.
 * Se excluyen las asignaciones de personalIdExcluido para no bloquearle a una persona su propia
 * cursada mientras edita su ficha.
 */
export const asignacionQueCubreCursada = (
  cursadaId: number,
  horarios: AsignacionHoraria[],
  bloques: BloqueHorario[],
  personalIdExcluido?: string,
): AsignacionHoraria | undefined =>
  horarios.find(h =>
    h.tipoCargo === 'Profesor' &&
    h.personalId !== personalIdExcluido &&
    estaVigente(h.fechaIni, h.fechaFin) &&
    h.bloqueHorarioIds.some(id => bloques.find(b => b.id === id)?.cursadaId === cursadaId)
  );

/**
 * La asignación horaria de Preceptor, vigente, a cargo de un curso (a diferencia del Profesor,
 * que cubre una cursada puntual por sus bloques, el Preceptor está a cargo de uno o más cursos
 * enteros, vía `cursoIds`).
 */
export const asignacionPreceptorDeCurso = (
  cursoId: number,
  horarios: AsignacionHoraria[],
): AsignacionHoraria | undefined =>
  horarios.find(h =>
    h.tipoCargo === 'Preceptor' &&
    estaVigente(h.fechaIni, h.fechaFin) &&
    (h.cursoIds ?? []).includes(cursoId)
  );

/**
 * Cursadas elegibles para una asignación de tipo Profesor: solo las del ciclo lectivo actual y,
 * de esas, solo las que no están cubiertas por otro profesor vigente.
 */
export const cursadasDisponiblesParaHorario = (
  cursadas: Cursada[],
  cicloLectivoActualId: number | undefined,
  horarios: AsignacionHoraria[],
  bloques: BloqueHorario[],
  personalIdExcluido?: string,
): Cursada[] =>
  cursadas.filter(c => {
    if (c.cicloLectivoId !== cicloLectivoActualId) return false;
    return asignacionQueCubreCursada(c.id, horarios, bloques, personalIdExcluido) === undefined;
  });
