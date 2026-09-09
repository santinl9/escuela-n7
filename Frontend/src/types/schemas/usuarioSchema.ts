import { z } from 'zod';

export const usuarioSchema = z.object({
  roles: z
    .array(z.string().min(1, 'Seleccioná un rol'))
    .min(1, 'Seleccioná al menos un rol')
    .refine(roles => new Set(roles).size === roles.length, 'No podés repetir el mismo rol'),
});
