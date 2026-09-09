import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

/**
 * Valida el cuerpo de la petición (req.body) contra un esquema de Zod.
 *
 * - Si la validación falla, deriva el error al middleware global
 *   mediante `next(resultado.error)`.
 * - Si es exitosa, sobreescribe `req.body` con los datos ya limpios y
 *   convertidos (`resultado.data`) y continúa con `next()`.
 */
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      return next(resultado.error);
    }

    req.body = resultado.data;
    return next();
  };
}

/**
 * Valida los parámetros de la URL (req.params) contra un esquema de Zod.
 *
 * - Si la validación falla, deriva el error al middleware global
 *   mediante `next(resultado.error)`.
 * - Si es exitosa, simplemente continúa con `next()` (no sobreescribe
 *   `req.params`).
 */
export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const resultado = schema.safeParse(req.params);

    if (!resultado.success) {
      return next(resultado.error);
    }

    return next();
  };
}
