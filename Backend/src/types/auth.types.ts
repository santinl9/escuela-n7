/**
 * Contenido del JWT.
 *
 * Deliberadamente MÍNIMO: solo identifica al usuario. Los roles y permisos NO
 * viajan en el token, se resuelven contra la base en cada request (ver
 * `authenticate` en src/middlewares/auth.middleware.ts). Así, desactivar un
 * usuario o cambiarle los roles surte efecto en el request siguiente, sin
 * esperar a que venza el token.
 */
export type PayloadToken = {
  usuarioId: number;
  personalId: number;
  email: string;
};

/** Usuario ya autenticado que `authenticate` cuelga en `req.usuario`. */
export type UsuarioAutenticado = {
  id: number;
  personalId: number;
  email: string;
  nombre: string;
  apellido: string;
  /** Nombres de los roles asignados (ej. ["Docente", "Preceptor"]). */
  roles: string[];
  /** Unión de los códigos de permiso de TODOS sus roles (ej. ["p1", "p5", "p49"]). */
  permisos: string[];
};
