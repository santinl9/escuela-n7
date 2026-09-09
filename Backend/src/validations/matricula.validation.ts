import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Matricula.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const matriculaCreateSchema = z.object({
  estudianteDni: z
    .number("El estudianteDni debe ser un número")
    .int("El estudianteDni debe ser un número entero")
    .positive("Debe ser un número positivo"),
  cursoId: z
    .number("El cursoId debe ser un número")
    .int("El cursoId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  fecha: z.string("La fecha debe ser texto").trim().min(1, "La fecha es obligatoria"),
});

export const matriculaUpdateSchema = matriculaCreateSchema.partial();

export type MatriculaCreate = z.infer<typeof matriculaCreateSchema>;
export type MatriculaUpdate = z.infer<typeof matriculaUpdateSchema>;
