import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { ALCANCE_TOTAL, filtroEstudianteDni, type Alcance } from "./alcance.service";
import { NoEncontradoError } from "../errors/app.error";
import { ContactoEmergencia } from "../types/contactoEmergencia.types";

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo la entidad "padre" a la que pertenece.
 */
const contactoEmergenciaListadoInclude = {
  estudiante: true,
} satisfies Prisma.ContactoEmergenciaInclude;

/**
 * Relaciones cargadas en el DETALLE (getById).
 * ContactoEmergencia no tiene hijos: coincide con el listado.
 */
const contactoEmergenciaDetalleInclude = {
  estudiante: true,
} satisfies Prisma.ContactoEmergenciaInclude;

export type ContactoEmergenciaListado = Prisma.ContactoEmergenciaGetPayload<{
  include: typeof contactoEmergenciaListadoInclude;
}>;

export type ContactoEmergenciaDetalle = Prisma.ContactoEmergenciaGetPayload<{
  include: typeof contactoEmergenciaDetalleInclude;
}>;

/**
 * Corta con 404 si la fila no existe o queda fuera del alcance del usuario.
 *
 * Se responde 404 y no 403 a proposito: a alguien que no deberia ver la fila no
 * se le confirma que exista.
 */
async function asegurarEnAlcance(id: number, alcance: Alcance): Promise<void> {
  const enAlcance = await prisma.contactoEmergencia.findFirst({
    where: { id, ...filtroEstudianteDni(alcance) },
    select: { id: true },
  });

  if (!enAlcance) {
    throw new NoEncontradoError();
  }
}

export async function getAll(alcance: Alcance = ALCANCE_TOTAL): Promise<ContactoEmergenciaListado[]> {
  return prisma.contactoEmergencia.findMany({ where: filtroEstudianteDni(alcance), include: contactoEmergenciaListadoInclude });
}

export async function getById(
  id: number,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<ContactoEmergenciaDetalle> {
  const dato = await prisma.contactoEmergencia.findFirst({
    where: { id, ...filtroEstudianteDni(alcance) },
    include: contactoEmergenciaDetalleInclude,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<ContactoEmergencia, "id">): Promise<ContactoEmergencia> {
  return prisma.contactoEmergencia.create({ data: datos });
}

export async function update(
  id: number,
  datos: Partial<Omit<ContactoEmergencia, "id">>,
  alcance: Alcance = ALCANCE_TOTAL,
): Promise<ContactoEmergencia> {
  await asegurarEnAlcance(id, alcance);
  return prisma.contactoEmergencia.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<ContactoEmergencia> {
  await asegurarEnAlcance(id, alcance);
  return prisma.contactoEmergencia.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number, alcance: Alcance = ALCANCE_TOTAL): Promise<ContactoEmergencia> {
  await asegurarEnAlcance(id, alcance);
  return prisma.contactoEmergencia.delete({ where: { id } });
}
