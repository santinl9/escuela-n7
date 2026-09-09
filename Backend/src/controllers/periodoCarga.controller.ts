import { Request, Response } from "express";
import * as periodoCargaService from "../services/periodoCarga.service";

export async function getAll(req: Request, res: Response) {
  const datos = await periodoCargaService.getAll();
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const dato = await periodoCargaService.getById(id);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await periodoCargaService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const actualizado = await periodoCargaService.update(id, req.body);
  return res.status(200).json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const eliminado = await periodoCargaService.remove(id);
  return res.status(200).json(eliminado);
}
