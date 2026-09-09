export type CamposCurso = 'nivel' | 'nombre' | 'turno' | 'orientacionId';

export type FormCurso = Record<CamposCurso, string>;

export type ErroresCurso = Partial<Record<CamposCurso, string>>;
