export type CamposInscripcionMesa = 'estudianteDni' | 'nota';

export type FormInscripcionMesa = Record<CamposInscripcionMesa, string> & { asistio: boolean };

export type ErroresInscripcionMesa = Partial<Record<CamposInscripcionMesa, string>>;
