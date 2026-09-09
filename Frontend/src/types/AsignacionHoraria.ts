// La situación de revista y el tipo de cargo se definen por asignación horaria (no por un cargo
// aparte): un mismo profesor puede ser, por ejemplo, titular en una cursada y suplente en otra a la vez.
export type SituacionRevista =
  | 'Titular'
  | 'Provisional'
  | 'Suplente'
  | 'Titular Interino'
  | 'Servicio Provisorio';

export type TipoCargo =
  | 'Auxiliar'
  | 'Directivo'
  | 'EMATP'
  | 'Preceptor'
  | 'Profesor'
  | 'Prosecretario'
  | 'Secretario'
  | 'Vicedirectivo';

export interface AsignacionHoraria {
  id: number;
  personalId: string;
  /** Uno o más bloques (ej. un Directivo puede tener un horario distinto cada día). */
  bloqueHorarioIds: number[];
  tipoCargo: TipoCargo;
  situacionRevista: SituacionRevista;
  /** Solo para Preceptor: uno o más cursos a cargo. */
  cursoIds?: number[];
  fechaIni: string;
  /** Vacío mientras la asignación sigue vigente. */
  fechaFin: string;
  /**
   * Presente cuando esta asignación es una suplencia: referencia a la AsignacionHoraria
   * titular que está cubriendo (mismo bloque horario, otra persona).
   */
  asignacionHorariaCubiertaId?: number;
}
