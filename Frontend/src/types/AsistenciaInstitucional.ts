export type TipoAsistencia = 'Asistencia Completa' | 'Falta Completa' | 'Media Falta';

export interface AsistenciaInstitucional {
  id: number;
  estudianteDni: number;
  fecha: string;
  tipo: TipoAsistencia;
  justificada: boolean;
}
