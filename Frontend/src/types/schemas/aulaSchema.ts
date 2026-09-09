import { z } from 'zod';
import { SOLO_NUMEROS } from '../../constants/regexPatterns';

export const aulaSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio'),

  capacidad: z
    .string()
    .min(1, 'La capacidad es obligatoria')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => Number(val) >= 1 && Number(val) <= 200, 'La capacidad debe ser entre 1 y 200'),
});

export type AulaFormData = z.infer<typeof aulaSchema>;
