import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Inscripcion.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `cursadaIntensificacionId` y `notaFinal` son opcionales (nullable en el schema).
 */
export const inscripcionCreateSchema = z.object({
  estudianteDni: z
    .number("El estudianteDni debe ser un número")
    .int("El estudianteDni debe ser un número entero")
    .positive("Debe ser un número positivo"),
  cursadaId: z
    .number("El cursadaId debe ser un número")
    .int("El cursadaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  tipo: z.enum(
    ["Normal", "Recupera", "Intensifica", "Oyente"],
    "El tipo de inscripción no es válido",
  ),
  cursadaIntensificacionId: z
    .number("El cursadaIntensificacionId debe ser un número")
    .int("El cursadaIntensificacionId debe ser un número entero")
    .positive("Debe ser un número positivo")
    .optional(),
  estado: z.enum(
    ["Aprobada", "Libre", "Regular", "Desaprobado", "Discontinuo"],
    "El estado de la inscripción no es válido",
  ),
  fecha: z.string("La fecha debe ser texto").trim().min(1, "La fecha es obligatoria"),
  notaFinal: z
    .number("La nota final debe ser un número")
    .int("La nota final debe ser un número entero")
    .nonnegative("No puede ser un número negativo")
    .optional(),
});

export const inscripcionUpdateSchema = inscripcionCreateSchema.partial();

export type InscripcionCreate = z.infer<typeof inscripcionCreateSchema>;
export type InscripcionUpdate = z.infer<typeof inscripcionUpdateSchema>;
