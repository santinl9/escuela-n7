import { z } from 'zod';
import { SOLO_NUMEROS } from '../../constants/regexPatterns';
import { NOTAS_VALORATIVAS_OPCIONES } from '../../constants/cargaForm';
import type { TipoCalificacion } from '../PeriodoCarga';

// Ni la calificación ni las inasistencias son obligatorias: un campo vacío significa que
// esa carga queda en null para ese estudiante. Si se completan, se valida su formato.
// La calificación de un período de Intensificación se carga igual que la Numérica (1 a 10).
export const crearCargaSchema = (tipo: TipoCalificacion, cantidadClases: number) =>
  z.object({
    calificacion:
      tipo === 'Numerica' || tipo === 'Intensificacion'
        ? z
            .string()
            .refine(val => val === '' || SOLO_NUMEROS.test(val), 'Solo se permiten números')
            .refine(val => val === '' || (Number(val) >= 1 && Number(val) <= 10), 'La calificación debe ser entre 1 y 10')
        : z
            .string()
            .refine(val => val === '' || (NOTAS_VALORATIVAS_OPCIONES as string[]).includes(val), 'Calificación inválida'),

    inasistencias: z
      .string()
      .refine(val => val === '' || SOLO_NUMEROS.test(val), 'Solo se permiten números')
      .refine(
        val => val === '' || cantidadClases <= 0 || Number(val) <= cantidadClases,
        `Las inasistencias no pueden superar la cantidad de clases dictadas (${cantidadClases})`
      ),
  });

export type CargaFormData = z.infer<ReturnType<typeof crearCargaSchema>>;
