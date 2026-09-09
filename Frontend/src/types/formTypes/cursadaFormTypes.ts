export type CamposCursada = 'materiaId' | 'aulaId' | 'tipo';

export type ErroresCursada = Partial<Record<CamposCursada, string>>;

export interface BloqueCursadaForm {
  // Presente solo cuando el bloque ya existe en la base (se reutiliza); ausente si es un bloque nuevo a crear junto con la cursada.
  id?: number;
  dia: string;
  horaIni: string;
  horaFin: string;
}

export type ErroresBloqueCursada = Partial<Record<'dia' | 'horaIni' | 'horaFin', string>>;

export type FormCursada = Record<CamposCursada, string> & {
  bloques: BloqueCursadaForm[];
};
