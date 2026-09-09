import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { NoAutenticadoError, NoAutorizadoError } from "../errors/app.error";
import type { PayloadToken, UsuarioAutenticado } from "../types/auth.types";

const PREFIJO_BEARER = "Bearer ";

/**
 * Middleware de AUTENTICACIÓN.
 *
 * 1. Lee el encabezado `Authorization: Bearer <token>`.
 * 2. Verifica la firma y la expiración del JWT.
 * 3. Vuelve a buscar al usuario en la base para resolver sus roles y permisos
 *    ACTUALES y comprobar que siga habilitado.
 * 4. Cuelga el resultado en `req.usuario`.
 *
 * Es async: Express 5 reenvía automáticamente el rechazo de la promesa al
 * errorHandler global, igual que en los controllers (por eso no hay try/catch
 * envolviendo todo).
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const encabezado = req.headers.authorization;

  if (!encabezado || !encabezado.startsWith(PREFIJO_BEARER)) {
    throw new NoAutenticadoError("Falta el token de autenticación");
  }

  const token = encabezado.slice(PREFIJO_BEARER.length).trim();

  let payload: PayloadToken;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as PayloadToken;
  } catch {
    // Cubre firma inválida, token mal formado y token expirado. Se traduce a un
    // error propio para que el errorHandler no dependa de jsonwebtoken.
    throw new NoAutenticadoError("Token inválido o expirado");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.usuarioId },
    // Nunca se carga el hash de la contraseña fuera del login.
    omit: { contrasenia: true },
    include: {
      personal: true,
      roles: { include: { permisos: true } },
    },
  });

  if (!usuario) {
    throw new NoAutenticadoError("El usuario del token ya no existe");
  }

  // Se exige que estén activos tanto el Usuario como el Personal: un agente
  // dado de baja en la institución no debe poder operar el sistema.
  if (!usuario.activo || !usuario.personal.activo) {
    throw new NoAutenticadoError("El usuario está inactivo");
  }

  // Un usuario puede tener varios roles (M-N): sus permisos efectivos son la
  // UNIÓN de los permisos de todos ellos, sin duplicados.
  const permisos = [
    ...new Set(usuario.roles.flatMap((rol) => rol.permisos.map((permiso) => permiso.codigo))),
  ];

  req.usuario = {
    id: usuario.id,
    personalId: usuario.personalId,
    email: usuario.personal.email,
    nombre: usuario.personal.nombre,
    apellido: usuario.personal.apellido,
    roles: usuario.roles.map((rol) => rol.nombre),
    permisos,
  };

  return next();
}

/**
 * Middleware de AUTORIZACIÓN.
 *
 * Devuelve un middleware que exige que el usuario autenticado tenga AL MENOS
 * UNO de los códigos de permiso indicados (ej. `authorize(P.ver)`).
 *
 * Debe usarse siempre DESPUÉS de `authenticate`, que en esta app se monta de
 * forma global en index.ts.
 */
export function authorize(...codigos: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const usuario = req.usuario;

    if (!usuario) {
      // Error de programación: se montó authorize sin authenticate previo.
      return next(new NoAutenticadoError("Falta el token de autenticación"));
    }

    const tienePermiso = codigos.some((codigo) => usuario.permisos.includes(codigo));

    if (!tienePermiso) {
      return next(new NoAutorizadoError("No tenés permiso para realizar esta acción"));
    }

    return next();
  };
}

/**
 * Devuelve el usuario autenticado de una ruta protegida.
 *
 * Evita arrastrar el `?` del tipado opcional de `req.usuario` por todos los
 * controllers y services.
 */
export function obtenerUsuarioAutenticado(req: Request): UsuarioAutenticado {
  if (!req.usuario) {
    throw new NoAutenticadoError("Falta el token de autenticación");
  }
  return req.usuario;
}
