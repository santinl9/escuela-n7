import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { BloqueHorario } from "../types/bloqueHorario.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo la entidad "padre" a la que pertenece (cursada es opcional).
 */
const bloqueHorarioListadoInclude = {
  cursada: true,
} satisfies Prisma.BloqueHorarioInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padre + asignaciones horarias (N:M).
 */
const bloqueHorarioDetalleInclude = {
  cursada: true,
  asignaciones: true,
} satisfies Prisma.BloqueHorarioInclude;

export type BloqueHorarioListado = Prisma.BloqueHorarioGetPayload<{
  include: typeof bloqueHorarioListadoInclude;
}>;

export type BloqueHorarioDetalle = Prisma.BloqueHorarioGetPayload<{
  include: typeof bloqueHorarioDetalleInclude;
}>;

export async function getAll(): Promise<BloqueHorarioListado[]> {
  return prisma.bloqueHorario.findMany({ include: bloqueHorarioListadoInclude });
}

export async function getById(id: number): Promise<BloqueHorarioDetalle> {
  const dato = await prisma.bloqueHorario.findUnique({
    where: { id },
    include: bloqueHorarioDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<BloqueHorario, "id">): Promise<BloqueHorario> {
  return prisma.bloqueHorario.create({ data: datos });
}

export async function update(id: number, datos: Omit<BloqueHorario, "id">): Promise<BloqueHorario> {
  return prisma.bloqueHorario.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<BloqueHorario> {
  return prisma.bloqueHorario.delete({ where: { id } });
}
