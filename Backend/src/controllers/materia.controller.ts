import { Request, Response } from "express";
import * as materiaService from "../services/materia.service";
import { materiaQuerySchema } from "../validations/materia.validation";

export async function getAll(req: Request, res: Response) {
  // Valida y coerciona los filtros del query string (?nivel=1&activo=true...).
  // Si son inválidos, lanza ZodError -> errorHandler -> 400.
  const filtros = materiaQuerySchema.parse(req.query);
  const datos = await materiaService.getAll(filtros);
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await materiaService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await materiaService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await materiaService.update(id, req.body);
  return res.status(200).json(actualizado);
}

/** PATCH /:id -> baja logica. Exige el mismo permiso que Editar. */
export async function desactivar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const desactivado = await materiaService.desactivar(id);
  return res.status(200).json(desactivado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await materiaService.remove(id);
  return res.status(200).json(eliminado);
}
