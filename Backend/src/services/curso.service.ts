import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Curso } from "../types/curso.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo la entidad "padre" a la que pertenece (orientacion es opcional).
 */
const cursoListadoInclude = {
  orientacion: true,
} satisfies Prisma.CursoInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padre + listas de hijos (1:N y N:M).
 */
const cursoDetalleInclude = {
  orientacion: true,
  cursadas: true,
  matriculas: true,
  asignaciones: true,
} satisfies Prisma.CursoInclude;

export type CursoListado = Prisma.CursoGetPayload<{ include: typeof cursoListadoInclude }>;

export type CursoDetalle = Prisma.CursoGetPayload<{ include: typeof cursoDetalleInclude }>;

export async function getAll(): Promise<CursoListado[]> {
  return prisma.curso.findMany({ include: cursoListadoInclude });
}

export async function getById(id: number): Promise<CursoDetalle> {
  const dato = await prisma.curso.findUnique({ where: { id }, include: cursoDetalleInclude });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Curso, "id">): Promise<Curso> {
  return prisma.curso.create({ data: datos });
}

export async function update(id: number, datos: Omit<Curso, "id">): Promise<Curso> {
  return prisma.curso.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number): Promise<Curso> {
  return prisma.curso.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number): Promise<Curso> {
  return prisma.curso.delete({ where: { id } });
}
