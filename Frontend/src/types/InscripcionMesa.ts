export interface InscripcionMesa {
  id: number;
  mesaId: number;
  estudianteDni: number;
  fechaInscripcion: string;
  nota: number | null;
  asistio: boolean;
}
