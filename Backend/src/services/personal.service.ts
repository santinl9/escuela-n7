import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Personal } from "../types/personal.types";

/**
 * Personal no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type PersonalListado = Personal;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * asignaciones horarias, mesas de examen (1:N) y usuario (1:1 opcional).
 */
const personalDetalleInclude = {
  asignaciones: true,
  mesasDeExamen: true,
  usuario: true,
} satisfies Prisma.PersonalInclude;

export type PersonalDetalle = Prisma.PersonalGetPayload<{
  include: typeof personalDetalleInclude;
}>;

export async function getAll(): Promise<PersonalListado[]> {
  return prisma.personal.findMany();
}

export async function getById(id: number): Promise<PersonalDetalle> {
  const dato = await prisma.personal.findUnique({ where: { id }, include: personalDetalleInclude });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Personal, "id">): Promise<Personal> {
  return prisma.personal.create({ data: datos });
}

export async function update(id: number, datos: Omit<Personal, "id">): Promise<Personal> {
  return prisma.personal.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number): Promise<Personal> {
  return prisma.personal.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number): Promise<Personal> {
  return prisma.personal.delete({ where: { id } });
}
