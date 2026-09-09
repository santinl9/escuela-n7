import type { FormOrientacion } from '../types/formTypes/orientacionFormTypes';

export const formVacioOrientacion: FormOrientacion = {
  nombre: '',
};

export const CAMPOS_ORIENTACION: {
  label: string;
  name: 'nombre';
  type: string;
  placeholder: string;
}[] = [
  { label: 'Nombre', name: 'nombre', type: 'text', placeholder: 'Ej: Economía' },
];
