import { Request, Response } from "express";
import * as aulaService from "../services/aula.service";

export async function getAll(req: Request, res: Response) {
  const datos = await aulaService.getAll();
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await aulaService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await aulaService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await aulaService.update(id, req.body);
  return res.status(200).json(actualizado);
}

/** PATCH /:id -> baja logica. Exige el mismo permiso que Editar. */
export async function desactivar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const desactivado = await aulaService.desactivar(id);
  return res.status(200).json(desactivado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await aulaService.remove(id);
  return res.status(200).json(eliminado);
}
