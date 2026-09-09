import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad ContactoEmergencia.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const contactoEmergenciaCreateSchema = z.object({
  estudianteDni: z
    .number("El estudianteDni debe ser un número")
    .int("El estudianteDni debe ser un número entero")
    .positive("Debe ser un número positivo"),
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
});

export const contactoEmergenciaUpdateSchema = contactoEmergenciaCreateSchema.partial();

export type ContactoEmergenciaCreate = z.infer<typeof contactoEmergenciaCreateSchema>;
export type ContactoEmergenciaUpdate = z.infer<typeof contactoEmergenciaUpdateSchema>;
