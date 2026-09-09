import { Request, Response } from "express";
import * as bloqueHorarioService from "../services/bloqueHorario.service";

export async function getAll(req: Request, res: Response) {
  const datos = await bloqueHorarioService.getAll();
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await bloqueHorarioService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await bloqueHorarioService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await bloqueHorarioService.update(id, req.body);
  return res.status(200).json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await bloqueHorarioService.remove(id);
  return res.status(200).json(eliminado);
}
