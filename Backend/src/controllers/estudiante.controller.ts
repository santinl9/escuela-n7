import { Request, Response } from "express";
import * as estudianteService from "../services/estudiante.service";
import { alcanceDe } from "../services/alcance.service";

// Este recurso esta ACOTADO POR FILA: ademas del permiso que verifica
// `authorize` en el router, el service filtra por el alcance del usuario
// (los cursos del Preceptor, las cursadas del Profesor). Para los roles sin
// restriccion `alcanceDe` devuelve ALCANCE_TOTAL y no se agrega ningun filtro.

export async function getAll(req: Request, res: Response) {
  const alcance = await alcanceDe(req.usuario);
  const datos = await estudianteService.getAll(alcance);
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const dato = await estudianteService.getById(id, alcance);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await estudianteService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const actualizado = await estudianteService.update(id, req.body, alcance);
  return res.status(200).json(actualizado);
}

/** PATCH /:id -> baja logica. Exige el mismo permiso que Editar. */
export async function desactivar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const desactivado = await estudianteService.desactivar(id, alcance);
  return res.status(200).json(desactivado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const eliminado = await estudianteService.remove(id, alcance);
  return res.status(200).json(eliminado);
}
