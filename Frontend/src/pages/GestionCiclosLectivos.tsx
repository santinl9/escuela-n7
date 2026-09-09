import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useCicloLectivoModal } from '../hooks/useCicloLectivoModal';
import { useToast } from '../hooks/useToast';
import { useCicloLectivo } from '../hooks/useCicloLectivo';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import CicloLectivoModal from '../components/modals/CicloLectivoModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';
import { formatFecha } from '../constants/fechas';

function GestionCiclosLectivos() {
  const { data: ciclosData, setData: setCiclos, loading, error } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const ciclos = ciclosData ?? [];
  const cicloActualId = cicloLectivoActual(ciclos)?.id;
  // El ciclo actual (más reciente) va primero, seguido del resto en orden de recentismo.
  const ciclosOrdenados = [...ciclos].sort((a, b) => b.fechaIni.localeCompare(a.fechaIni));

  const [cicloAEliminar, setCicloAEliminar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  // El ciclo "activo" para esta sesión (ver CicloLectivoContext: arranca en
  // el ciclo actual y nunca se escribe de vuelta en los datos).
  const { cicloLectivoActivoId, seleccionarCicloLectivoActivo } = useCicloLectivo();

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, validarForm,
  } = useCicloLectivoModal();

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(ciclos)) return;

    if (modoEdicion && idEditando !== null) {
      setCiclos(prev =>
        (prev ?? []).map(c =>
          c.id === idEditando
            ? { ...c, fechaIni: form.fechaIni, fechaFin: form.fechaFin }
            : c
        )
      );
      cerrarModal();
      mostrarToast(TOAST.CICLO_LECTIVO_MODIFICADO);
    } else {
      const nuevoId = (ciclosData ?? []).length > 0 ? Math.max(...(ciclosData ?? []).map(c => c.id)) + 1 : 1;
      setCiclos(prev => [...(prev ?? []), { id: nuevoId, fechaIni: form.fechaIni, fechaFin: form.fechaFin, activo: false }]);
      cerrarModal();
      mostrarToast(TOAST.CICLO_LECTIVO_CREADO);
    }
  };

  // ── Marcar como ciclo lectivo activo (solo para esta sesión) ────────────────

  const handleMarcarActivo = (id: number) => {
    seleccionarCicloLectivoActivo(id);
    mostrarToast(TOAST.CICLO_LECTIVO_MARCADO_ACTIVO);
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────

  const handleEliminar = () => {
    if (cicloAEliminar === null) return;
    setCiclos(prev => (prev ?? []).filter(c => c.id !== cicloAEliminar));
    setCicloAEliminar(null);
    mostrarToast(TOAST.CICLO_LECTIVO_ELIMINADO);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Gestión de Ciclos Lectivos
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administra los ciclos lectivos disponibles en el sistema.
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nuevo Ciclo Lectivo
        </button>
      </div>

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {ciclos.length} {ciclos.length === 1 ? 'ciclo lectivo' : 'ciclos lectivos'} en total
      </p>

      {/* Cards */}
      {ciclos.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No hay ciclos lectivos registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {ciclosOrdenados.map(ciclo => {
            const esActivo = ciclo.id === cicloLectivoActivoId;
            return (
            <div
              key={ciclo.id}
              className={`bg-background rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col gap-4 ${
                esActivo ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-primary !text-[2rem] shrink-0 bg-surface-container-high p-2 rounded-xl">
                    calendar_month
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-headline text-lg xl:text-xl text-on-surface leading-tight">
                      {nombreCicloLectivo(ciclo)}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ciclo.id === cicloActualId && (
                        <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-primary text-background">
                          Ciclo actual
                        </span>
                      )}
                      {esActivo && (
                        <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                          Activo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-xs shrink-0">
                  {!esActivo && (
                    <button
                      onClick={() => handleMarcarActivo(ciclo.id)}
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                      title="Marcar como activo"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">check_circle</span>
                    </button>
                  )}
                  <button
                    onClick={() => abrirModalEdicion(ciclo)}
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                  </button>
                  {ciclo.id !== cicloActualId && !esActivo && (
                    <button
                      onClick={() => setCicloAEliminar(ciclo.id)}
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 font-body text-body-sm text-on-surface-variant border-t border-outline-variant pt-4">
                <div className="flex items-center justify-between">
                  <span>Fecha de inicio</span>
                  <span className="font-label text-label-md text-on-surface">{formatFecha(ciclo.fechaIni)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fecha de fin</span>
                  <span className="font-label text-label-md text-on-surface">{formatFecha(ciclo.fechaFin)}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Modal nuevo / edición */}
      {modalAbierto && (
        <CicloLectivoModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {cicloAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Ciclo Lectivo"
          mensaje="¿Estás seguro de que querés eliminar este ciclo lectivo? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setCicloAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionCiclosLectivos;
