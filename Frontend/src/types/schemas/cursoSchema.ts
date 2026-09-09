import { z } from 'zod';
import { SOLO_NUMEROS } from '../../constants/regexPatterns';

export const cursoSchema = z.object({
  nivel: z
    .string()
    .min(1, 'El nivel es obligatorio')
    .regex(SOLO_NUMEROS, 'Solo se permiten números')
    .refine(val => Number(val) >= 1 && Number(val) <= 6, 'El nivel debe ser entre 1 y 6'),

  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .regex(/^[A-Z]$/, 'El nombre debe ser una única letra'),

  turno: z
    .string()
    .min(1, 'El turno es obligatorio'),

  // Solo se exige para 4to, 5to y 6to año (ver superRefine): los demás niveles no tienen orientación.
  orientacionId: z.string(),
}).superRefine((data, ctx) => {
  const nivel = Number(data.nivel);
  if (nivel >= 4 && nivel <= 6 && !data.orientacionId) {
    ctx.addIssue({
      code: 'custom',
      path: ['orientacionId'],
      message: 'La orientación es obligatoria para 4to, 5to y 6to año',
    });
  }
});

export type CursoFormData = z.infer<typeof cursoSchema>;
