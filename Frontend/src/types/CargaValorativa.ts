export type NotaValorativa = 'TEA' | 'TEP' | 'TED';

export interface CargaValorativa {
  id: number;
  inscripcionId: number;
  periodoCargaId: number;
  calificacion: NotaValorativa | null;
  inasistencias: number | null;
}
