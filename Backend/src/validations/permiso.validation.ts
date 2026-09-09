import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Permiso.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `codigo` y `descripcion` son únicos en el schema.
 */
export const permisoCreateSchema = z.object({
  codigo: z
    .string("El código debe ser texto")
    .trim()
    .regex(/^p\d+$/, "El código debe tener el formato p1, p2, ..."),
  descripcion: z.string("La descripción debe ser texto").trim().min(1, "La descripción es obligatoria"),
});

export const permisoUpdateSchema = permisoCreateSchema.partial();

export type PermisoCreate = z.infer<typeof permisoCreateSchema>;
export type PermisoUpdate = z.infer<typeof permisoUpdateSchema>;
