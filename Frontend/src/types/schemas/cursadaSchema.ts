import { z } from 'zod';

export const cursadaSchema = z.object({
  materiaId: z.string().min(1, 'La materia es obligatoria'),

  aulaId: z.string().min(1, 'El aula es obligatoria'),

  tipo: z.string().min(1, 'El tipo de cursada es obligatorio'),
});

export type CursadaFormData = z.infer<typeof cursadaSchema>;
