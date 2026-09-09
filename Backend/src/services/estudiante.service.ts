import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroEstudiante, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { Estudiante } from "../types/estudiante.types";

/**
 * Estudiante no pertenece a ninguna entidad "padre": el listado no requiere include.
 */
export type EstudianteListado = Estudiante;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * todas las listas de hijos (1:N).
 */
const estudianteDetalleInclude = {
  asistencias: true,
  contactosEmergencia: true,
  domicilios: true,
  inscripciones: true,
  inscripcionesMesa: true,
  matriculas: true,
} satisfies Prisma.EstudianteInclude;

export type EstudianteDetalle = Prisma.EstudianteGetPayload<{
  include: typeof estudianteDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.estudiante.findFirst({
    where: { id, ...filtroEstudiante(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<EstudianteListado[]> {
  return prisma.estudiante.findMany({ where: filtroEstudiante(alcance) });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<EstudianteDetalle> {
  const dato = await prisma.estudiante.findFirst({
    where: { id, ...filtroEstudiante(alcance) },
    include: estudianteDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Estudiante, "id">): Promise<Estudiante> {
  return prisma.estudiante.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<Estudiante, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<Estudiante> {
  await asegurarEnAlcance(id, alcance);
  return prisma.estudiante.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<Estudiante> {
  await asegurarEnAlcance(id, alcance);
  return prisma.estudiante.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<Estudiante> {
  await asegurarEnAlcance(id, alcance);
  return prisma.estudiante.delete({ where: { id } });
}
