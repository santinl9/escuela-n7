import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAulaModal } from '../hooks/useAulaModal';
import { useToast } from '../hooks/useToast';
import type { Aula } from '../types/Aula';
import AulaModal from '../components/modals/AulaModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';

function GestionAulas() {
  const { data: aulasData, setData: setAulas, loading, error } = useFetch<Aula[]>('/data/aulas.json');
  const aulas = (aulasData ?? []).filter(a => a.activo);

  const [aulaAEliminar, setAulaAEliminar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, validarForm,
  } = useAulaModal();

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(aulas)) return;

    if (modoEdicion && idEditando !== null) {
      setAulas(prev =>
        (prev ?? []).map(a =>
          a.id === idEditando
            ? { ...a, nombre: form.nombre, capacidad: Number(form.capacidad) }
            : a
        )
      );
      cerrarModal();
      mostrarToast(TOAST.AULA_MODIFICADA);
    } else {
      const nuevoId = (aulasData ?? []).length > 0 ? Math.max(...(aulasData ?? []).map(a => a.id)) + 1 : 1;
      setAulas(prev => [...(prev ?? []), { id: nuevoId, nombre: form.nombre, capacidad: Number(form.capacidad), activo: true }]);
      cerrarModal();
      mostrarToast(TOAST.AULA_CREADA);
    }
  };

  // ── Eliminar (baja lógica) ────────────────────────────────────────────────

  const handleEliminar = () => {
    if (aulaAEliminar === null) return;
    setAulas(prev => (prev ?? []).map(a => a.id === aulaAEliminar ? { ...a, activo: false } : a));
    setAulaAEliminar(null);
    mostrarToast(TOAST.AULA_ELIMINADA);
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
            Gestión de Aulas
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administra las aulas disponibles en el sistema.
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nueva Aula
        </button>
      </div>

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'} en total
      </p>

      {/* Listado */}
      {aulas.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No hay aulas registradas.
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Nombre</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Capacidad</th>
                  <th className="w-full"></th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {aulas.map(aula => (
                  <tr key={aula.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{aula.nombre}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{aula.capacidad} estudiantes</td>
                    <td></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-xs">
                        <button
                          onClick={() => abrirModalEdicion(aula)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                        </button>
                        <button
                          onClick={() => setAulaAEliminar(aula.id)}
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
                {aulas.length} {aulas.length === 1 ? 'aula' : 'aulas'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {aulas.map(aula => (
              <div
                key={aula.id}
                className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-body text-body-sm text-on-surface font-medium">{aula.nombre}</p>
                  <span className="font-body text-xs text-on-surface-variant">{aula.capacidad} estudiantes</span>
                </div>
                <div className="flex items-center gap-xs flex-wrap shrink-0">
                  <button
                    onClick={() => abrirModalEdicion(aula)}
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                  </button>
                  <button
                    onClick={() => setAulaAEliminar(aula.id)}
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
        <AulaModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {aulaAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Aula"
          mensaje="¿Estás seguro de que querés eliminar esta aula? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setAulaAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionAulas;
