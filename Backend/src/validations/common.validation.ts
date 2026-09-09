import { z } from "zod";

/**
 * Validación de parámetros de URL que contienen :id
 * (rutas GET /:id, PUT /:id, DELETE /:id).
 *
 * Se centraliza acá para no repetirlo en cada archivo de validación.
 */
export const idParamSchema = z.object({
  id: z.coerce
    .number()
    .int("El id debe ser un número entero")
    .positive("El id debe ser un número positivo"),
});

export type IdParam = z.infer<typeof idParamSchema>;
