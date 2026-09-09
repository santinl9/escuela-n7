import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad CargaValorativa.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `calificacion` e `inasistencias` son opcionales (nullable en el schema).
 */
export const cargaValorativaCreateSchema = z.object({
  inscripcionId: z
    .number("El inscripcionId debe ser un número")
    .int("El inscripcionId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  periodoCargaId: z
    .number("El periodoCargaId debe ser un número")
    .int("El periodoCargaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  calificacion: z.enum(["TEA", "TEP", "TED"], "La calificación valorativa no es válida").optional(),
  inasistencias: z
    .number("Las inasistencias deben ser un número")
    .int("Las inasistencias deben ser un número entero")
    .nonnegative("No puede ser un número negativo")
    .optional(),
});

export const cargaValorativaUpdateSchema = cargaValorativaCreateSchema.partial();

export type CargaValorativaCreate = z.infer<typeof cargaValorativaCreateSchema>;
export type CargaValorativaUpdate = z.infer<typeof cargaValorativaUpdateSchema>;
