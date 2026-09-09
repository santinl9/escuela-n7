/** Convierte una fecha en formato ISO (yyyy-mm-dd), como se guarda y se pasa a los inputs de tipo date, al formato de visualización dd/mm/yyyy. */
export const formatFecha = (fecha: string): string => {
  if (!fecha) return '';
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
};

/**
 * Fecha de hoy en formato ISO (yyyy-mm-dd), según el huso horario local.
 * `Date.toISOString()` da la fecha en UTC, que puede ser un día distinto a la fecha local
 * (p.ej. de noche en Argentina, UTC ya está en el día siguiente): por eso se arma a mano
 * con los componentes locales, para que coincida con cómo se interpretan las fechas
 * `yyyy-mm-ddT00:00:00` (hora local) del resto de la app.
 */
export const hoyISO = (): string => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

/** Cantidad de días entre hoy y una fecha ISO (yyyy-mm-dd) dada. Negativo si ya pasó. */
export const diasHasta = (fecha: string): number => {
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((new Date(`${fecha}T00:00:00`).getTime() - new Date(`${hoyISO()}T00:00:00`).getTime()) / msPorDia);
};

/** Cantidad de días con su unidad en singular/plural (p.ej. "1 día", "6 días"). */
export const textoCantidadDias = (dias: number): string =>
  `${dias} ${dias === 1 ? 'día' : 'días'}`;

/**
 * Indica si hoy cae dentro del rango [fechaIni, fechaFin] (ambos ISO yyyy-mm-dd, inclusive).
 * Una fechaFin vacía representa "sin fecha de fin" (vigente indefinidamente), como en AsignacionHoraria.
 */
export const estaVigente = (fechaIni: string, fechaFin: string): boolean => {
  const hoy = hoyISO();
  return fechaIni <= hoy && (fechaFin === '' || hoy <= fechaFin);
};
