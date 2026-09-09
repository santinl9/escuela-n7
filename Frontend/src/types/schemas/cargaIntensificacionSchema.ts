import { z } from 'zod';
import { SOLO_NUMEROS } from '../../constants/regexPatterns';

export const cargaIntensificacionSchema = z.object({
  calificacionFinal: z
    .string()
    .min(1, 'La calificación final es obligatoria')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => Number(val) >= 1 && Number(val) <= 10, 'La calificación debe ser entre 1 y 10'),
});

export type CargaIntensificacionFormData = z.infer<typeof cargaIntensificacionSchema>;
