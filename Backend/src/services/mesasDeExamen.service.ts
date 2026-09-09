import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { MesasDeExamen } from "../types/mesasDeExamen.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo las entidades "padre" a las que pertenece.
 */
const mesasDeExamenListadoInclude = {
  materia: true,
  personal: true,
  cicloLectivo: true,
} satisfies Prisma.MesasDeExamenInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padres + inscripciones a la mesa (1:N).
 */
const mesasDeExamenDetalleInclude = {
  materia: true,
  personal: true,
  cicloLectivo: true,
  inscripciones: true,
} satisfies Prisma.MesasDeExamenInclude;

export type MesasDeExamenListado = Prisma.MesasDeExamenGetPayload<{
  include: typeof mesasDeExamenListadoInclude;
}>;

export type MesasDeExamenDetalle = Prisma.MesasDeExamenGetPayload<{
  include: typeof mesasDeExamenDetalleInclude;
}>;

export async function getAll(): Promise<MesasDeExamenListado[]> {
  return prisma.mesasDeExamen.findMany({ include: mesasDeExamenListadoInclude });
}

export async function getById(id: number): Promise<MesasDeExamenDetalle> {
  const dato = await prisma.mesasDeExamen.findUnique({
    where: { id },
    include: mesasDeExamenDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<MesasDeExamen, "id">): Promise<MesasDeExamen> {
  return prisma.mesasDeExamen.create({ data: datos });
}

export async function update(id: number, datos: Omit<MesasDeExamen, "id">): Promise<MesasDeExamen> {
  return prisma.mesasDeExamen.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<MesasDeExamen> {
  return prisma.mesasDeExamen.delete({ where: { id } });
}
