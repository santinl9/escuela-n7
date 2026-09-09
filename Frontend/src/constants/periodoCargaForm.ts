import type { FormPeriodoCarga } from '../types/formTypes/periodoCargaFormTypes';
import type { TipoCalificacion } from '../types/PeriodoCarga';

export const formVacioPeriodoCarga: FormPeriodoCarga = {
  descripcion: '',
  tipo:        '',
  fechaIni:    '',
  fechaFin:    '',
};

export const TIPOS_PERIODO_CARGA_OPCIONES: TipoCalificacion[] = ['Numerica', 'Valorativa', 'Intensificacion'];

// "1er Cuatrimestre" -> "1°C", "2do Bimestre" -> "2°B": número del período + inicial de su unidad.
export const abreviarPeriodo = (descripcion: string): string => {
  const partes = descripcion.trim().split(/\s+/);
  const numero = partes[0]?.match(/\d+/)?.[0] ?? '';
  const letra = (partes[partes.length - 1]?.charAt(0) ?? '').toUpperCase();
  return `${numero}°${letra}`;
};
