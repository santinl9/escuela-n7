import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Rol.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `nombre` es único en el schema.
 */
export const rolCreateSchema = z.object({
  nombre: z.string("El nombre debe ser texto").trim().min(1, "El nombre es obligatorio"),
});

export const rolUpdateSchema = rolCreateSchema.partial();

export type RolCreate = z.infer<typeof rolCreateSchema>;
export type RolUpdate = z.infer<typeof rolUpdateSchema>;
