import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Estudiante.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const estudianteCreateSchema = z.object({
  activo: z.boolean("El campo activo debe ser verdadero o falso"),
  apellido: z.string("El apellido debe ser texto").trim().min(1, "El apellido es obligatorio"),
  cuil: z.string("El cuil debe ser texto").trim().min(1, "El cuil es obligatorio"),
  dni: z
    .number("El dni debe ser un número")
    .int("El dni debe ser un número entero")
    .positive("Debe ser un número positivo"),
  email: z
    .string("El email debe ser texto")
    .trim()
    .min(1, "El email es obligatorio")
    .email("El email no tiene un formato válido"),
  nombre: z.string("El nombre debe ser texto").trim().min(1, "El nombre es obligatorio"),
  telefono: z.string("El teléfono debe ser texto").trim().min(1, "El teléfono es obligatorio"),
  folio: z
    .number("El folio debe ser un número")
    .int("El folio debe ser un número entero")
    .nonnegative("No puede ser un número negativo"),
  libro: z
    .number("El libro debe ser un número")
    .int("El libro debe ser un número entero")
    .nonnegative("No puede ser un número negativo"),
  estado: z.enum(
    ["Regular", "Libre", "Desertor", "Egresado"],
    "El estado del estudiante no es válido",
  ),
  fechaNacimiento: z
    .string("La fecha de nacimiento debe ser texto")
    .trim()
    .min(1, "La fecha de nacimiento es obligatoria"),
  nacionalidad: z.string("La nacionalidad debe ser texto").trim().min(1, "La nacionalidad es obligatoria"),
  edad: z
    .number("La edad debe ser un número")
    .int("La edad debe ser un número entero")
    .nonnegative("No puede ser un número negativo"),
});

export const estudianteUpdateSchema = estudianteCreateSchema.partial();

export type EstudianteCreate = z.infer<typeof estudianteCreateSchema>;
export type EstudianteUpdate = z.infer<typeof estudianteUpdateSchema>;
