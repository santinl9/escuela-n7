export type CamposCicloLectivo = 'fechaIni' | 'fechaFin';

export type FormCicloLectivo = Record<CamposCicloLectivo, string>;

export type ErroresCicloLectivo = Partial<Record<CamposCicloLectivo, string>>;
