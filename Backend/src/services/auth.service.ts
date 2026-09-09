import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import {
  ConflictoError,
  NoAutenticadoError,
  NoEncontradoError,
  SolicitudInvalidaError,
} from "../errors/app.error";
import type { PayloadToken, UsuarioAutenticado } from "../types/auth.types";
import type { LoginInput, RegisterInput } from "../validations/auth.validation";

/** Relaciones necesarias para resolver la identidad y los permisos efectivos. */
const usuarioAuthInclude = {
  personal: true,
  roles: { include: { permisos: true } },
} satisfies Prisma.UsuarioInclude;

type UsuarioAuth = Prisma.UsuarioGetPayload<{ include: typeof usuarioAuthInclude }>;

/**
 * Proyecta un Usuario de Prisma a su forma pública.
 * NUNCA incluye el campo `contrasenia`.
 */
function aUsuarioPublico(usuario: UsuarioAuth): UsuarioAutenticado {
  // Un usuario puede tener varios roles: sus permisos efectivos son la UNIÓN.
  const permisos = [
    ...new Set(usuario.roles.flatMap((rol) => rol.permisos.map((permiso) => permiso.codigo))),
  ];

  return {
    id: usuario.id,
    personalId: usuario.personalId,
    email: usuario.personal.email,
    nombre: usuario.personal.nombre,
    apellido: usuario.personal.apellido,
    roles: usuario.roles.map((rol) => rol.nombre),
    permisos,
  };
}

/**
 * Inicia sesión y devuelve el token junto con la identidad del usuario.
 *
 * Usuario no tiene email propio: la identidad se resuelve por
 * Usuario -> Personal (1:1) -> Personal.email (@unique).
 *
 * Errores: 401 credenciales incorrectas | 401 usuario inactivo.
 */
export async function login({ email, contrasenia }: LoginInput) {
  // Mismo mensaje para "no existe" y "contraseña incorrecta": no se revela
  // qué cuentas existen en el sistema.
  const CREDENCIALES_INVALIDAS = "Email o contraseña incorrectos";

  const usuario = await prisma.usuario.findFirst({
    where: { personal: { email } },
    include: usuarioAuthInclude,
  });

  if (!usuario) {
    throw new NoAutenticadoError(CREDENCIALES_INVALIDAS);
  }

  const coincide = await bcrypt.compare(contrasenia, usuario.contrasenia);

  if (!coincide) {
    throw new NoAutenticadoError(CREDENCIALES_INVALIDAS);
  }

  // Se comprueba DESPUÉS de validar la contraseña: así el mensaje "usuario
  // inactivo" solo lo ve quien realmente conoce las credenciales.
  // Se exigen activos tanto el Usuario como el Personal: un agente dado de baja
  // en la institución no debe poder operar el sistema.
  if (!usuario.activo || !usuario.personal.activo) {
    throw new NoAutenticadoError("El usuario está inactivo");
  }

  const payload: PayloadToken = {
    usuarioId: usuario.id,
    personalId: usuario.personalId,
    email: usuario.personal.email,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

  return { token, usuario: aUsuarioPublico(usuario) };
}

/**
 * Registra un Usuario para un Personal que YA existe en la institución.
 *
 * Usuario no puede existir sin Personal (la FK personalId es obligatoria y
 * @unique), así que el alta NO crea personas: vincula credenciales a un legajo
 * preexistente. Por eso el endpoint es administrativo y no público.
 *
 * Errores: 400 roles inexistentes | 404 no existe el personal | 409 ya tiene usuario.
 */
export async function register({ email, contrasenia, roles }: RegisterInput) {
  const personal = await prisma.personal.findUnique({
    where: { email },
    include: { usuario: true },
  });

  if (!personal) {
    throw new NoEncontradoError("No existe personal registrado con ese email");
  }

  if (personal.usuario) {
    throw new ConflictoError("Ese personal ya tiene un usuario asignado");
  }

  const nombresUnicos = [...new Set(roles)];
  const rolesEncontrados = await prisma.rol.findMany({
    where: { nombre: { in: nombresUnicos } },
  });

  if (rolesEncontrados.length !== nombresUnicos.length) {
    const encontrados = new Set(rolesEncontrados.map((rol) => rol.nombre));
    const faltantes = nombresUnicos.filter((nombre) => !encontrados.has(nombre));
    throw new SolicitudInvalidaError("Uno o más roles no existen", {
      rolesInexistentes: faltantes,
    });
  }

  const contraseniaHasheada = await bcrypt.hash(contrasenia, env.BCRYPT_ROUNDS);

  const creado = await prisma.usuario.create({
    data: {
      activo: true,
      contrasenia: contraseniaHasheada,
      personal: { connect: { id: personal.id } },
      roles: { connect: rolesEncontrados.map((rol) => ({ id: rol.id })) },
    },
    include: usuarioAuthInclude,
  });

  return aUsuarioPublico(creado);
}
