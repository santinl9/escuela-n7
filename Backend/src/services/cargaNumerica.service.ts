import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroCargaPorCursada, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { CargaNumerica } from "../types/cargaNumerica.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * las dos entidades "padre" a las que pertenece.
 */
const cargaNumericaListadoInclude = {
  inscripcion: true,
  periodoCarga: true,
} satisfies Prisma.CargaNumericaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * CargaNumerica no tiene hijos: coincide con el listado.
 */
const cargaNumericaDetalleInclude = {
  inscripcion: true,
  periodoCarga: true,
} satisfies Prisma.CargaNumericaInclude;

export type CargaNumericaListado = Prisma.CargaNumericaGetPayload<{
  include: typeof cargaNumericaListadoInclude;
}>;

export type CargaNumericaDetalle = Prisma.CargaNumericaGetPayload<{
  include: typeof cargaNumericaDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.cargaNumerica.findFirst({
    where: { id, ...filtroCargaPorCursada(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<CargaNumericaListado[]> {
  return prisma.cargaNumerica.findMany({ where: filtroCargaPorCursada(alcance), include: cargaNumericaListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<CargaNumericaDetalle> {
  const dato = await prisma.cargaNumerica.findFirst({
    where: { id, ...filtroCargaPorCursada(alcance) },
    include: cargaNumericaDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<CargaNumerica, "id">): Promise<CargaNumerica> {
  return prisma.cargaNumerica.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<CargaNumerica, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<CargaNumerica> {
  await asegurarEnAlcance(id, alcance);
  return prisma.cargaNumerica.update({ where: { id }, data: datos });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<CargaNumerica> {
  await asegurarEnAlcance(id, alcance);
  return prisma.cargaNumerica.delete({ where: { id } });
}
