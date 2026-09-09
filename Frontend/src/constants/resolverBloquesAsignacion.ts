import type { HorarioForm } from '../types/formTypes/personalFormTypes';
import type { BloqueHorario } from '../types/BloqueHorario';

/**
 * A partir de una asignación del formulario, resuelve los bloqueHorarioIds finales a persistir:
 * - Profesor: todos los bloques de la cursada elegida.
 * - Resto de los cargos (incluido Preceptor): los bloques propios cargados, reutilizando los
 *   que ya existen (mismo día/horario, sin cursada) o creando los que todavía no existen. Un
 *   mismo bloque libre puede abarcar varios días (ej. "Todos los días" o un rango), y cada día
 *   se resuelve a su propio BloqueHorario.
 *
 * `bloquesNuevosAcumulados` recibe los bloques recién creados por llamadas previas dentro del
 * mismo guardado (para reutilizarlos entre asignaciones del mismo personal y no duplicarlos) y
 * se le agregan los que esta llamada cree. `proximoId` es un contador compartido entre llamadas
 * para numerar los bloques nuevos sin colisiones.
 */
export function resolverBloquesDeHorario(
  h: HorarioForm,
  bloquesExistentes: BloqueHorario[],
  bloquesNuevosAcumulados: BloqueHorario[],
  proximoId: { valor: number }
): number[] {
  const bloquesDisponibles = [...bloquesExistentes, ...bloquesNuevosAcumulados];

  if (h.tipoCargo === 'Profesor') {
    const cursadaId = Number(h.cursadaId);
    return bloquesDisponibles.filter(b => b.cursadaId === cursadaId).map(b => b.id);
  }

  return h.bloquesLibres.flatMap(bl =>
    bl.dias.map(dia => {
      const existente = bloquesDisponibles.find(
        b => b.cursadaId === undefined && b.dia === dia && b.horaIni === bl.horaIni && b.horaFin === bl.horaFin
      );
      if (existente) return existente.id;
      const nuevo: BloqueHorario = { id: proximoId.valor++, dia: dia as BloqueHorario['dia'], horaIni: bl.horaIni, horaFin: bl.horaFin };
      bloquesNuevosAcumulados.push(nuevo);
      return nuevo.id;
    })
  );
}
