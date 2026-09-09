export type TipoCalificacion = 'Numerica' | 'Valorativa' | 'Intensificacion';

export interface PeriodoCarga {
  id: number;
  descripcion: string;
  fechaIni: string;
  fechaFin: string;
  tipo: TipoCalificacion;
  cicloLectivoId: number;
}
