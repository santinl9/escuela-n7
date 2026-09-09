import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Aula } from "../types/aula.types";

/**
 * Aula no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type AulaListado = Aula;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * lista de hijos (1:N).
 */
const aulaDetalleInclude = {
  cursadas: true,
} satisfies Prisma.AulaInclude;

export type AulaDetalle = Prisma.AulaGetPayload<{ include: typeof aulaDetalleInclude }>;

export async function getAll(): Promise<AulaListado[]> {
  return prisma.aula.findMany();
}

export async function getById(id: number): Promise<AulaDetalle> {
  const dato = await prisma.aula.findUnique({ where: { id }, include: aulaDetalleInclude });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Aula, "id">): Promise<Aula> {
  return prisma.aula.create({ data: datos });
}

export async function update(id: number, datos: Omit<Aula, "id">): Promise<Aula> {
  return prisma.aula.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number): Promise<Aula> {
  return prisma.aula.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number): Promise<Aula> {
  return prisma.aula.delete({ where: { id } });
}
