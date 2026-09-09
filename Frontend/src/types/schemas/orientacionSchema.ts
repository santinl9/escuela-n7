import { z } from 'zod';

export const orientacionSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio'),
});

export type OrientacionFormData = z.infer<typeof orientacionSchema>;
