import { z } from 'zod';
import { SOLO_NUMEROS } from '../../constants/regexPatterns';

export const inscripcionMesaSchema = z.object({
  estudianteDni: z
    .string()
    .min(1, 'Seleccioná un egresado'),
});

export const notaMesaSchema = z.object({
  nota: z
    .string()
    .min(1, 'La nota es obligatoria')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => Number(val) >= 1 && Number(val) <= 10, 'La nota debe ser entre 1 y 10'),
});

export type InscripcionMesaFormData = z.infer<typeof inscripcionMesaSchema>;
export type NotaMesaFormData = z.infer<typeof notaMesaSchema>;
