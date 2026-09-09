import { Request, Response } from "express";
import * as orientacionService from "../services/orientacion.service";

export async function getAll(req: Request, res: Response) {
  const datos = await orientacionService.getAll();
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await orientacionService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await orientacionService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await orientacionService.update(id, req.body);
  return res.status(200).json(actualizado);
}

/** PATCH /:id -> baja logica. Exige el mismo permiso que Editar. */
export async function desactivar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const desactivado = await orientacionService.desactivar(id);
  return res.status(200).json(desactivado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await orientacionService.remove(id);
  return res.status(200).json(eliminado);
}
