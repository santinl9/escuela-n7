export type CamposPeriodoCarga = 'descripcion' | 'tipo' | 'fechaIni' | 'fechaFin';

export type FormPeriodoCarga = Record<CamposPeriodoCarga, string>;

export type ErroresPeriodoCarga = Partial<Record<CamposPeriodoCarga, string>>;
