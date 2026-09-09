import bcrypt from "bcrypt";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { NoEncontradoError } from "../errors/app.error";
import { env } from "../config/env";
import { Usuario } from "../types/usuario.types";

/**
 * El hash de la contraseña nunca sale del backend: se omite en las cuatro
 * operaciones que devuelven un Usuario. Solo auth.service lo lee, para
 * compararlo con bcrypt en el login.
 */
const usuarioOmit = { contrasenia: true } satisfies Prisma.UsuarioOmit;

/**
 * Relaciones cargadas en el LISTADO general (getAll):
 * solo la entidad "padre" a la que pertenece.
 */
const usuarioListadoInclude = {
  personal: true,
} satisfies Prisma.UsuarioInclude;

/**
 * Relaciones cargadas en el DETALLE (getById):
 * padre + roles asignados (N:M).
 */
const usuarioDetalleInclude = {
  personal: true,
  roles: true,
} satisfies Prisma.UsuarioInclude;

export type UsuarioListado = Prisma.UsuarioGetPayload<{
  include: typeof usuarioListadoInclude;
  omit: typeof usuarioOmit;
}>;

export type UsuarioDetalle = Prisma.UsuarioGetPayload<{
  include: typeof usuarioDetalleInclude;
  omit: typeof usuarioOmit;
}>;

export type UsuarioPublico = Prisma.UsuarioGetPayload<{ omit: typeof usuarioOmit }>;

export async function getAll(): Promise<UsuarioListado[]> {
  return prisma.usuario.findMany({ include: usuarioListadoInclude, omit: usuarioOmit });
}

export async function getById(id: number): Promise<UsuarioDetalle> {
  const dato = await prisma.usuario.findUnique({
    where: { id },
    include: usuarioDetalleInclude,
    omit: usuarioOmit,
  });

  if (!dato) {
    throw new NoEncontradoError();
  }

  return dato;
}

export async function create(datos: Omit<Usuario, "id">): Promise<UsuarioPublico> {
  return prisma.usuario.create({
    data: { ...datos, contrasenia: await bcrypt.hash(datos.contrasenia, env.BCRYPT_ROUNDS) },
    omit: usuarioOmit,
  });
}

export async function update(
  id: number,
  datos: Partial<Omit<Usuario, "id">>,
): Promise<UsuarioPublico> {
  return prisma.usuario.update({
    where: { id },
    data: {
      ...datos,
      // Los esquemas de update son .partial(): solo se re-hashea si el body
      // trae una contraseña nueva. Si no, se deja el hash que ya estaba.
      ...(datos.contrasenia
        ? { contrasenia: await bcrypt.hash(datos.contrasenia, env.BCRYPT_ROUNDS) }
        : {}),
    },
    omit: usuarioOmit,
  });
}

/** Baja lógica: marca el usuario como inactivo sin borrarlo. */
export async function desactivar(id: number): Promise<UsuarioPublico> {
  return prisma.usuario.update({ where: { id }, data: { activo: false }, omit: usuarioOmit });
}

export async function remove(id: number): Promise<UsuarioPublico> {
  return prisma.usuario.delete({ where: { id }, omit: usuarioOmit });
}
