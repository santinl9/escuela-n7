import { Request, Response } from "express";
import * as inscripcionMesaService from "../services/inscripcionMesa.service";

export async function getAll(req: Request, res: Response) {
  const datos = await inscripcionMesaService.getAll();
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await inscripcionMesaService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await inscripcionMesaService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await inscripcionMesaService.update(id, req.body);
  return res.status(200).json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await inscripcionMesaService.remove(id);
  return res.status(200).json(eliminado);
}
