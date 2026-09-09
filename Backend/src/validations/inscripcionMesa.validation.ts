import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad InscripcionMesa.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 * `nota` es opcional (nullable en el schema).
 */
export const inscripcionMesaCreateSchema = z.object({
  mesaId: z
    .number("El mesaId debe ser un número")
    .int("El mesaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  estudianteDni: z
    .number("El estudianteDni debe ser un número")
    .int("El estudianteDni debe ser un número entero")
    .positive("Debe ser un número positivo"),
  fechaInscripcion: z
    .string("La fecha de inscripción debe ser texto")
    .trim()
    .min(1, "La fecha de inscripción es obligatoria"),
  nota: z
    .number("La nota debe ser un número")
    .int("La nota debe ser un número entero")
    .nonnegative("No puede ser un número negativo")
    .optional(),
  asistio: z.boolean("El campo asistió debe ser verdadero o falso"),
});

export const inscripcionMesaUpdateSchema = inscripcionMesaCreateSchema.partial();

export type InscripcionMesaCreate = z.infer<typeof inscripcionMesaCreateSchema>;
export type InscripcionMesaUpdate = z.infer<typeof inscripcionMesaUpdateSchema>;
