import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Materia } from "../types/materia.types";
import { MateriaQuery } from "../validations/materia.validation";

/**
 * Materia no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type MateriaListado = Materia;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * listas de hijos (1:N).
 */
const materiaDetalleInclude = {
  cursadas: true,
  mesasDeExamen: true,
} satisfies Prisma.MateriaInclude;

export type MateriaDetalle = Prisma.MateriaGetPayload<{
  include: typeof materiaDetalleInclude;
}>;

export async function getAll(filtros: MateriaQuery = {}): Promise<MateriaListado[]> {
  return prisma.materia.findMany({
    where: {
      nivel: filtros.nivel,
      activo: filtros.activo,
      curricular: filtros.curricular,
    },
  });
}

export async function getById(id: number): Promise<MateriaDetalle> {
  const dato = await prisma.materia.findUnique({ where: { id }, include: materiaDetalleInclude });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Materia, "id">): Promise<Materia> {
  return prisma.materia.create({ data: datos });
}

export async function update(id: number, datos: Omit<Materia, "id">): Promise<Materia> {
  return prisma.materia.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number): Promise<Materia> {
  return prisma.materia.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number): Promise<Materia> {
  return prisma.materia.delete({ where: { id } });
}
