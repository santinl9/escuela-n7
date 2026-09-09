import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Permiso } from "../types/permiso.types";

/**
 * Permiso no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type PermisoListado = Permiso;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * roles asociados (N:M).
 */
const permisoDetalleInclude = {
  roles: true,
} satisfies Prisma.PermisoInclude;

export type PermisoDetalle = Prisma.PermisoGetPayload<{
  include: typeof permisoDetalleInclude;
}>;

export async function getAll(): Promise<PermisoListado[]> {
  return prisma.permiso.findMany();
}

export async function getById(id: number): Promise<PermisoDetalle> {
  const dato = await prisma.permiso.findUnique({ where: { id }, include: permisoDetalleInclude });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Permiso, "id">): Promise<Permiso> {
  return prisma.permiso.create({ data: datos });
}

export async function update(id: number, datos: Omit<Permiso, "id">): Promise<Permiso> {
  return prisma.permiso.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<Permiso> {
  return prisma.permiso.delete({ where: { id } });
}
