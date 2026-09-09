import { Request, Response } from "express";
import * as contactoEmergenciaService from "../services/contactoEmergencia.service";
import { alcanceDe } from "../services/alcance.service";

// Este recurso esta ACOTADO POR FILA: ademas del permiso que verifica
// `authorize` en el router, el service filtra por el alcance del usuario
// (los cursos del Preceptor, las cursadas del Profesor). Para los roles sin
// restriccion `alcanceDe` devuelve ALCANCE_TOTAL y no se agrega ningun filtro.

export async function getAll(req: Request, res: Response) {
  const alcance = await alcanceDe(req.usuario);
  const datos = await contactoEmergenciaService.getAll(alcance);
  return res.status(200).json(datos);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const dato = await contactoEmergenciaService.getById(id, alcance);
  return res.status(200).json(dato);
}

export async function create(req: Request, res: Response) {
  const creado = await contactoEmergenciaService.create(req.body);
  return res.status(201).json(creado);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const actualizado = await contactoEmergenciaService.update(id, req.body, alcance);
  return res.status(200).json(actualizado);
}

/** PATCH /:id -> baja logica. Exige el mismo permiso que Editar. */
export async function desactivar(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const desactivado = await contactoEmergenciaService.desactivar(id, alcance);
  return res.status(200).json(desactivado);
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const alcance = await alcanceDe(req.usuario);
  const eliminado = await contactoEmergenciaService.remove(id, alcance);
  return res.status(200).json(eliminado);
}
