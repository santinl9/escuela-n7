import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad CargaIntensificacion.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const cargaIntensificacionCreateSchema = z.object({
  inscripcionId: z
    .number("El inscripcionId debe ser un número")
    .int("El inscripcionId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  periodoCargaId: z
    .number("El periodoCargaId debe ser un número")
    .int("El periodoCargaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  calificacionFinal: z
    .number("La calificación final debe ser un número")
    .int("La calificación final debe ser un número entero")
    .nonnegative("No puede ser un número negativo"),
});

export const cargaIntensificacionUpdateSchema = cargaIntensificacionCreateSchema.partial();

export type CargaIntensificacionCreate = z.infer<typeof cargaIntensificacionCreateSchema>;
export type CargaIntensificacionUpdate = z.infer<typeof cargaIntensificacionUpdateSchema>;
