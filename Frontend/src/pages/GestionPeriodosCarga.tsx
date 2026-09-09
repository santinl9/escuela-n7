import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { usePeriodoCargaModal } from '../hooks/usePeriodoCargaModal';
import { useToast } from '../hooks/useToast';
import { useCicloLectivo } from '../hooks/useCicloLectivo';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import PeriodoCargaModal from '../components/modals/PeriodoCargaModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoBadge from '../components/elements/EstadoBadge';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';
import { formatFecha, estaVigente } from '../constants/fechas';

function GestionPeriodosCarga() {
  const { data: periodosData, setData: setPeriodos, loading: loadingPeriodos, error: errorPeriodos } = useFetch<PeriodoCarga[]>('/data/periodosCarga.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');

  const ciclos = ciclosData ?? [];

  // El ciclo activo de esta sesión (ver CicloLectivoContext).
  const { cicloLectivoActivoId } = useCicloLectivo();
  const cicloActivo = ciclos.find(c => c.id === cicloLectivoActivoId);
  const periodos = (periodosData ?? []).filter(p => p.cicloLectivoId === cicloActivo?.id);

  // Si el ciclo que se está viendo no es el ciclo lectivo actual (por fecha),
  // se trata de un ciclo histórico: no se puede crear, editar ni eliminar
  // nada que pertenezca a él, para no alterar el historial.
  const esCicloActualEfectivo = cicloActivo !== undefined && cicloActivo.id === cicloLectivoActual(ciclos)?.id;

  // El período más reciente va primero.
  const periodosOrdenados = [...periodos].sort((a, b) => b.fechaIni.localeCompare(a.fechaIni));

  // Si hay un período vigente (hoy cae dentro de su rango de fechas), se lo resalta
  // opacando el resto para que se distinga de un vistazo.
  const hayPeriodoVigente = periodos.some(p => estaVigente(p.fechaIni, p.fechaFin));

  const [periodoAEliminar, setPeriodoAEliminar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, validarForm,
  } = usePeriodoCargaModal();

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(periodos) || !cicloActivo || !esCicloActualEfectivo) return;

    if (modoEdicion && idEditando !== null) {
      setPeriodos(prev =>
        (prev ?? []).map(p =>
          p.id === idEditando
            ? { ...p, descripcion: form.descripcion, tipo: form.tipo as PeriodoCarga['tipo'], fechaIni: form.fechaIni, fechaFin: form.fechaFin }
            : p
        )
      );
      cerrarModal();
      mostrarToast(TOAST.PERIODO_CARGA_MODIFICADO);
    } else {
      const nuevoId = (periodosData ?? []).length > 0 ? Math.max(...(periodosData ?? []).map(p => p.id)) + 1 : 1;
      setPeriodos(prev => [
        ...(prev ?? []),
        {
          id: nuevoId,
          descripcion: form.descripcion,
          tipo: form.tipo as PeriodoCarga['tipo'],
          cicloLectivoId: cicloActivo.id,
          fechaIni: form.fechaIni,
          fechaFin: form.fechaFin,
        },
      ]);
      cerrarModal();
      mostrarToast(TOAST.PERIODO_CARGA_CREADO);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────

  const handleEliminar = () => {
    if (periodoAEliminar === null || !esCicloActualEfectivo) return;
    setPeriodos(prev => (prev ?? []).filter(p => p.id !== periodoAEliminar));
    setPeriodoAEliminar(null);
    mostrarToast(TOAST.PERIODO_CARGA_ELIMINADO);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const loading = loadingPeriodos || loadingCiclos;
  const error   = errorPeriodos   || errorCiclos;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Gestión de Períodos de Carga
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            {cicloActivo
              ? `Períodos de carga de calificaciones y asistencia del ciclo lectivo ${nombreCicloLectivo(cicloActivo)}.`
              : 'Administra los períodos bimestrales y cuatrimestrales de carga de calificaciones y asistencia.'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          disabled={!cicloActivo || !esCicloActualEfectivo}
          title={
            !cicloActivo
              ? 'Marcá un ciclo lectivo como activo para crear períodos de carga'
              : !esCicloActualEfectivo
              ? 'No se pueden crear períodos de carga en un ciclo lectivo que no es el actual'
              : undefined
          }
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nuevo Período de Carga
        </button>
      </div>

      {/* Aviso de ciclo histórico */}
      {cicloActivo && !esCicloActualEfectivo && (
        <div className="flex items-start gap-2 -mt-4 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container font-body text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[1.25rem] shrink-0">lock</span>
          Estás viendo un ciclo lectivo histórico. No se pueden crear, editar ni eliminar períodos de carga para preservar el historial.
        </div>
      )}

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {periodos.length} {periodos.length === 1 ? 'período de carga' : 'períodos de carga'} en total
      </p>

      {/* Listado */}
      {!cicloActivo ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Marcá un ciclo lectivo como activo para ver los períodos de carga de ese ciclo.
        </div>
      ) : periodos.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No hay períodos de carga registrados para el ciclo lectivo {nombreCicloLectivo(cicloActivo)}.
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Descripción</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Tipo de Calificación</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Fecha de inicio</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Fecha de fin</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estado</th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {periodosOrdenados.map(periodo => {
                  const vigente = estaVigente(periodo.fechaIni, periodo.fechaFin);
                  const atenuado = hayPeriodoVigente && !vigente;
                  return (
                    <tr key={periodo.id} className={`hover:bg-surface-container-high transition-opacity duration-150 ${atenuado ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{periodo.descripcion}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                          {periodo.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{formatFecha(periodo.fechaIni)}</td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{formatFecha(periodo.fechaFin)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {vigente && <EstadoBadge estado="Vigente" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-xs">
                          <button
                            onClick={() => abrirModalEdicion(periodo)}
                            disabled={!esCicloActualEfectivo}
                            title={esCicloActualEfectivo ? 'Editar' : 'No se puede editar: ciclo lectivo histórico'}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                          </button>
                          <button
                            onClick={() => setPeriodoAEliminar(periodo.id)}
                            disabled={!esCicloActualEfectivo}
                            title={esCicloActualEfectivo ? 'Eliminar' : 'No se puede eliminar: ciclo lectivo histórico'}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="px-md py-sm bg-surface-container border-t border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {periodos.length} {periodos.length === 1 ? 'período de carga' : 'períodos de carga'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {periodosOrdenados.map(periodo => {
              const vigente = estaVigente(periodo.fechaIni, periodo.fechaFin);
              const atenuado = hayPeriodoVigente && !vigente;
              return (
              <div
                key={periodo.id}
                className={`bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3 ${atenuado ? 'opacity-40' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-body text-body-sm text-on-surface font-medium">{periodo.descripcion}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                      {periodo.tipo}
                    </span>
                    {vigente && <EstadoBadge estado="Vigente" />}
                  </div>
                  <div className="flex items-center gap-xs flex-wrap shrink-0">
                    <button
                      onClick={() => abrirModalEdicion(periodo)}
                      disabled={!esCicloActualEfectivo}
                      title={esCicloActualEfectivo ? 'Editar' : 'No se puede editar: ciclo lectivo histórico'}
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                    </button>
                    <button
                      onClick={() => setPeriodoAEliminar(periodo.id)}
                      disabled={!esCicloActualEfectivo}
                      title={esCicloActualEfectivo ? 'Eliminar' : 'No se puede eliminar: ciclo lectivo histórico'}
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap border-t border-outline-variant pt-3 font-body text-xs text-on-surface-variant">
                  <span>Inicio: {formatFecha(periodo.fechaIni)}</span>
                  <span>Fin: {formatFecha(periodo.fechaFin)}</span>
                </div>
              </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal nuevo / edición */}
      {modalAbierto && (
        <PeriodoCargaModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {periodoAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Período de Carga"
          mensaje="¿Estás seguro de que querés eliminar este período de carga? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setPeriodoAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionPeriodosCarga;
