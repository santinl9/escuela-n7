import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useBusqueda } from '../hooks/useBusqueda';
import { nombreCurso, cursoEfectivoDe, type Curso } from '../types/Curso';
import type { Matricula } from '../types/Matricula';
import type { EstudianteListado } from '../types/EstudianteListado';
import type { Inscripcion } from '../types/Inscripcion';
import type { Cursada } from '../types/Cursada';
import { cicloLectivoActual, type CicloLectivo } from '../types/CicloLectivo';
import EstadoBadge from '../components/elements/EstadoBadge';
import EstadoCarga from '../components/elements/EstadoCarga';
import { formatFecha } from '../constants/fechas';
import { normalizarBusqueda as norm } from '../constants/normalizarTexto';

function MatriculadosCurso() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: matriculasData, loading: loadingMatriculas, error: errorMatriculas } = useFetch<Matricula[]>('/data/matriculas.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: inscripcionesData, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');

  const curso = (cursosData ?? []).find(c => String(c.id) === id);
  const estudiantes = estudiantesData ?? [];
  const cursadas = cursadasData ?? [];
  const inscripciones = inscripcionesData ?? [];
  const cursos = cursosData ?? [];
  const cicloActual = cicloLectivoActual(ciclosData ?? []);

  // Un estudiante está matriculado al curso de la cursada de curso más alto a la que está
  // inscripto (ver cursoEfectivoDe): se recalcula a partir de sus inscripciones vigentes,
  // no del cursoId guardado en Matricula, para no arrastrar una matrícula de un ciclo
  // lectivo ya cerrado.
  const matriculados = (matriculasData ?? [])
    .filter(m => curso !== undefined && cursoEfectivoDe(m.estudianteDni, inscripciones, cursadas, cursos, cicloActual?.id)?.id === curso.id)
    .map(m => ({ matricula: m, estudiante: estudiantes.find(e => e.dni === m.estudianteDni) }))
    .filter((x): x is { matricula: Matricula; estudiante: EstudianteListado } => x.estudiante !== undefined)
    .sort((a, b) => a.estudiante.apellido.localeCompare(b.estudiante.apellido));

  const { busquedaMatriculados, setBusquedaMatriculados } = useBusqueda();
  const matriculadosFiltrados = matriculados.filter(({ estudiante }) =>
    norm(`${estudiante.apellido} ${estudiante.nombre}`).includes(norm(busquedaMatriculados))
  );

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingMatriculas || loadingEstudiantes
    || loadingCursadas || loadingInscripciones || loadingCiclos;
  const conError = errorCursos || errorMatriculas || errorEstudiantes
    || errorCursadas || errorInscripciones || errorCiclos;
  if (cargando || conError) return <EstadoCarga loading={cargando} error={conError} />;

  if (!curso) {
    return (
      <div className="flex flex-col gap-6">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer self-start flex items-center gap-sm px-3 py-1.5 text-on-surface-variant font-label text-label-md rounded-lg hover:bg-surface-container-high transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-[1.25rem]">arrow_back</span>
          Volver
        </button>
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">Curso no encontrado</h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            No existe un curso con el id {id}.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate(-1)}
          className="cursor-pointer self-start flex items-center gap-xs px-3 py-1.5 text-on-surface-variant font-label text-label-md rounded-lg hover:bg-surface-container-high transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-[1.25rem]">arrow_back</span>
          Volver
        </button>

        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Estudiantes Matriculados de {nombreCurso(curso)}
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Estudiantes cuya matrícula actual corresponde a este curso.
          </p>
        </div>
      </div>

      {/* Buscador */}
      {matriculados.length > 0 && (
        <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              fontSize: '20px',
              color: 'var(--on-surface-variant)',
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="text"
            value={busquedaMatriculados}
            onChange={(e) => setBusquedaMatriculados(e.target.value)}
            placeholder="Buscar por nombre o apellido..."
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              paddingTop: '8px',
              paddingBottom: '8px',
              paddingLeft: '44px',
              paddingRight: '16px',
              color: 'var(--on-surface)',
              backgroundColor: 'var(--surface-container)',
              border: '1px solid var(--outline-variant)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {busquedaMatriculados
          ? `${matriculadosFiltrados.length} de ${matriculados.length} ${matriculados.length === 1 ? 'matriculado' : 'matriculados'} encontrado${matriculadosFiltrados.length !== 1 ? 's' : ''}`
          : `${matriculados.length} ${matriculados.length === 1 ? 'matriculado' : 'matriculados'} en total`}
      </p>

      {/* Listado */}
      {matriculados.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Este curso todavía no tiene estudiantes matriculados.
        </div>
      ) : matriculadosFiltrados.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No se encontraron matriculados que coincidan con la búsqueda.
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estudiante</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">DNI</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estado</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Fecha de matriculación</th>
                  <th className="w-16 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {matriculadosFiltrados.map(({ matricula, estudiante }) => (
                  <tr key={matricula.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{estudiante.apellido}, {estudiante.nombre}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{estudiante.dni}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={estudiante.estado} />
                    </td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{formatFecha(matricula.fecha)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/matriculados/${estudiante.id}`)}
                        title="Ver detalle"
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
                {matriculadosFiltrados.length} {matriculadosFiltrados.length === 1 ? 'matriculado' : 'matriculados'}
                {busquedaMatriculados && ` encontrado${matriculadosFiltrados.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {matriculadosFiltrados.map(({ matricula, estudiante }) => (
              <div
                key={matricula.id}
                className="bg-background rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-body text-body-sm text-on-surface font-medium">{estudiante.apellido}, {estudiante.nombre}</p>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {estudiante.dni}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <EstadoBadge estado={estudiante.estado} />
                    <button
                      onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/matriculados/${estudiante.id}`)}
                      title="Ver detalle"
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                    </button>
                  </div>
                </div>
                <div className="border-t border-outline-variant pt-3 font-body text-xs text-on-surface-variant">
                  Matriculado el {formatFecha(matricula.fecha)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

export default MatriculadosCurso;
