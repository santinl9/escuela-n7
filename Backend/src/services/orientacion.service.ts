import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Orientacion } from "../types/orientacion.types";

/**
 * Orientacion no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type OrientacionListado = Orientacion;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * lista de hijos (1:N).
 */
const orientacionDetalleInclude = {
  cursos: true,
} satisfies Prisma.OrientacionInclude;

export type OrientacionDetalle = Prisma.OrientacionGetPayload<{
  include: typeof orientacionDetalleInclude;
}>;

export async function getAll(): Promise<OrientacionListado[]> {
  return prisma.orientacion.findMany();
}

export async function getById(id: number): Promise<OrientacionDetalle> {
  const dato = await prisma.orientacion.findUnique({
    where: { id },
    include: orientacionDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Orientacion, "id">): Promise<Orientacion> {
  return prisma.orientacion.create({ data: datos });
}

export async function update(id: number, datos: Omit<Orientacion, "id">): Promise<Orientacion> {
  return prisma.orientacion.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number): Promise<Orientacion> {
  return prisma.orientacion.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number): Promise<Orientacion> {
  return prisma.orientacion.delete({ where: { id } });
}
