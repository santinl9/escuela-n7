import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useCursoModal } from '../hooks/useCursoModal';
import { useToast } from '../hooks/useToast';
import { nombreCurso, type Curso, type Turno } from '../types/Curso';
import type { Orientacion } from '../types/Orientacion';
import { NIVELES_OPCIONES, turnoLabel } from '../constants/cursoForm';
import CursoModal from '../components/modals/CursoModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';

function GestionCursos() {
  const navigate = useNavigate();
  const { data: cursosData, setData: setCursos, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: orientacionesData, loading: loadingOrientaciones, error: errorOrientaciones } = useFetch<Orientacion[]>('/data/orientaciones.json');
  const cursos = (cursosData ?? []).filter(c => c.activo);
  const orientaciones = orientacionesData ?? [];

  const [cursoAEliminar, setCursoAEliminar] = useState<number | null>(null);
  const [filtroNivel, setFiltroNivel] = useState<number | ''>('');
  const [filtroNivelOpen, setFiltroNivelOpen] = useState(false);
  const filtroNivelRef = useRef<HTMLDivElement>(null);
  const [filtroOrientacion, setFiltroOrientacion] = useState<number | ''>('');
  const [filtroOrientacionOpen, setFiltroOrientacionOpen] = useState(false);
  const filtroOrientacionRef = useRef<HTMLDivElement>(null);
  const { mostrarToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filtroNivelRef.current && !filtroNivelRef.current.contains(e.target as Node)) setFiltroNivelOpen(false);
      if (filtroOrientacionRef.current && !filtroOrientacionRef.current.contains(e.target as Node)) setFiltroOrientacionOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const seleccionarFiltroNivel = (valor: number | '') => {
    setFiltroNivel(valor);
    setFiltroNivelOpen(false);
  };

  const seleccionarFiltroOrientacion = (valor: number | '') => {
    setFiltroOrientacion(valor);
    setFiltroOrientacionOpen(false);
  };

  const nombreOrientacion = (orientacionId?: number): string | undefined =>
    orientacionId !== undefined ? orientaciones.find(e => e.id === orientacionId)?.nombre : undefined;

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, validarForm,
  } = useCursoModal();

  const cursosFiltrados = cursos.filter(c =>
    (filtroNivel === '' || c.nivel === filtroNivel) &&
    (filtroOrientacion === '' || c.orientacionId === filtroOrientacion)
  );
  const hayFiltrosActivos = filtroNivel !== '' || filtroOrientacion !== '';

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(cursos)) return;

    // Solo los cursos de 4to a 6to año llevan orientación; para el resto queda sin definir.
    const nivel = Number(form.nivel);
    const orientacionId = nivel >= 4 && nivel <= 6 && form.orientacionId
      ? Number(form.orientacionId)
      : undefined;

    if (modoEdicion && idEditando !== null) {
      setCursos(prev =>
        (prev ?? []).map(c =>
          c.id === idEditando
            ? { ...c, nivel, nombre: form.nombre, turno: form.turno as Turno, orientacionId }
            : c
        )
      );
      cerrarModal();
      mostrarToast(TOAST.CURSO_MODIFICADO);
    } else {
      const nuevoId = (cursosData ?? []).length > 0 ? Math.max(...(cursosData ?? []).map(c => c.id)) + 1 : 1;
      setCursos(prev => [...(prev ?? []), { id: nuevoId, nivel, nombre: form.nombre, turno: form.turno as Turno, activo: true, orientacionId }]);
      cerrarModal();
      mostrarToast(TOAST.CURSO_CREADO);
    }
  };

  // ── Eliminar (baja lógica) ────────────────────────────────────────────────

  const handleEliminar = () => {
    if (cursoAEliminar === null) return;
    setCursos(prev => (prev ?? []).map(c => c.id === cursoAEliminar ? { ...c, activo: false } : c));
    setCursoAEliminar(null);
    mostrarToast(TOAST.CURSO_ELIMINADO);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const loading = loadingCursos || loadingOrientaciones;
  const error = errorCursos || errorOrientaciones;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Gestión de Cursos
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administra los cursos disponibles en el sistema.
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nuevo Curso
        </button>
      </div>

      {/* Filtros por nivel y orientación — dropdowns estilo MateriaModal */}
      <div className="-mt-4 flex flex-wrap items-start gap-3">
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

        {/* Filtro por orientación — solo aplica a cursos de 4to a 6to año */}
        <div ref={filtroOrientacionRef} className="relative inline-block w-full max-w-55">
          <button
            type="button"
            onClick={() => setFiltroOrientacionOpen(prev => !prev)}
            style={filtroOrientacion === '' ? { backgroundColor: 'var(--background)' } : undefined}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
              filtroOrientacion !== ''
                ? 'bg-secondary-container/80 text-on-secondary-container font-semibold border-transparent'
                : 'border-outline-variant'
            }`}
          >
            <span style={filtroOrientacion === '' ? { color: 'var(--on-surface-variant)' } : undefined}>
              {filtroOrientacion !== '' ? nombreOrientacion(filtroOrientacion) : 'Todas las orientaciones'}
            </span>
            <span className={`material-symbols-outlined text-[1.1rem] leading-none transition-transform duration-200 ${
              filtroOrientacion !== '' ? 'text-on-secondary-container' : 'text-on-surface-variant'
            } ${filtroOrientacionOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div
            className={`absolute z-10 w-full mt-1 bg-background border border-outline-variant rounded-lg shadow-md grid transition-all duration-300 ease-in-out ${filtroOrientacionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <ul className="overflow-hidden">
              <li>
                <button
                  type="button"
                  onClick={() => seleccionarFiltroOrientacion('')}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                    filtroOrientacion === ''
                      ? 'bg-secondary-container text-on-secondary-container font-semibold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Todas las orientaciones
                </button>
              </li>
              {orientaciones.map(esp => (
                <li key={esp.id}>
                  <button
                    type="button"
                    onClick={() => seleccionarFiltroOrientacion(esp.id)}
                    className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                      filtroOrientacion === esp.id
                        ? 'bg-secondary-container text-on-secondary-container font-semibold'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {esp.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {hayFiltrosActivos
          ? `${cursosFiltrados.length} de ${cursos.length} ${cursos.length === 1 ? 'curso' : 'cursos'} encontrado${cursosFiltrados.length !== 1 ? 's' : ''}`
          : `${cursos.length} ${cursos.length === 1 ? 'curso' : 'cursos'} en total`}
      </p>

      {/* Listado */}
      {cursosFiltrados.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          {hayFiltrosActivos
            ? 'No se encontraron cursos para los filtros seleccionados.'
            : 'No hay cursos registrados.'}
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Curso</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Turno</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Orientación</th>
                  <th className="w-full"></th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {cursosFiltrados.map(curso => (
                  <tr key={curso.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{nombreCurso(curso)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                        {turnoLabel(curso.turno)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">
                      {nombreOrientacion(curso.orientacionId) ?? '—'}
                    </td>
                    <td></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-xs">
                        <button
                          onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/cursadas`)}
                          title="Ver detalle"
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                        </button>
                        <button
                          onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/matriculados`)}
                          title="Ver matriculados"
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">groups</span>
                        </button>
                        <button
                          onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/totalizadora`)}
                          title="Totalizadora"
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">title</span>
                        </button>
                        <button
                          onClick={() => abrirModalEdicion(curso)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                        </button>
                        <button
                          onClick={() => setCursoAEliminar(curso.id)}
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
                {cursosFiltrados.length} {cursosFiltrados.length === 1 ? 'curso' : 'cursos'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {cursosFiltrados.map(curso => (
              <div
                key={curso.id}
                className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-body text-body-sm text-on-surface font-medium">{nombreCurso(curso)}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                    {turnoLabel(curso.turno)}
                  </span>
                  {nombreOrientacion(curso.orientacionId) && (
                    <span className="font-body text-xs text-on-surface-variant">{nombreOrientacion(curso.orientacionId)}</span>
                  )}
                </div>
                <div className="flex items-center gap-xs flex-wrap shrink-0">
                  <button
                    onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/cursadas`)}
                    title="Ver detalle"
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                  </button>
                  <button
                    onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/matriculados`)}
                    title="Ver matriculados"
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">groups</span>
                  </button>
                  <button
                    onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/totalizadora`)}
                    title="Totalizadora"
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">title</span>
                  </button>
                  <button
                    onClick={() => abrirModalEdicion(curso)}
                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                  </button>
                  <button
                    onClick={() => setCursoAEliminar(curso.id)}
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
        <CursoModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          orientacionOpciones={orientaciones}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {cursoAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Curso"
          mensaje="¿Estás seguro de que querés eliminar este curso? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setCursoAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionCursos;
