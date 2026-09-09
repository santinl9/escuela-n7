import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { obtenerUsuarioAutenticado } from "../middlewares/auth.middleware";

/** POST /api/auth/login -> 200 { token, usuario } | 400 | 401 */
export async function login(req: Request, res: Response) {
  const resultado = await authService.login(req.body);
  return res.status(200).json(resultado);
}

/** POST /api/auth/register -> 201 usuario | 400 | 401 | 403 | 404 | 409 */
export async function register(req: Request, res: Response) {
  const creado = await authService.register(req.body);
  return res.status(201).json(creado);
}

/** GET /api/auth/yo -> 200 con la identidad y los permisos efectivos del token. */
export async function yo(req: Request, res: Response) {
  return res.status(200).json(obtenerUsuarioAutenticado(req));
}
