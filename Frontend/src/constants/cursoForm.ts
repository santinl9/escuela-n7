import type { FormCurso } from '../types/formTypes/cursoFormTypes';
import type { Turno } from '../types/Curso';

export const formVacioCurso: FormCurso = {
  nivel:          '',
  nombre:         '',
  turno:          '',
  orientacionId: '',
};

export const NIVELES_OPCIONES = [1, 2, 3, 4, 5, 6];

// Solo los cursos de estos niveles pertenecen a una orientación.
export const NIVELES_CON_ORIENTACION = [4, 5, 6];

export const TURNOS_OPCIONES: { value: Turno; label: string }[] = [
  { value: 'Maniana', label: 'Mañana' },
  { value: 'Tarde',    label: 'Tarde'  },
  { value: 'Noche',    label: 'Noche'  },
];

export const turnoLabel = (turno: Turno): string =>
  TURNOS_OPCIONES.find(t => t.value === turno)?.label ?? turno;
