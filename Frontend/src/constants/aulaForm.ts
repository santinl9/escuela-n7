import type { CamposAula, FormAula } from '../types/formTypes/aulaFormTypes';

export const formVacioAula: FormAula = {
  nombre:    '',
  capacidad: '',
};

export const CAMPOS_AULA: {
  label: string;
  name: CamposAula;
  type: string;
  placeholder: string;
}[] = [
  { label: 'Nombre',    name: 'nombre',    type: 'text', placeholder: 'Ej: Aula 1'  },
  { label: 'Capacidad', name: 'capacidad', type: 'text', placeholder: 'Ej: 30'       },
];
