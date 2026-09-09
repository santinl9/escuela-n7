import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroEstudianteDni, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { Domicilio } from "../types/domicilio.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo la entidad "padre" a la que pertenece.
 */
const domicilioListadoInclude = {
  estudiante: true,
} satisfies Prisma.DomicilioInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * Domicilio no tiene hijos: coincide con el listado.
 */
const domicilioDetalleInclude = {
  estudiante: true,
} satisfies Prisma.DomicilioInclude;

export type DomicilioListado = Prisma.DomicilioGetPayload<{
  include: typeof domicilioListadoInclude;
}>;

export type DomicilioDetalle = Prisma.DomicilioGetPayload<{
  include: typeof domicilioDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.domicilio.findFirst({
    where: { id, ...filtroEstudianteDni(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<DomicilioListado[]> {
  return prisma.domicilio.findMany({ where: filtroEstudianteDni(alcance), include: domicilioListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<DomicilioDetalle> {
  const dato = await prisma.domicilio.findFirst({
    where: { id, ...filtroEstudianteDni(alcance) },
    include: domicilioDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Domicilio, "id">): Promise<Domicilio> {
  return prisma.domicilio.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<Domicilio, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<Domicilio> {
  await asegurarEnAlcance(id, alcance);
  return prisma.domicilio.update({ where: { id }, data: datos });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<Domicilio> {
  await asegurarEnAlcance(id, alcance);
  return prisma.domicilio.delete({ where: { id } });
}
