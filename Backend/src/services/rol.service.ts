import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Rol } from "../types/rol.types";

/**
 * Rol no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type RolListado = Rol;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * permisos y usuarios asociados (N:M).
 */
const rolDetalleInclude = {
  permisos: true,
  usuarios: true,
} satisfies Prisma.RolInclude;

export type RolDetalle = Prisma.RolGetPayload<{ include: typeof rolDetalleInclude }>;

export async function getAll(): Promise<RolListado[]> {
  return prisma.rol.findMany();
}

export async function getById(id: number): Promise<RolDetalle> {
  const dato = await prisma.rol.findUnique({ where: { id }, include: rolDetalleInclude });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Rol, "id">): Promise<Rol> {
  return prisma.rol.create({ data: datos });
}

export async function update(id: number, datos: Omit<Rol, "id">): Promise<Rol> {
  return prisma.rol.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<Rol> {
  return prisma.rol.delete({ where: { id } });
}
