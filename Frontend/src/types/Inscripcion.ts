import type { Cursada } from './Cursada';
import type { BloqueHorario } from './BloqueHorario';
import type { Aula } from './Aula';
import type { Curso } from './Curso';

export type TipoInscripcion = 'Normal' | 'Recupera' | 'Intensifica' | 'Oyente';

export type EstadoInscripcion = 'Aprobada' | 'Libre' | 'Regular' | 'Desaprobado' | 'Discontinuo';

export interface Inscripcion {
  id: number;
  estudianteDni: number;
  cursadaId: number;
  tipo: TipoInscripcion;
  // Cursada en la que efectivamente intensifica cuando tipo es 'Intensifica' (puede ser
  // distinta de cursadaId: se intensifica la misma materia en otro curso/comisión). Se define
  // una única vez al inscribir y se reutiliza para todos los períodos de intensificación.
  cursadaIntensificacionId: number | null;
  estado: EstadoInscripcion;
  fecha: string;
  notaFinal: number | null;
}

// ── Aprobación por nota final ────────────────────────────────────────────────
// El umbral de aprobación depende de cuándo se carga la nota (fecha del sistema al momento
// de guardarla, no la fecha de inscripción): diciembre/enero/febrero es la mesa de examen de
// verano/complementaria (umbral más bajo); el resto del año es la mesa regular.
export const UMBRAL_APROBACION_VERANO  = 4;
export const UMBRAL_APROBACION_REGULAR = 7;

export const umbralAprobacionNotaFinal = (fecha: Date = new Date()): number => {
  const mes = fecha.getMonth() + 1; // getMonth() es 0-11
  return mes === 12 || mes === 1 || mes === 2 ? UMBRAL_APROBACION_VERANO : UMBRAL_APROBACION_REGULAR;
};

// Estado que le corresponde a una inscripción según su nota final y el umbral vigente al
// momento de cargarla. La nota final se carga una única vez: no hay un camino de vuelta desde
// 'Aprobada'/'Desaprobado' a otro estado a partir de esta función.
export const estadoPorNotaFinal = (notaFinal: number, fecha: Date = new Date()): EstadoInscripcion =>
  notaFinal >= umbralAprobacionNotaFinal(fecha) ? 'Aprobada' : 'Desaprobado';

// ── Elegibilidad para inscribirse a una cursada ──────────────────────────────
// Reglas compartidas por los dos flujos de inscripción (cursada fija → varios estudiantes en
// GestionInscripcionesCursada, y estudiante fijo → varias cursadas en DetalleEstudiante), para
// no duplicarlas en cada página.

export const TOPE_INSCRIPCIONES_SIMULTANEAS = 12;
export const TOPE_INTENSIFICACIONES_SIMULTANEAS = 4;
// A partir de cuántas inscripciones restantes (antes de llegar al tope) se empieza a avisar
// que una cursada tiene más carga horaria que el promedio.
export const UMBRAL_AVISO_CARGA_HORARIA = 3;

// Dos bloques horarios se superponen si son del mismo día y sus franjas horarias se cruzan.
export const seSuperponenBloques = (
  a: Pick<BloqueHorario, 'dia' | 'horaIni' | 'horaFin'>,
  b: Pick<BloqueHorario, 'dia' | 'horaIni' | 'horaFin'>
): boolean => a.dia === b.dia && a.horaIni < b.horaFin && b.horaIni < a.horaFin;

const minutosDeBloque = (b: Pick<BloqueHorario, 'horaIni' | 'horaFin'>): number => {
  const [hIni, mIni] = b.horaIni.split(':').map(Number);
  const [hFin, mFin] = b.horaFin.split(':').map(Number);
  return (hFin * 60 + mFin) - (hIni * 60 + mIni);
};

// Carga horaria semanal de una cursada, en minutos, sumando todos sus bloques horarios.
export const cargaHorariaDeCursada = (cursadaId: number, bloques: Pick<BloqueHorario, 'cursadaId' | 'horaIni' | 'horaFin'>[]): number =>
  bloques.filter(b => b.cursadaId === cursadaId).reduce((total, b) => total + minutosDeBloque(b), 0);

// Promedio de carga horaria semanal sobre un conjunto de cursadas (se le pasan ya filtradas
// por el ciclo lectivo que corresponda comparar).
export const promedioCargaHorariaCiclo = (cursadas: Pick<Cursada, 'id'>[], bloques: Pick<BloqueHorario, 'cursadaId' | 'horaIni' | 'horaFin'>[]): number => {
  if (cursadas.length === 0) return 0;
  const total = cursadas.reduce((sum, c) => sum + cargaHorariaDeCursada(c.id, bloques), 0);
  return total / cursadas.length;
};

export interface ElegibilidadCursada {
  // Bloqueo total: no puede inscribirse de ninguna forma.
  motivo?: string;
  // No bloquea, pero solo puede anotarse como 'Oyente' (el resto de los tipos queda deshabilitado).
  soloOyente?: string;
  cupoAulaRestante: number;
  intensificacionesRestantes: number;
  inscripcionesRestantes: number;
  // Avisos informativos, nunca bloquean la inscripción.
  cargaHorariaAlta?: boolean;
  turnoDistinto?: boolean;
}

interface ParametrosElegibilidadCursada {
  estudianteDni: number;
  cursada: Cursada;
  inscripciones: Inscripcion[];
  cursadas: Cursada[];
  bloques: BloqueHorario[];
  aulas: Aula[];
  cursos: Curso[];
  cicloLectivoId: number;
  promedioCargaHoraria: number;
}

export const evaluarElegibilidadCursada = ({
  estudianteDni,
  cursada,
  inscripciones,
  cursadas,
  bloques,
  aulas,
  cursos,
  cicloLectivoId,
  promedioCargaHoraria,
}: ParametrosElegibilidadCursada): ElegibilidadCursada => {
  const inscripcionesDelEstudiante = inscripciones.filter(i => i.estudianteDni === estudianteDni);
  // Inscripciones "simultáneas" del estudiante: todas las de este ciclo lectivo, sin importar
  // el estado (una inscripción ya finalizada este año igual ocupó uno de los cupos del año).
  const inscripcionesDelCiclo = inscripcionesDelEstudiante.filter(
    i => cursadas.find(c => c.id === i.cursadaId)?.cicloLectivoId === cicloLectivoId
  );

  const intensificacionesRestantes = Math.max(0, TOPE_INTENSIFICACIONES_SIMULTANEAS - inscripcionesDelCiclo.filter(i => i.tipo === 'Intensifica').length);
  const inscripcionesRestantes = Math.max(0, TOPE_INSCRIPCIONES_SIMULTANEAS - inscripcionesDelCiclo.length);

  const aula = aulas.find(a => a.id === cursada.aulaId);
  const inscriptosEnCursada = inscripciones.filter(i => i.cursadaId === cursada.id).length;
  const cupoAulaRestante = aula ? aula.capacidad - inscriptosEnCursada : Infinity;

  const cargaHorariaAlta = inscripcionesRestantes <= UMBRAL_AVISO_CARGA_HORARIA
    && cargaHorariaDeCursada(cursada.id, bloques) > promedioCargaHoraria;

  const cursoDeCursada = cursos.find(c => c.id === cursada.cursoId);
  const turnosDelEstudiante = new Set(
    inscripcionesDelCiclo
      .map(i => cursadas.find(c => c.id === i.cursadaId))
      .map(c => c && cursos.find(cur => cur.id === c.cursoId)?.turno)
      .filter((t): t is Curso['turno'] => t !== undefined)
  );
  const turnoDistinto = turnosDelEstudiante.size > 0 && cursoDeCursada !== undefined && !turnosDelEstudiante.has(cursoDeCursada.turno);

  if (inscripcionesDelEstudiante.some(i => i.cursadaId === cursada.id)) {
    return { motivo: 'Ya está inscripto en esta cursada', cupoAulaRestante, intensificacionesRestantes, inscripcionesRestantes };
  }

  // No debe tener la materia de esta cursada aprobada en otra inscripción.
  const materiaYaAprobada = inscripcionesDelEstudiante.some(i => {
    if (i.estado !== 'Aprobada') return false;
    return cursadas.find(c => c.id === i.cursadaId)?.materiaId === cursada.materiaId;
  });
  if (materiaYaAprobada) {
    return { motivo: 'Ya tiene esta materia aprobada en otra cursada', cupoAulaRestante, intensificacionesRestantes, inscripcionesRestantes };
  }

  if (cupoAulaRestante <= 0) {
    return { motivo: 'No hay cupo disponible en el aula', cupoAulaRestante, intensificacionesRestantes, inscripcionesRestantes };
  }

  // No debe tener, en inscripciones regulares, un bloque horario solapado con el de esta cursada.
  const bloquesDeCursada = bloques.filter(b => b.cursadaId === cursada.id);
  const tieneSuperposicionHoraria = inscripcionesDelEstudiante.some(i => {
    if (i.estado !== 'Regular') return false;
    const bloquesDeEsaInscripcion = bloques.filter(b => b.cursadaId === i.cursadaId);
    return bloquesDeEsaInscripcion.some(b1 => bloquesDeCursada.some(b2 => seSuperponenBloques(b1, b2)));
  });
  if (tieneSuperposicionHoraria) {
    return {
      soloOyente: 'Tiene un horario superpuesto con otra cursada regular',
      cupoAulaRestante, intensificacionesRestantes, inscripcionesRestantes, cargaHorariaAlta, turnoDistinto,
    };
  }

  if (inscripcionesRestantes <= 0) {
    return {
      soloOyente: `Alcanzó el máximo de ${TOPE_INSCRIPCIONES_SIMULTANEAS} inscripciones simultáneas`,
      cupoAulaRestante, intensificacionesRestantes, inscripcionesRestantes, cargaHorariaAlta, turnoDistinto,
    };
  }

  return { cupoAulaRestante, intensificacionesRestantes, inscripcionesRestantes, cargaHorariaAlta, turnoDistinto };
};
