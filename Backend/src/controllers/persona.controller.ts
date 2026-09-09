import { Request, Response } from "express";
import * as personaService from "../services/persona.service";

export async function getAll(req: Request, res: Response) {
  const datos = await personaService.getAll();
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await personaService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await personaService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await personaService.update(id, req.body);
  return res.status(200).json(actualizado);
}

/** PATCH /:id -> baja logica. Exige el mismo permiso que Editar. */
export async function desactivar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const desactivado = await personaService.desactivar(id);
  return res.status(200).json(desactivado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await personaService.remove(id);
  return res.status(200).json(eliminado);
}
