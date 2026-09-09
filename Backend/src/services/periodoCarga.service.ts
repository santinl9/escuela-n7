import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { PeriodoCarga } from "../types/periodoCarga.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo la entidad "padre" a la que pertenece.
 */
const periodoCargaListadoInclude = {
  cicloLectivo: true,
} satisfies Prisma.PeriodoCargaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padre + listas de hijos (cargas numéricas, valorativas y de intensificación).
 */
const periodoCargaDetalleInclude = {
  cicloLectivo: true,
  cargasIntensificacion: true,
  cargasNumericas: true,
  cargasValorativas: true,
} satisfies Prisma.PeriodoCargaInclude;

export type PeriodoCargaListado = Prisma.PeriodoCargaGetPayload<{
  include: typeof periodoCargaListadoInclude;
}>;

export type PeriodoCargaDetalle = Prisma.PeriodoCargaGetPayload<{
  include: typeof periodoCargaDetalleInclude;
}>;

export async function getAll(): Promise<PeriodoCargaListado[]> {
  return prisma.periodoCarga.findMany({ include: periodoCargaListadoInclude });
}

export async function getById(id: number): Promise<PeriodoCargaDetalle> {
  const dato = await prisma.periodoCarga.findUnique({
    where: { id },
    include: periodoCargaDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<PeriodoCarga, "id">): Promise<PeriodoCarga> {
  return prisma.periodoCarga.create({ data: datos });
}

export async function update(id: number, datos: Omit<PeriodoCarga, "id">): Promise<PeriodoCarga> {
  return prisma.periodoCarga.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<PeriodoCarga> {
  return prisma.periodoCarga.delete({ where: { id } });
}
