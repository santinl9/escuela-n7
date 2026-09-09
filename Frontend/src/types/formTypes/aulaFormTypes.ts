export type CamposAula = 'nombre' | 'capacidad';

export type FormAula = Record<CamposAula, string>;

export type ErroresAula = Partial<Record<CamposAula, string>>;
