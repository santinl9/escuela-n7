import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Curso.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `orientacionId` es opcional (nullable en el schema).
 */
export const cursoCreateSchema = z.object({
  nivel: z
    .number("El nivel debe ser un número")
    .int("El nivel debe ser un número entero")
    .positive("Debe ser un número positivo"),
  nombre: z.string("El nombre debe ser texto").trim().min(1, "El nombre es obligatorio"),
  turno: z.enum(["Maniana", "Tarde", "Noche"], "El turno no es válido"),
  activo: z.boolean("El campo activo debe ser verdadero o falso"),
  orientacionId: z
    .number("El orientacionId debe ser un número")
    .int("El orientacionId debe ser un número entero")
    .positive("Debe ser un número positivo")
    .optional(),
});

export const cursoUpdateSchema = cursoCreateSchema.partial();

export type CursoCreate = z.infer<typeof cursoCreateSchema>;
export type CursoUpdate = z.infer<typeof cursoUpdateSchema>;
