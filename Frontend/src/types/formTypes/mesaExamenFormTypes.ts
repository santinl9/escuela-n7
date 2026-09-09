export type CamposMesaExamen = 'materiaId' | 'personalId' | 'fecha' | 'hora' | 'cupo';

export type FormMesaExamen = Record<CamposMesaExamen, string>;

export type ErroresMesaExamen = Partial<Record<CamposMesaExamen, string>>;
