import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroCurso, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { Matricula } from "../types/matricula.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * las dos entidades "padre" a las que pertenece.
 */
const matriculaListadoInclude = {
  estudiante: true,
  curso: true,
} satisfies Prisma.MatriculaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * Matricula no tiene hijos: coincide con el listado.
 */
const matriculaDetalleInclude = {
  estudiante: true,
  curso: true,
} satisfies Prisma.MatriculaInclude;

export type MatriculaListado = Prisma.MatriculaGetPayload<{
  include: typeof matriculaListadoInclude;
}>;

export type MatriculaDetalle = Prisma.MatriculaGetPayload<{
  include: typeof matriculaDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.matricula.findFirst({
    where: { id, ...filtroCurso(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<MatriculaListado[]> {
  return prisma.matricula.findMany({ where: filtroCurso(alcance), include: matriculaListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<MatriculaDetalle> {
  const dato = await prisma.matricula.findFirst({
    where: { id, ...filtroCurso(alcance) },
    include: matriculaDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Matricula, "id">): Promise<Matricula> {
  return prisma.matricula.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<Matricula, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<Matricula> {
  await asegurarEnAlcance(id, alcance);
  return prisma.matricula.update({ where: { id }, data: datos });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<Matricula> {
  await asegurarEnAlcance(id, alcance);
  return prisma.matricula.delete({ where: { id } });
}
