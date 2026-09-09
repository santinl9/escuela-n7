import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad MesasDeExamen.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const mesasDeExamenCreateSchema = z.object({
  materiaId: z
    .number("El materiaId debe ser un número")
    .int("El materiaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  personalId: z
    .number("El personalId debe ser un número")
    .int("El personalId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  cicloLectivoId: z
    .number("El cicloLectivoId debe ser un número")
    .int("El cicloLectivoId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  fecha: z.string("La fecha debe ser texto").trim().min(1, "La fecha es obligatoria"),
  hora: z.string("La hora debe ser texto").trim().min(1, "La hora es obligatoria"),
  cupo: z
    .number("El cupo debe ser un número")
    .int("El cupo debe ser un número entero")
    .positive("Debe ser un número positivo"),
});

export const mesasDeExamenUpdateSchema = mesasDeExamenCreateSchema.partial();

export type MesasDeExamenCreate = z.infer<typeof mesasDeExamenCreateSchema>;
export type MesasDeExamenUpdate = z.infer<typeof mesasDeExamenUpdateSchema>;
