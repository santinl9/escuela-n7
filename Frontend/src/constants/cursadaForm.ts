import type { BloqueCursadaForm, FormCursada } from '../types/formTypes/cursadaFormTypes';
import type { TipoCursada } from '../types/Cursada';

export const bloqueCursadaVacio: BloqueCursadaForm = {
  dia:     '',
  horaIni: '',
  horaFin: '',
};

// Toda cursada debe tener al menos un bloque horario asociado.
export const formVacioCursada: FormCursada = {
  materiaId: '',
  aulaId:    '',
  tipo:      '',
  bloques:   [{ ...bloqueCursadaVacio }],
};

export const TIPOS_CURSADA_OPCIONES: TipoCursada[] = ['Curricular', 'Extracurricular'];
