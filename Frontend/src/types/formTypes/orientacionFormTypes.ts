export type CamposOrientacion = 'nombre';

export type FormOrientacion = Record<CamposOrientacion, string>;

export type ErroresOrientacion = Partial<Record<CamposOrientacion, string>>;
