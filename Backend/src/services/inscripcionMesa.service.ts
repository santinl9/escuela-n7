import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { InscripcionMesa } from "../types/inscripcionMesa.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * las dos entidades "padre" a las que pertenece.
 */
const inscripcionMesaListadoInclude = {
  mesa: true,
  estudiante: true,
} satisfies Prisma.InscripcionMesaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * InscripcionMesa no tiene hijos: coincide con el listado.
 */
const inscripcionMesaDetalleInclude = {
  mesa: true,
  estudiante: true,
} satisfies Prisma.InscripcionMesaInclude;

export type InscripcionMesaListado = Prisma.InscripcionMesaGetPayload<{
  include: typeof inscripcionMesaListadoInclude;
}>;

export type InscripcionMesaDetalle = Prisma.InscripcionMesaGetPayload<{
  include: typeof inscripcionMesaDetalleInclude;
}>;

export async function getAll(): Promise<InscripcionMesaListado[]> {
  return prisma.inscripcionMesa.findMany({ include: inscripcionMesaListadoInclude });
}

export async function getById(id: number): Promise<InscripcionMesaDetalle> {
  const dato = await prisma.inscripcionMesa.findUnique({
    where: { id },
    include: inscripcionMesaDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<InscripcionMesa, "id">): Promise<InscripcionMesa> {
  return prisma.inscripcionMesa.create({ data: datos });
}

export async function update(id: number, datos: Omit<InscripcionMesa, "id">): Promise<InscripcionMesa> {
  return prisma.inscripcionMesa.update({ where: { id }, data: datos });
}

export async function remove(id: number): Promise<InscripcionMesa> {
  return prisma.inscripcionMesa.delete({ where: { id } });
}
