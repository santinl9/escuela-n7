import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroEstudianteDni, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { AsistenciaInstitucional } from "../types/asistenciaInstitucional.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo la entidad "padre" a la que pertenece.
 */
const asistenciaInstitucionalListadoInclude = {
  estudiante: true,
} satisfies Prisma.AsistenciaInstitucionalInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * AsistenciaInstitucional no tiene hijos: coincide con el listado.
 */
const asistenciaInstitucionalDetalleInclude = {
  estudiante: true,
} satisfies Prisma.AsistenciaInstitucionalInclude;

export type AsistenciaInstitucionalListado = Prisma.AsistenciaInstitucionalGetPayload<{
  include: typeof asistenciaInstitucionalListadoInclude;
}>;

export type AsistenciaInstitucionalDetalle = Prisma.AsistenciaInstitucionalGetPayload<{
  include: typeof asistenciaInstitucionalDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.asistenciaInstitucional.findFirst({
    where: { id, ...filtroEstudianteDni(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<AsistenciaInstitucionalListado[]> {
  return prisma.asistenciaInstitucional.findMany({ where: filtroEstudianteDni(alcance), include: asistenciaInstitucionalListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<AsistenciaInstitucionalDetalle> {
  const dato = await prisma.asistenciaInstitucional.findFirst({
    where: { id, ...filtroEstudianteDni(alcance) },
    include: asistenciaInstitucionalDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<AsistenciaInstitucional, "id">): Promise<AsistenciaInstitucional> {
  return prisma.asistenciaInstitucional.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<AsistenciaInstitucional, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<AsistenciaInstitucional> {
  await asegurarEnAlcance(id, alcance);
  return prisma.asistenciaInstitucional.update({ where: { id }, data: datos });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<AsistenciaInstitucional> {
  await asegurarEnAlcance(id, alcance);
  return prisma.asistenciaInstitucional.delete({ where: { id } });
}
