import { Request, Response } from "express";
import * as inscripcionService from "../services/inscripcion.service";
import { alcanceDe } from "../services/alcance.service";

// Este recurso esta ACOTADO POR FILA: ademas del permiso que verifica
// `authorize` en el router, el service filtra por el alcance del usuario
// (los cursos del Preceptor, las cursadas del Profesor). Para los roles sin
// restriccion `alcanceDe` devuelve ALCANCE_TOTAL y no se agrega ningun filtro.

export async function getAll(req: Request, res: Response) {
  const alcance = await alcanceDe(req.usuario);
  const datos = await inscripcionService.getAll(alcance);
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const dato = await inscripcionService.getById(id, alcance);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await inscripcionService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const actualizado = await inscripcionService.update(id, req.body, alcance);
  return res.status(200).json(actualizado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const eliminado = await inscripcionService.remove(id, alcance);
  return res.status(200).json(eliminado);
}
