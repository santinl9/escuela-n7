/**
 * Normaliza texto para comparaciones de búsqueda: ignora mayúsculas/minúsculas, acentos,
 * caracteres especiales (°, -, :, ·, etc.) y espacios. Los espacios se eliminan por completo
 * (no solo se colapsan) para que "1a" y "1° A" se consideren equivalentes.
 */
export const normalizarBusqueda = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
