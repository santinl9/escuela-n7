import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { Persona } from "../types/persona.types";

/**
 * Persona no declara relaciones en el schema.prisma, por lo que
 * el listado y el detalle no llevan include. Los tipos se exportan
 * igualmente para mantener la convención [Entidad]Listado / [Entidad]Detalle.
 */
export type PersonaListado = Prisma.PersonaGetPayload<{}>;

export type PersonaDetalle = Prisma.PersonaGetPayload<{}>;

export async function getAll(): Promise<PersonaListado[]> {
  return prisma.persona.findMany();
}

export async function getById(id: number): Promise<PersonaDetalle> {
  const dato = await prisma.persona.findUnique({ where: { id } });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Persona, "id">): Promise<Persona> {
  return prisma.persona.create({ data: datos });
}

export async function update(id: number, datos: Omit<Persona, "id">): Promise<Persona> {
  return prisma.persona.update({ where: { id }, data: datos });
}

/** Baja logica: marca la fila como inactiva sin borrarla del historial. */
export async function desactivar(id: number): Promise<Persona> {
  return prisma.persona.update({ where: { id }, data: { activo: false } });
}

export async function remove(id: number): Promise<Persona> {
  return prisma.persona.delete({ where: { id } });
}
