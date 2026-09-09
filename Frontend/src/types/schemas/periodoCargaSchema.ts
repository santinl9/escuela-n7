import { z } from 'zod';

export const periodoCargaSchema = z
  .object({
    descripcion: z
      .string()
      .min(1, 'La descripción es obligatoria'),

    tipo: z
      .string()
      .min(1, 'El tipo es obligatorio'),

    fechaIni: z
      .string()
      .min(1, 'La fecha de inicio es obligatoria'),

    fechaFin: z
      .string()
      .min(1, 'La fecha de fin es obligatoria'),
  })
  .refine(data => data.fechaFin > data.fechaIni, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export type PeriodoCargaFormData = z.infer<typeof periodoCargaSchema>;
