import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroCursada, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { Inscripcion } from "../types/inscripcion.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo las entidades "padre" a las que pertenece
 * (cursadaIntensificacion es opcional).
 */
const inscripcionListadoInclude = {
  estudiante: true,
  cursada: true,
  cursadaIntensificacion: true,
} satisfies Prisma.InscripcionInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padres + listas de hijos (cargas numéricas, valorativas y de intensificación).
 */
const inscripcionDetalleInclude = {
  estudiante: true,
  cursada: true,
  cursadaIntensificacion: true,
  cargasIntensificacion: true,
  cargasNumericas: true,
  cargasValorativas: true,
} satisfies Prisma.InscripcionInclude;

export type InscripcionListado = Prisma.InscripcionGetPayload<{
  include: typeof inscripcionListadoInclude;
}>;

export type InscripcionDetalle = Prisma.InscripcionGetPayload<{
  include: typeof inscripcionDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.inscripcion.findFirst({
    where: { id, ...filtroCursada(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<InscripcionListado[]> {
  return prisma.inscripcion.findMany({ where: filtroCursada(alcance), include: inscripcionListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<InscripcionDetalle> {
  const dato = await prisma.inscripcion.findFirst({
    where: { id, ...filtroCursada(alcance) },
    include: inscripcionDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Inscripcion, "id">): Promise<Inscripcion> {
  return prisma.inscripcion.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<Inscripcion, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<Inscripcion> {
  await asegurarEnAlcance(id, alcance);
  return prisma.inscripcion.update({ where: { id }, data: datos });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<Inscripcion> {
  await asegurarEnAlcance(id, alcance);
  return prisma.inscripcion.delete({ where: { id } });
}
