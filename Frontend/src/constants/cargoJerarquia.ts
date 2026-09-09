import type { TipoCargo } from '../types/AsignacionHoraria';

/** Orden institucional de mayor a menor jerarquía. */
export const JERARQUIA_CARGOS: TipoCargo[] = [
  'Directivo',
  'Vicedirectivo',
  'Secretario',
  'Prosecretario',
  'EMATP',
  'Preceptor',
  'Profesor',
  'Auxiliar',
];

/** Orden del select de "Tipo de cargo": primero Profesor, luego Preceptor, después el resto. */
export const TIPO_CARGO_OPCIONES: TipoCargo[] = [
  'Profesor',
  'Preceptor',
  ...JERARQUIA_CARGOS.filter(cargo => cargo !== 'Profesor' && cargo !== 'Preceptor'),
];

/** Rol de sistema que le corresponde a cada cargo al crear su usuario. Auxiliar no tiene: no se le crea usuario. */
export const ROL_POR_CARGO: Partial<Record<TipoCargo, string>> = {
  Directivo: 'Directivo',
  Vicedirectivo: 'Vicedirectivo',
  Secretario: 'Secretario',
  Prosecretario: 'Prosecretario',
  EMATP: 'EMATP',
  Preceptor: 'Preceptor',
  Profesor: 'Docente',
};

/** Entre varias asignaciones de una misma persona, la de cargo de mayor jerarquía institucional. */
export const cargoDeMayorJerarquia = <T extends { tipo: TipoCargo }>(cargos: T[]): T | undefined =>
  cargos.reduce<T | undefined>((mayor, actual) => {
    if (!mayor) return actual;
    return JERARQUIA_CARGOS.indexOf(actual.tipo) < JERARQUIA_CARGOS.indexOf(mayor.tipo) ? actual : mayor;
  }, undefined);

/** Los roles de sistema equivalentes a un conjunto de cargos, sin duplicados (Auxiliar no aporta rol). */
export const rolesDeCargos = (tipos: TipoCargo[]): string[] =>
  Array.from(new Set(tipos.map(tipo => ROL_POR_CARGO[tipo]).filter((rol): rol is string => rol !== undefined)));
