export type TipoCursada = 'Curricular' | 'Extracurricular';

export interface Cursada {
  id: number;
  cantidadClases: number;
  tipo: TipoCursada;
  cursoId: number;
  materiaId: number;
  aulaId: number;
  cicloLectivoId: number;
}
