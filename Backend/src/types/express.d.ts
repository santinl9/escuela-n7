import type { UsuarioAutenticado } from "./auth.types";

/**
 * Declaration merging: agrega la propiedad `usuario` a la interfaz Request de
 * Express, para que los middlewares y controllers accedan a `req.usuario` con
 * tipado. La completa el middleware `authenticate`.
 *
 * Es opcional (`?`) porque en las rutas públicas (login, healthcheck) no está
 * definida. Para leerla en una ruta protegida conviene usar el helper
 * `obtenerUsuarioAutenticado(req)` de auth.middleware.ts.
 */
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}

export {};
