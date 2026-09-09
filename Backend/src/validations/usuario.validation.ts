import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Usuario.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `personalId` es único en el schema.
 */
export const usuarioCreateSchema = z.object({
  personalId: z
    .number("El personalId debe ser un número")
    .int("El personalId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  activo: z.boolean("El campo activo debe ser verdadero o falso"),
  contrasenia: z
    .string("La contraseña debe ser texto")
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const usuarioUpdateSchema = usuarioCreateSchema.partial();

export type UsuarioCreate = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdate = z.infer<typeof usuarioUpdateSchema>;
