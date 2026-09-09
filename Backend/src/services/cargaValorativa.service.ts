import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroCargaPorCursada, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { CargaValorativa } from "../types/cargaValorativa.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * las dos entidades "padre" a las que pertenece.
 */
const cargaValorativaListadoInclude = {
  inscripcion: true,
  periodoCarga: true,
} satisfies Prisma.CargaValorativaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * CargaValorativa no tiene hijos: coincide con el listado.
 */
const cargaValorativaDetalleInclude = {
  inscripcion: true,
  periodoCarga: true,
} satisfies Prisma.CargaValorativaInclude;

export type CargaValorativaListado = Prisma.CargaValorativaGetPayload<{
  include: typeof cargaValorativaListadoInclude;
}>;

export type CargaValorativaDetalle = Prisma.CargaValorativaGetPayload<{
  include: typeof cargaValorativaDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.cargaValorativa.findFirst({
    where: { id, ...filtroCargaPorCursada(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<CargaValorativaListado[]> {
  return prisma.cargaValorativa.findMany({ where: filtroCargaPorCursada(alcance), include: cargaValorativaListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<CargaValorativaDetalle> {
  const dato = await prisma.cargaValorativa.findFirst({
    where: { id, ...filtroCargaPorCursada(alcance) },
    include: cargaValorativaDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<CargaValorativa, "id">): Promise<CargaValorativa> {
  return prisma.cargaValorativa.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<CargaValorativa, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<CargaValorativa> {
  await asegurarEnAlcance(id, alcance);
  return prisma.cargaValorativa.update({ where: { id }, data: datos });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<CargaValorativa> {
  await asegurarEnAlcance(id, alcance);
  return prisma.cargaValorativa.delete({ where: { id } });
}
