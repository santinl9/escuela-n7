import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad BloqueHorario.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const bloqueHorarioCreateSchema = z.object({
  cursadaId: z
    .number("El cursadaId debe ser un número")
    .int("El cursadaId debe ser un número entero")
    .positive("Debe ser un número positivo")
    .optional(),
  dia: z.enum(
    ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"],
    "El día de la semana no es válido",
  ),
  horaIni: z.string("La hora de inicio debe ser texto").trim().min(1, "La hora de inicio es obligatoria"),
  horaFin: z.string("La hora de fin debe ser texto").trim().min(1, "La hora de fin es obligatoria"),
});

export const bloqueHorarioUpdateSchema = bloqueHorarioCreateSchema.partial();

export type BloqueHorarioCreate = z.infer<typeof bloqueHorarioCreateSchema>;
export type BloqueHorarioUpdate = z.infer<typeof bloqueHorarioUpdateSchema>;
