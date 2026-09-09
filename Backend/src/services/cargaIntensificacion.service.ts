import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroCargaPorCursada, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { CargaIntensificacion } from "../types/cargaIntensificacion.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * las dos entidades "padre" a las que pertenece.
 */
const cargaIntensificacionListadoInclude = {
  inscripcion: true,
  periodoCarga: true,
} satisfies Prisma.CargaIntensificacionInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * CargaIntensificacion no tiene hijos: coincide con el listado.
 */
const cargaIntensificacionDetalleInclude = {
  inscripcion: true,
  periodoCarga: true,
} satisfies Prisma.CargaIntensificacionInclude;

export type CargaIntensificacionListado = Prisma.CargaIntensificacionGetPayload<{
  include: typeof cargaIntensificacionListadoInclude;
}>;

export type CargaIntensificacionDetalle = Prisma.CargaIntensificacionGetPayload<{
  include: typeof cargaIntensificacionDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.cargaIntensificacion.findFirst({
    where: { id, ...filtroCargaPorCursada(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<CargaIntensificacionListado[]> {
  return prisma.cargaIntensificacion.findMany({ where: filtroCargaPorCursada(alcance), include: cargaIntensificacionListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<CargaIntensificacionDetalle> {
  const dato = await prisma.cargaIntensificacion.findFirst({
    where: { id, ...filtroCargaPorCursada(alcance) },
    include: cargaIntensificacionDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<CargaIntensificacion, "id">): Promise<CargaIntensificacion> {
  return prisma.cargaIntensificacion.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<CargaIntensificacion, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<CargaIntensificacion> {
  await asegurarEnAlcance(id, alcance);
  return prisma.cargaIntensificacion.update({ where: { id }, data: datos });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<CargaIntensificacion> {
  await asegurarEnAlcance(id, alcance);
  return prisma.cargaIntensificacion.delete({ where: { id } });
}
