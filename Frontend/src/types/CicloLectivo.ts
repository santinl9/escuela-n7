export interface CicloLectivo {
  id: number;
  fechaIni: string;
  fechaFin: string;
  activo: boolean;
}

export const nombreCicloLectivo = (ciclo: Pick<CicloLectivo, 'fechaIni' | 'fechaFin'>): string => {
  const anioIni = ciclo.fechaIni.slice(0, 4);
  const anioFin = ciclo.fechaFin.slice(0, 4);
  return anioIni === anioFin ? anioIni : `${anioIni}-${anioFin}`;
};

/** El ciclo lectivo actual es el que tiene la fecha de inicio más reciente (posterior a todos los demás). */
export const cicloLectivoActual = (ciclos: CicloLectivo[]): CicloLectivo | undefined =>
  ciclos.reduce<CicloLectivo | undefined>(
    (actual, ciclo) => (!actual || ciclo.fechaIni > actual.fechaIni ? ciclo : actual),
    undefined
  );
