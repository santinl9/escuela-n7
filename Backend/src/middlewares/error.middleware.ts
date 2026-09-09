import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../errors/app.error";
import { logger } from "../config/logger";

/**
 * Middleware global de manejo de errores.
 *
 * Traduce los errores de aplicación, de Zod y de Prisma a los códigos HTTP
 * correctos. Debe montarse en la app DESPUÉS de todas las rutas:
 * `app.use(errorHandler)`.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // --- Errores de aplicación (401, 403, 404, 409, 400 lanzados a mano) ---
  // Van primero porque son los más específicos: los lanzan los middlewares de
  // autenticación/autorización y los services.
  if (err instanceof AppError) {
    return res.status(err.estado).json({
      mensaje: err.message,
      ...(err.detalles !== undefined ? { detalles: err.detalles } : {}),
    });
  }

  // --- Errores de validación de Zod ---
  if (err instanceof ZodError) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      detalles: err.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      })),
    });
  }

  // --- Errores conocidos de Prisma ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Violación de restricción @unique
        return res.status(409).json({ mensaje: "Ya existe un registro con ese valor" });
      case "P2025": // Registro requerido no encontrado
        return res.status(404).json({ mensaje: "No encontrado" });
      case "P2003": // Violación de clave foránea / registros relacionados
        return res.status(409).json({ mensaje: "Hay registros relacionados" });
    }
  }

  // --- Fallback: cualquier otro error ---
  logger.error(err);
  return res.status(500).json({ mensaje: "Error interno del servidor" });
}
