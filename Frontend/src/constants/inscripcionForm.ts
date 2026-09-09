import type { TipoInscripcion } from '../types/Inscripcion';

export const TIPOS_INSCRIPCION_OPCIONES: TipoInscripcion[] = ['Normal', 'Recupera', 'Intensifica', 'Oyente'];

// Verbo que describe qué está haciendo el estudiante en una cursada según el tipo de
// inscripción; se usa para explicarle al preceptor por qué no está físicamente presente.
export const ACCION_INSCRIPCION: Record<TipoInscripcion, string> = {
  Normal: 'cursando',
  Recupera: 'recursando',
  Intensifica: 'intensificando',
  Oyente: 'asistiendo como oyente a',
};
