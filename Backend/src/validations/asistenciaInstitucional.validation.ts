import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad AsistenciaInstitucional.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const asistenciaInstitucionalCreateSchema = z.object({
  estudianteDni: z
    .number("El estudianteDni debe ser un número")
    .int("El estudianteDni debe ser un número entero")
    .positive("Debe ser un número positivo"),
  fecha: z.string("La fecha debe ser texto").trim().min(1, "La fecha es obligatoria"),
  tipo: z.enum(
    ["AsistenciaCompleta", "FaltaCompleta", "MediaFalta"],
    "El tipo de asistencia no es válido",
  ),
  justificada: z.boolean("El campo justificada debe ser verdadero o falso"),
});

export const asistenciaInstitucionalUpdateSchema = asistenciaInstitucionalCreateSchema.partial();

export type AsistenciaInstitucionalCreate = z.infer<typeof asistenciaInstitucionalCreateSchema>;
export type AsistenciaInstitucionalUpdate = z.infer<typeof asistenciaInstitucionalUpdateSchema>;
