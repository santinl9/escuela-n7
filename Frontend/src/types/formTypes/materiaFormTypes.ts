export type CamposMateria = 'nombre' | 'nivel' | 'curricular';

export type FormMateria = Record<CamposMateria, string>;

export type ErroresMateria = Partial<Record<CamposMateria, string>>;
