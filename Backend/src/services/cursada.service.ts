import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Cursada } from "../types/cursada.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo las entidades "padre" a las que pertenece.
 */
const cursadaListadoInclude = {
  curso: true,
  materia: true,
  aula: true,
  cicloLectivo: true,
} satisfies Prisma.CursadaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padres + listas de hijos (bloques horarios e inscripciones, incluidas las de intensificación).
 */
const cursadaDetalleInclude = {
  curso: true,
  materia: true,
  aula: true,
  cicloLectivo: true,
  bloquesHorarios: true,
  inscripciones: true,
  inscripcionesIntensifica: true,
} satisfies Prisma.CursadaInclude;

export type CursadaListado = Prisma.CursadaGetPayload<{
  include: typeof cursadaListadoInclude;
}>;

export type CursadaDetalle = Prisma.CursadaGetPayload<{
  include: typeof cursadaDetalleInclude;
}>;

export async function getAll(): Promise<CursadaListado[]> {
  return prisma.cursada.findMany({ include: cursadaListadoInclude });
}

export async function getById(id: number): Promise<CursadaDetalle> {
  const dato = await prisma.cursada.findUnique({ where: { id }, include: cursadaDetalleInclude });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Cursada, "id">): Promise<Cursada> {
  return prisma.cursada.create({ data: datos });
}

export async function update(id: number, datos: Omit<Cursada, "id">): Promise<Cursada> {
  return prisma.cursada.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<Cursada> {
  return prisma.cursada.delete({ where: { id } });
}
