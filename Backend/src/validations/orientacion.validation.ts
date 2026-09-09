import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Orientacion.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const orientacionCreateSchema = z.object({
  nombre: z.string("El nombre debe ser texto").trim().min(1, "El nombre es obligatorio"),
  // Opcional: el schema tiene @default(true). Solo hace falta enviarlo para dar
  // de alta una orientación ya inactiva.
  activo: z.boolean("El campo activo debe ser verdadero o falso").optional(),
});

export const orientacionUpdateSchema = orientacionCreateSchema.partial();

export type OrientacionCreate = z.infer<typeof orientacionCreateSchema>;
export type OrientacionUpdate = z.infer<typeof orientacionUpdateSchema>;
