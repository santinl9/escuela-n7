import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad CargaNumerica.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `calificacion` e `inasistencias` son opcionales (nullable en el schema).
 */
export const cargaNumericaCreateSchema = z.object({
  inscripcionId: z
    .number("El inscripcionId debe ser un número")
    .int("El inscripcionId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  periodoCargaId: z
    .number("El periodoCargaId debe ser un número")
    .int("El periodoCargaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  calificacion: z
    .number("La calificación debe ser un número")
    .nonnegative("No puede ser un número negativo")
    .optional(),
  inasistencias: z
    .number("Las inasistencias deben ser un número")
    .int("Las inasistencias deben ser un número entero")
    .nonnegative("No puede ser un número negativo")
    .optional(),
});

export const cargaNumericaUpdateSchema = cargaNumericaCreateSchema.partial();

export type CargaNumericaCreate = z.infer<typeof cargaNumericaCreateSchema>;
export type CargaNumericaUpdate = z.infer<typeof cargaNumericaUpdateSchema>;
