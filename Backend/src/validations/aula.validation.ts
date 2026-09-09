import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Aula.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const aulaCreateSchema = z.object({
  nombre: z.string("El nombre debe ser texto").trim().min(1, "El nombre es obligatorio"),
  capacidad: z
    .number("La capacidad debe ser un número")
    .int("La capacidad debe ser un número entero")
    .positive("Debe ser un número positivo"),
  activo: z.boolean("El campo activo debe ser verdadero o falso"),
});

export const aulaUpdateSchema = aulaCreateSchema.partial();

export type AulaCreate = z.infer<typeof aulaCreateSchema>;
export type AulaUpdate = z.infer<typeof aulaUpdateSchema>;
