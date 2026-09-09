import type { FormMateria } from '../types/formTypes/materiaFormTypes';

export const formVacioMateria: FormMateria = {
  nombre:     '',
  nivel:      '',
  curricular: '',
};

export const NIVELES_OPCIONES = [1, 2, 3, 4, 5, 6];

// Opciones del select "Curricular / Extracurricular"; el form las maneja como string
// (igual que nivel) y se convierten a boolean recién al guardar la Materia.
export const TIPOS_MATERIA_OPCIONES = ['Curricular', 'Extracurricular'] as const;
