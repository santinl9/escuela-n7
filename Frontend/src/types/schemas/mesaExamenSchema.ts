import { z } from 'zod';
import { SOLO_NUMEROS } from '../../constants/regexPatterns';

export const mesaExamenSchema = z.object({
  materiaId: z
    .string()
    .min(1, 'La materia es obligatoria'),

  personalId: z
    .string()
    .min(1, 'El docente a cargo es obligatorio'),

  fecha: z
    .string()
    .min(1, 'La fecha es obligatoria'),

  hora: z
    .string()
    .min(1, 'La hora es obligatoria'),

  cupo: z
    .string()
    .min(1, 'El cupo es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => Number(val) >= 1 && Number(val) <= 100, 'El cupo debe ser entre 1 y 100'),
});

export type MesaExamenFormData = z.infer<typeof mesaExamenSchema>;
