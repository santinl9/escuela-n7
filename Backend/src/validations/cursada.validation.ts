import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Cursada.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const cursadaCreateSchema = z.object({
  cantidadClases: z
    .number("La cantidad de clases debe ser un número")
    .int("La cantidad de clases debe ser un número entero")
    .nonnegative("No puede ser un número negativo"),
  tipo: z.enum(["Curricular", "Extracurricular"], "El tipo de cursada no es válido"),
  cursoId: z
    .number("El cursoId debe ser un número")
    .int("El cursoId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  materiaId: z
    .number("El materiaId debe ser un número")
    .int("El materiaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  aulaId: z
    .number("El aulaId debe ser un número")
    .int("El aulaId debe ser un número entero")
    .positive("Debe ser un número positivo"),
  cicloLectivoId: z
    .number("El cicloLectivoId debe ser un número")
    .int("El cicloLectivoId debe ser un número entero")
    .positive("Debe ser un número positivo"),
});

export const cursadaUpdateSchema = cursadaCreateSchema.partial();

export type CursadaCreate = z.infer<typeof cursadaCreateSchema>;
export type CursadaUpdate = z.infer<typeof cursadaUpdateSchema>;
