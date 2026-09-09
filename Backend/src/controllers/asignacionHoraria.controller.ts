import { Request, Response } from "express";
import * as asignacionHorariaService from "../services/asignacionHoraria.service";

export async function getAll(req: Request, res: Response) {
  const datos = await asignacionHorariaService.getAll();
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await asignacionHorariaService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await asignacionHorariaService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await asignacionHorariaService.update(id, req.body);
  return res.status(200).json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await asignacionHorariaService.remove(id);
  return res.status(200).json(eliminado);
}
