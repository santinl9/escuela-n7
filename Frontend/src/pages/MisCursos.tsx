import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { nombreCurso, type Curso } from '../types/Curso';
import type { Orientacion } from '../types/Orientacion';
import { turnoLabel } from '../constants/cursoForm';
import EstadoCarga from '../components/elements/EstadoCarga';

// Vista de solo lectura: no permite crear, editar ni eliminar cursos.
function MisCursos() {
  const navigate = useNavigate();
  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: orientacionesData, loading: loadingOrientaciones, error: errorOrientaciones } = useFetch<Orientacion[]>('/data/orientaciones.json');

  const cursos = (cursosData ?? []).filter(c => c.activo);
  const orientaciones = orientacionesData ?? [];

  const nombreOrientacion = (orientacionId?: number): string | undefined =>
    orientacionId !== undefined ? orientaciones.find(e => e.id === orientacionId)?.nombre : undefined;

  // ── Estados de carga ──────────────────────────────────────────────────────

  const loading = loadingCursos || loadingOrientaciones;
  const error = errorCursos || errorOrientaciones;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div>
        <h1 className="font-headline text-headline-md font-bold text-on-surface">
          Mis Cursos
        </h1>
        <p className="font-body text-body-sm text-on-surface-variant mt-1">
          Listado de todos los cursos del sistema.
        </p>
      </div>

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'} en total
      </p>

      {/* Listado */}
      {cursos.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No hay cursos registrados.
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
                {cursos.map(curso => (
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
                      <button
                        onClick={() => navigate(`/seguimiento-evaluacion/mis-cursos/${curso.id}`)}
                        title="Ver matriculados"
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="px-md py-sm bg-surface-container border-t border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {cursos.map(curso => (
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
                <button
                  onClick={() => navigate(`/seguimiento-evaluacion/mis-cursos/${curso.id}`)}
                  title="Ver matriculados"
                  className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 shrink-0"
                >
                  <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

export default MisCursos;
