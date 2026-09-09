import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad CicloLectivo.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const cicloLectivoCreateSchema = z.object({
  fechaIni: z.string("La fecha de inicio debe ser texto").trim().min(1, "La fecha de inicio es obligatoria"),
  fechaFin: z.string("La fecha de fin debe ser texto").trim().min(1, "La fecha de fin es obligatoria"),
  activo: z.boolean("El campo activo debe ser verdadero o falso"),
});

export const cicloLectivoUpdateSchema = cicloLectivoCreateSchema.partial();

export type CicloLectivoCreate = z.infer<typeof cicloLectivoCreateSchema>;
export type CicloLectivoUpdate = z.infer<typeof cicloLectivoUpdateSchema>;
