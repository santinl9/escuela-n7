import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useOrientacionModal } from '../hooks/useOrientacionModal';
import { useToast } from '../hooks/useToast';
import type { Orientacion } from '../types/Orientacion';
import OrientacionModal from '../components/modals/OrientacionModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';

function GestionOrientaciones() {
  const { data: orientacionesData, setData: setOrientaciones, loading, error } = useFetch<Orientacion[]>('/data/orientaciones.json');
  const orientaciones = orientacionesData ?? [];

  const [orientacionAEliminar, setOrientacionAEliminar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, validarForm,
  } = useOrientacionModal();

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(orientaciones)) return;

    if (modoEdicion && idEditando !== null) {
      setOrientaciones(prev =>
        (prev ?? []).map(esp =>
          esp.id === idEditando ? { ...esp, nombre: form.nombre } : esp
        )
      );
      cerrarModal();
      mostrarToast(TOAST.ORIENTACION_MODIFICADA);
    } else {
      const nuevoId = orientaciones.length > 0
        ? Math.max(...orientaciones.map(e => e.id)) + 1
        : 1;
      setOrientaciones(prev => [...(prev ?? []), { id: nuevoId, nombre: form.nombre }]);
      cerrarModal();
      mostrarToast(TOAST.ORIENTACION_CREADA);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────

  const handleEliminar = () => {
    if (orientacionAEliminar === null) return;
    setOrientaciones(prev => (prev ?? []).filter(esp => esp.id !== orientacionAEliminar));
    setOrientacionAEliminar(null);
    mostrarToast(TOAST.ORIENTACION_ELIMINADA);
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
            Gestión de Orientaciones
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administra las orientaciones disponibles en el sistema.
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nueva Orientación
        </button>
      </div>

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {orientaciones.length} {orientaciones.length === 1 ? 'orientación' : 'orientaciones'} en total
      </p>

      {/* Listado */}
      {orientaciones.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No hay orientaciones registradas.
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant">Nombre</th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {orientaciones.map(esp => (
                  <tr key={esp.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface">{esp.nombre}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-xs">
                        <button
                          onClick={() => abrirModalEdicion(esp)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                        </button>
                        <button
                          onClick={() => setOrientacionAEliminar(esp.id)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="px-md py-sm bg-surface-container border-t border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {orientaciones.length} {orientaciones.length === 1 ? 'orientación' : 'orientaciones'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {orientaciones.map(esp => (
              <div
                key={esp.id}
                className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between gap-3 flex-wrap"
              >
                <p className="font-body text-body-sm text-on-surface font-medium">{esp.nombre}</p>
                <div className="flex items-center gap-xs flex-wrap shrink-0">
                  <button
                    onClick={() => abrirModalEdicion(esp)}
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                  </button>
                  <button
                    onClick={() => setOrientacionAEliminar(esp.id)}
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal nuevo / edición */}
      {modalAbierto && (
        <OrientacionModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {orientacionAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Orientación"
          mensaje="¿Estás seguro de que querés eliminar esta orientación? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setOrientacionAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionOrientaciones;
