import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { CicloLectivo } from "../types/cicloLectivo.types";

/**
 * CicloLectivo no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type CicloLectivoListado = CicloLectivo;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * listas de hijos (1:N).
 */
const cicloLectivoDetalleInclude = {
  cursadas: true,
  periodosCarga: true,
  mesasDeExamen: true,
} satisfies Prisma.CicloLectivoInclude;

export type CicloLectivoDetalle = Prisma.CicloLectivoGetPayload<{
  include: typeof cicloLectivoDetalleInclude;
}>;

export async function getAll(): Promise<CicloLectivoListado[]> {
  return prisma.cicloLectivo.findMany();
}

export async function getById(id: number): Promise<CicloLectivoDetalle> {
  const dato = await prisma.cicloLectivo.findUnique({
    where: { id },
    include: cicloLectivoDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<CicloLectivo, "id">): Promise<CicloLectivo> {
  return prisma.cicloLectivo.create({ data: datos });
}

export async function update(id: number, datos: Omit<CicloLectivo, "id">): Promise<CicloLectivo> {
  return prisma.cicloLectivo.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number): Promise<CicloLectivo> {
  return prisma.cicloLectivo.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number): Promise<CicloLectivo> {
  return prisma.cicloLectivo.delete({ where: { id } });
}
