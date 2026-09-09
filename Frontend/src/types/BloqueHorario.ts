export type DiaSemana = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado';

export interface BloqueHorario {
  id: number;
  /** Ausente cuando el bloque es un horario laboral (cargos no docentes), sin cursada asociada. */
  cursadaId?: number;
  dia: DiaSemana;
  horaIni: string;
  horaFin: string;
}

export const nombreBloqueHorario = (bloque: Pick<BloqueHorario, 'dia' | 'horaIni' | 'horaFin'>): string =>
  `${bloque.dia} ${bloque.horaIni}–${bloque.horaFin}`;
