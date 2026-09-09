import { z } from "zod";

/**
 * Esquemas de validación (Zod) para la entidad Domicilio.
 * Basado en prisma/schema.prisma. Se omite el id autoincremental.
 */
export const domicilioCreateSchema = z.object({
  estudianteDni: z
    .number("El estudianteDni debe ser un número")
    .int("El estudianteDni debe ser un número entero")
    .positive("Debe ser un número positivo"),
  calle: z.string("La calle debe ser texto").trim().min(1, "La calle es obligatoria"),
  numero: z
    .number("El número debe ser un número")
    .int("El número debe ser un número entero")
    .positive("Debe ser un número positivo"),
});

export const domicilioUpdateSchema = domicilioCreateSchema.partial();

export type DomicilioCreate = z.infer<typeof domicilioCreateSchema>;
export type DomicilioUpdate = z.infer<typeof domicilioUpdateSchema>;
