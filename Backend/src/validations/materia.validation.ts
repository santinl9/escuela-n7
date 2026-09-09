import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Materia.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const materiaCreateSchema = z.object({
  nombre: z.string("El nombre debe ser texto").trim().min(1, "El nombre es obligatorio"),
  nivel: z
    .number("El nivel debe ser un número")
    .int("El nivel debe ser un número entero")
    .positive("Debe ser un número positivo"),
  activo: z.boolean("El campo activo debe ser verdadero o falso"),
  curricular: z.boolean("El campo curricular debe ser verdadero o falso"),
});

export const materiaUpdateSchema = materiaCreateSchema.partial();

/**
 * Filtros opcionales para GET /api/materias (query string).
 * Los valores llegan como texto, por eso se coercionan:
 *   ?nivel=1&activo=true&curricular=false
 */
export const materiaQuerySchema = z.object({
  nivel: z.coerce
    .number()
    .int("El nivel debe ser un número entero")
    .positive("Debe ser un número positivo")
    .optional(),
  activo: z.stringbool().optional(),
  curricular: z.stringbool().optional(),
});

export type MateriaCreate = z.infer<typeof materiaCreateSchema>;
export type MateriaUpdate = z.infer<typeof materiaUpdateSchema>;
export type MateriaQuery = z.infer<typeof materiaQuerySchema>;
