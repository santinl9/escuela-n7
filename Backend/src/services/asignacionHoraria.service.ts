import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { AsignacionHoraria } from "../types/asignacionHoraria.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo las entidades "padre" a las que pertenece, para no sobrecargar la consulta.
 */
const asignacionHorariaListadoInclude = {
  personal: true,
  asignacionHorariaCubierta: true,
} satisfies Prisma.AsignacionHorariaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padres + listas de hijos (1:N y N:M).
 */
const asignacionHorariaDetalleInclude = {
  personal: true,
  asignacionHorariaCubierta: true,
  coberturas: true,
  bloquesHorarios: true,
  cursos: true,
} satisfies Prisma.AsignacionHorariaInclude;

export type AsignacionHorariaListado = Prisma.AsignacionHorariaGetPayload<{
  include: typeof asignacionHorariaListadoInclude;
}>;

export type AsignacionHorariaDetalle = Prisma.AsignacionHorariaGetPayload<{
  include: typeof asignacionHorariaDetalleInclude;
}>;

export async function getAll(): Promise<AsignacionHorariaListado[]> {
  return prisma.asignacionHoraria.findMany({ include: asignacionHorariaListadoInclude });
}

export async function getById(id: number): Promise<AsignacionHorariaDetalle> {
  const dato = await prisma.asignacionHoraria.findUnique({
    where: { id },
    include: asignacionHorariaDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<AsignacionHoraria, "id">): Promise<AsignacionHoraria> {
  return prisma.asignacionHoraria.create({ data: datos });
}

export async function update(id: number, datos: Omit<AsignacionHoraria, "id">): Promise<AsignacionHoraria> {
  return prisma.asignacionHoraria.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<AsignacionHoraria> {
  return prisma.asignacionHoraria.delete({ where: { id } });
}
