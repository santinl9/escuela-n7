import type { Cursada } from './Cursada';
import type { Inscripcion } from './Inscripcion';

export type Turno = 'Maniana' | 'Tarde' | 'Noche';

export interface Curso {
  id: number;
  nivel: number;
  nombre: string;
  turno: Turno;
  activo: boolean;
  // Solo los cursos de 4to a 6to año pertenecen a una orientación.
  orientacionId?: number;
}

export const nombreCurso = (curso: Pick<Curso, 'nivel' | 'nombre'>): string =>
  `${curso.nivel}° ${curso.nombre}`;

// El curso más alto (mayor nivel) entre las cursadas de un conjunto de inscripciones.
export const cursoMasAltoDe = (
  inscripcionesDelEstudiante: Pick<Inscripcion, 'cursadaId'>[],
  cursadas: Pick<Cursada, 'id' | 'cursoId'>[],
  cursos: Curso[]
): Curso | undefined =>
  inscripcionesDelEstudiante
    .map(i => cursadas.find(c => c.id === i.cursadaId))
    .map(c => (c ? cursos.find(cur => cur.id === c.cursoId) : undefined))
    .reduce<Curso | undefined>((max, c) => (c && (!max || c.nivel > max.nivel) ? c : max), undefined);

// El curso al que un estudiante está efectivamente matriculado: el más alto entre las
// cursadas del ciclo lectivo indicado a las que tiene una inscripción. Se recalcula siempre
// a partir de las inscripciones vigentes (no del cursoId guardado en Matricula) para que la
// matrícula nunca quede "colgada" de un ciclo lectivo que ya terminó y del que el estudiante
// no volvió a inscribirse a nada.
export const cursoEfectivoDe = (
  estudianteDni: number,
  inscripciones: Pick<Inscripcion, 'estudianteDni' | 'cursadaId'>[],
  cursadas: Pick<Cursada, 'id' | 'cursoId' | 'cicloLectivoId'>[],
  cursos: Curso[],
  cicloLectivoId: number | undefined
): Curso | undefined => {
  if (cicloLectivoId === undefined) return undefined;
  const inscripcionesVigentes = inscripciones.filter(i =>
    i.estudianteDni === estudianteDni && cursadas.find(c => c.id === i.cursadaId)?.cicloLectivoId === cicloLectivoId
  );
  return cursoMasAltoDe(inscripcionesVigentes, cursadas, cursos);
};
