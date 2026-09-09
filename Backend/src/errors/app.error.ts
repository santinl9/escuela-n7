/**
 * Error de aplicación con un código HTTP asociado.
 *
 * Permite que los services corten el flujo con `throw` y que el middleware
 * global de errores traduzca el error a la respuesta HTTP correcta, sin que los
 * controllers necesiten try/catch (Express 5 reenvía los rechazos async).
 */
export class AppError extends Error {
  constructor(
    public readonly estado: number,
    mensaje: string,
    public readonly detalles?: unknown,
  ) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** 400 — La petición es sintácticamente válida pero semánticamente incorrecta. */
export class SolicitudInvalidaError extends AppError {
  constructor(mensaje = "Datos inválidos", detalles?: unknown) {
    super(400, mensaje, detalles);
  }
}

/** 401 — No hay identidad válida: falta token, es inválido o las credenciales no coinciden. */
export class NoAutenticadoError extends AppError {
  constructor(mensaje = "No autenticado") {
    super(401, mensaje);
  }
}

/** 403 — La identidad es válida pero no tiene el permiso requerido. */
export class NoAutorizadoError extends AppError {
  constructor(mensaje = "No tenés permiso para realizar esta acción") {
    super(403, mensaje);
  }
}

/** 404 — El recurso referenciado no existe, o está fuera del alcance del usuario. */
export class NoEncontradoError extends AppError {
  constructor(mensaje = "No encontrado") {
    super(404, mensaje);
  }
}

/** 409 — Conflicto con el estado actual del recurso. */
export class ConflictoError extends AppError {
  constructor(mensaje = "Conflicto con el estado actual del recurso") {
    super(409, mensaje);
  }
}
