import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad PeriodoCarga.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const periodoCargaCreateSchema = z.object({
  descripcion: z.string("La descripción debe ser texto").trim().min(1, "La descripción es obligatoria"),
  fechaIni: z.string("La fecha de inicio debe ser texto").trim().min(1, "La fecha de inicio es obligatoria"),
  fechaFin: z.string("La fecha de fin debe ser texto").trim().min(1, "La fecha de fin es obligatoria"),
  tipo: z.enum(
    ["Numerica", "Valorativa", "Intensificacion"],
    "El tipo de calificación no es válido",
  ),
  cicloLectivoId: z
    .number("El cicloLectivoId debe ser un número")
    .int("El cicloLectivoId debe ser un número entero")
    .positive("Debe ser un número positivo"),
});

export const periodoCargaUpdateSchema = periodoCargaCreateSchema.partial();

export type PeriodoCargaCreate = z.infer<typeof periodoCargaCreateSchema>;
export type PeriodoCargaUpdate = z.infer<typeof periodoCargaUpdateSchema>;
