export type CamposCarga = 'calificacion' | 'inasistencias';

export type FormCarga = Record<CamposCarga, string>;

export type ErroresCarga = Partial<Record<CamposCarga, string>>;
