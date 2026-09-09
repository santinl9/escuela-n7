import { z } from 'zod';
import { SOLO_NUMEROS } from '../../constants/regexPatterns';

export const materiaSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio'),

  nivel: z
    .string()
    .min(1, 'El nivel es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => Number(val) >= 1 && Number(val) <= 6, 'El nivel debe ser entre 1 y 6'),

  curricular: z
    .enum(['Curricular', 'Extracurricular'], { message: 'Seleccioná si es curricular o extracurricular' }),
});

export type MateriaFormData = z.infer<typeof materiaSchema>;
