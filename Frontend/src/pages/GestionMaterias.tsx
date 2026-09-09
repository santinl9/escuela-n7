import { useState, useRef, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useMateriaModal } from '../hooks/useMateriaModal';
import { useToast } from '../hooks/useToast';
import type { Materia } from '../types/Materia';
import { NIVELES_OPCIONES } from '../constants/materiaForm';
import MateriaModal from '../components/modals/MateriaModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';

function GestionMaterias() {
  const { data: materiasData, setData: setMaterias, loading, error } = useFetch<Materia[]>('/data/materias.json');
  const materias = (materiasData ?? []).filter(m => m.activo);

  const [materiaAEliminar, setMateriaAEliminar] = useState<number | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<number | ''>('');
  const [filtroNivelOpen, setFiltroNivelOpen] = useState(false);
  const filtroNivelRef = useRef<HTMLDivElement>(null);
  const { mostrarToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filtroNivelRef.current && !filtroNivelRef.current.contains(e.target as Node)) setFiltroNivelOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const seleccionarFiltroNivel = (valor: number | '') => {
    setFiltroNivel(valor);
    setFiltroNivelOpen(false);
  };

  const materiasFiltradas = materias
    .filter(m => filtroNivel === '' || m.nivel === filtroNivel)
    .sort((a, b) => a.nivel - b.nivel);

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, validarForm,
  } = useMateriaModal();

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(materias)) return;

    const curricular = form.curricular === 'Curricular';

    if (modoEdicion && idEditando !== null) {
      setMaterias(prev =>
        (prev ?? []).map(mat =>
          mat.id === idEditando
            ? { ...mat, nombre: form.nombre, nivel: Number(form.nivel), curricular }
            : mat
        )
      );
      cerrarModal();
      mostrarToast(TOAST.MATERIA_MODIFICADA);
    } else {
      const nuevoId = (materiasData ?? []).length > 0
        ? Math.max(...(materiasData ?? []).map(m => m.id)) + 1
        : 1;
      setMaterias(prev => [...(prev ?? []), { id: nuevoId, nombre: form.nombre, nivel: Number(form.nivel), activo: true, curricular }]);
      cerrarModal();
      mostrarToast(TOAST.MATERIA_CREADA);
    }
  };

  // ── Eliminar (baja lógica) ────────────────────────────────────────────────

  const handleEliminar = () => {
    if (materiaAEliminar === null) return;
    setMaterias(prev => (prev ?? []).map(mat => mat.id === materiaAEliminar ? { ...mat, activo: false } : mat));
    setMateriaAEliminar(null);
    mostrarToast(TOAST.MATERIA_ELIMINADA);
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
            Gestión de Materias
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administra las materias disponibles en el sistema.
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nueva Materia
        </button>
      </div>

      {/* Filtro por nivel — dropdown estilo MateriaModal */}
      <div className="-mt-4">
        <div ref={filtroNivelRef} className="relative inline-block w-full max-w-55">
          <button
            type="button"
            onClick={() => setFiltroNivelOpen(prev => !prev)}
            style={filtroNivel === '' ? { backgroundColor: 'var(--background)' } : undefined}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
              filtroNivel !== ''
                ? 'bg-secondary-container/80 text-on-secondary-container font-semibold border-transparent'
                : 'border-outline-variant'
            }`}
          >
            <span style={filtroNivel === '' ? { color: 'var(--on-surface-variant)' } : undefined}>
              {filtroNivel !== '' ? `${filtroNivel}° nivel` : 'Todos los niveles'}
            </span>
            <span className={`material-symbols-outlined text-[1.1rem] leading-none transition-transform duration-200 ${
              filtroNivel !== '' ? 'text-on-secondary-container' : 'text-on-surface-variant'
            } ${filtroNivelOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div
            className={`absolute z-10 w-full mt-1 bg-background border border-outline-variant rounded-lg shadow-md grid transition-all duration-300 ease-in-out ${filtroNivelOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <ul className="overflow-hidden">
              <li>
                <button
                  type="button"
                  onClick={() => seleccionarFiltroNivel('')}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                    filtroNivel === ''
                      ? 'bg-secondary-container text-on-secondary-container font-semibold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Todos los niveles
                </button>
              </li>
              {NIVELES_OPCIONES.map(n => (
                <li key={n}>
                  <button
                    type="button"
                    onClick={() => seleccionarFiltroNivel(n)}
                    className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                      filtroNivel === n
                        ? 'bg-secondary-container text-on-secondary-container font-semibold'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {n}° nivel
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {filtroNivel !== ''
          ? `${materiasFiltradas.length} de ${materias.length} ${materias.length === 1 ? 'materia' : 'materias'} encontrada${materiasFiltradas.length !== 1 ? 's' : ''}`
          : `${materias.length} ${materias.length === 1 ? 'materia' : 'materias'} en total`}
      </p>

      {/* Listado */}
      {materiasFiltradas.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          {filtroNivel !== ''
            ? 'No se encontraron materias para el nivel seleccionado.'
            : 'No hay materias registradas.'}
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="w-20 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Nivel</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant">Nombre</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Tipo</th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {materiasFiltradas.map(mat => (
                  <tr key={mat.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface">{mat.nivel}°</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface">{mat.nombre}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">
                      {mat.curricular ? 'Curricular' : 'Extracurricular'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-xs">
                        <button
                          onClick={() => abrirModalEdicion(mat)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                        </button>
                        <button
                          onClick={() => setMateriaAEliminar(mat.id)}
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
                {materiasFiltradas.length} {materiasFiltradas.length === 1 ? 'materia' : 'materias'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {materiasFiltradas.map(mat => (
              <div
                key={mat.id}
                className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                    {mat.nivel}°
                  </span>
                  <p className="font-body text-body-sm text-on-surface font-medium">{mat.nombre}</p>
                  <span className="font-body text-xs text-on-surface-variant">
                    {mat.curricular ? 'Curricular' : 'Extracurricular'}
                  </span>
                </div>
                <div className="flex items-center gap-xs flex-wrap shrink-0">
                  <button
                    onClick={() => abrirModalEdicion(mat)}
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                  </button>
                  <button
                    onClick={() => setMateriaAEliminar(mat.id)}
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
        <MateriaModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {materiaAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Materia"
          mensaje="¿Estás seguro de que querés eliminar esta materia? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setMateriaAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionMaterias;
