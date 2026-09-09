import type { Estudiante } from '../../types/Estudiante';
import type { NotaValorativa } from '../../types/CargaValorativa';
import type { TipoCalificacion } from '../../types/PeriodoCarga';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import { formatFecha } from '../../constants/fechas';
import PorcentajeAsistencia from '../elements/PorcentajeAsistencia';

export interface PeriodoCargaResumen {
  id: number;
  descripcion: string;
  tipo: TipoCalificacion;
  calificacion: NotaValorativa | number | null;
  inasistencias: number | null;
}

interface DetalleInscripcionModalProps {
  estudiante: Estudiante;
  notaFinal: string;
  errorNotaFinal?: string;
  // % de asistencia: se muestra solo si se pasa (algunos listados ya lo muestran aparte).
  porcentajeAsistencia?: number | null;
  // Fecha de inscripción: se muestra solo si se pasa (algunos listados ya la muestran aparte).
  fecha?: string;
  // Notas de períodos previos: se muestra solo si se pasa (algunos listados ya las muestran aparte).
  periodos?: PeriodoCargaResumen[];
  // La nota final se carga una única vez: si ya tiene un valor, esta pantalla la muestra de
  // solo lectura (no se puede pisar). La corrección manual, si hace falta, se hace desde
  // Gestión de Inscripciones, que no pasa esta prop.
  soloLecturaNotaFinal?: boolean;
  onClose: () => void;
  onChangeNotaFinal: (valor: string) => void;
  onGuardarNotaFinal: () => void;
}

function DetalleInscripcionModal({
  estudiante,
  notaFinal,
  errorNotaFinal,
  porcentajeAsistencia,
  fecha,
  periodos,
  soloLecturaNotaFinal = false,
  onClose,
  onChangeNotaFinal,
  onGuardarNotaFinal,
}: DetalleInscripcionModalProps) {
  const { mostrarToast } = useToast();

  const handleCancelar = () => {
    mostrarToast(TOAST.CANCELANDO_EDICION);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header — el título son los datos personales del estudiante */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <div className="min-w-0">
            <h2 className="font-headline text-headline-md font-bold text-on-surface truncate">
              {estudiante.apellido}, {estudiante.nombre}
            </h2>
            <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
              DNI {estudiante.dni}
            </p>
          </div>
          <button
            onClick={handleCancelar}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto scrollbar-custom flex flex-col gap-6">

          {/* Nota final y, si se pasan, % de asistencia y fecha de inscripción */}
          <div className={`grid grid-cols-1 ${
            porcentajeAsistencia !== undefined && fecha !== undefined
              ? 'sm:grid-cols-3'
              : porcentajeAsistencia !== undefined || fecha !== undefined
              ? 'sm:grid-cols-2'
              : ''
          } gap-x-6 gap-y-4`}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="notaFinal" className="font-label text-label-md text-on-surface-variant">
                Nota Final
              </label>
              <input
                id="notaFinal"
                type="text"
                inputMode="numeric"
                value={notaFinal}
                onChange={e => onChangeNotaFinal(e.target.value)}
                placeholder="Ej: 8"
                disabled={soloLecturaNotaFinal}
                style={{ color: 'var(--on-surface)', backgroundColor: soloLecturaNotaFinal ? 'var(--surface-container)' : 'var(--background)' }}
                className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 disabled:cursor-not-allowed ${
                  errorNotaFinal ? 'border-error' : 'border-outline-variant'
                }`}
              />
              {errorNotaFinal && (
                <p className="font-body text-xs text-error">{errorNotaFinal}</p>
              )}
              {soloLecturaNotaFinal && (
                <p className="font-body text-xs text-on-surface-variant">
                  La nota final ya fue cargada y no puede modificarse desde acá.
                </p>
              )}
            </div>
            {porcentajeAsistencia !== undefined && (
              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-md text-on-surface-variant">% de Asistencia</span>
                <PorcentajeAsistencia porcentaje={porcentajeAsistencia} />
              </div>
            )}
            {fecha !== undefined && (
              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-md text-on-surface-variant">Fecha de inscripción</span>
                <span className="font-body text-body-sm text-on-surface">{formatFecha(fecha)}</span>
              </div>
            )}
          </div>

          {/* Períodos de carga previos (solo si el listado no los muestra ya aparte) */}
          {periodos !== undefined && (
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
              <h3 className="font-label text-label-md text-on-surface-variant">Períodos de carga</h3>
              {periodos.length === 0 ? (
                <p className="font-body text-body-sm text-on-surface-variant">
                  Todavía no pasó ningún período de carga en este ciclo lectivo.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-outline-variant border border-outline-variant rounded-lg overflow-hidden">
                  {periodos.map(periodo => (
                    <div key={periodo.id} className="flex items-center justify-between gap-3 px-4 py-2.5 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-body text-body-sm text-on-surface font-medium">{periodo.descripcion}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                          {periodo.tipo}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 font-body text-body-sm text-on-surface-variant">
                        <span>Calificación: {periodo.calificacion ?? 'Sin cargar'}</span>
                        <span>Inasistencias: {periodo.inasistencias ?? '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          {soloLecturaNotaFinal ? (
            <button
              onClick={onClose}
              className="cursor-pointer px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-label text-label-md hover:bg-surface-container-high transition-colors duration-150"
            >
              Cerrar
            </button>
          ) : (
            <button
              onClick={onGuardarNotaFinal}
              className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              Guardar
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default DetalleInscripcionModal;
