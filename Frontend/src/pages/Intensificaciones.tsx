import { Fragment, useEffect, useRef, useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useBusqueda } from '../hooks/useBusqueda';
import { nombreCurso, cursoEfectivoDe, type Curso } from '../types/Curso';
import type { Matricula } from '../types/Matricula';
import type { EstudianteListado } from '../types/EstudianteListado';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { Inscripcion } from '../types/Inscripcion';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import type { CargaIntensificacion } from '../types/CargaIntensificacion';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import EstadoCarga from '../components/elements/EstadoCarga';
import { diasHasta } from '../constants/fechas';
import { abreviarPeriodo } from '../constants/periodoCargaForm';
import { normalizarBusqueda as norm } from '../constants/normalizarTexto';

// Totalizadora de intensificaciones: misma idea que la Totalizadora de Cursadas (ver
// TotalizadoraCurso), pero solo con las inscripciones de tipo "Intensifica" de los
// matriculados del curso elegido, y con las columnas de los períodos de carga de tipo
// "Intensificacion" (no Numerica/Valorativa).
function Intensificaciones() {
  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: matriculasData, loading: loadingMatriculas, error: errorMatriculas } = useFetch<Matricula[]>('/data/matriculas.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: inscripcionesData, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { data: periodosData, loading: loadingPeriodos, error: errorPeriodos } = useFetch<PeriodoCarga[]>('/data/periodosCarga.json');
  const { data: cargasIntensificacionData, loading: loadingCI, error: errorCI } = useFetch<CargaIntensificacion[]>('/data/cargasIntensificacion.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');

  const cursos = cursosData ?? [];
  const estudiantes = estudiantesData ?? [];
  const cursadas = cursadasData ?? [];
  const materias = materiasData ?? [];
  const inscripciones = inscripcionesData ?? [];
  const periodos = periodosData ?? [];
  const cargasIntensificacion = cargasIntensificacionData ?? [];
  const ciclos = ciclosData ?? [];

  const cicloActual = cicloLectivoActual(ciclos);
  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';

  // ── Filtro por curso — dropdown estilo GestionCursos ─────────────────────────

  const [filtroCurso, setFiltroCurso] = useState<number | ''>('');
  const [filtroCursoOpen, setFiltroCursoOpen] = useState(false);
  const filtroCursoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filtroCursoRef.current && !filtroCursoRef.current.contains(e.target as Node)) setFiltroCursoOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const seleccionarFiltroCurso = (valor: number | '') => {
    setFiltroCurso(valor);
    setFiltroCursoOpen(false);
  };

  const cursosActivos = cursos.filter(c => c.activo).sort((a, b) => a.nivel - b.nivel || a.nombre.localeCompare(b.nombre));
  const cursoSeleccionado = filtroCurso !== '' ? cursos.find(c => c.id === filtroCurso) : undefined;

  // Solo los períodos de carga de tipo "Intensificacion" ya concluidos del ciclo lectivo
  // actual, del más antiguo al más reciente (mismo criterio que en Totalizadora de Cursadas).
  const periodosTabla = cicloActual
    ? periodos
        .filter(p => p.cicloLectivoId === cicloActual.id && p.tipo === 'Intensificacion' && diasHasta(p.fechaFin) < 0)
        .sort((a, b) => a.fechaIni.localeCompare(b.fechaIni))
    : [];

  const cargaDeEnPeriodo = (inscripcionId: number, periodo: PeriodoCarga): CargaIntensificacion | undefined =>
    cargasIntensificacion.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id);

  // Inscripciones tipo "Intensifica" del estudiante en el ciclo lectivo actual, con el
  // nombre de la materia y el curso donde efectivamente intensifica (ver cursadaIntensificacionId).
  const intensificacionesDelEstudiante = (dni: number) =>
    inscripciones
      .filter(i => {
        if (i.estudianteDni !== dni || i.tipo !== 'Intensifica') return false;
        const cursadaDeInscripcion = cursadas.find(c => c.id === i.cursadaId);
        return cursadaDeInscripcion?.cicloLectivoId === cicloActual?.id;
      })
      .map(inscripcion => {
        const cursadaIntensificacion = inscripcion.cursadaIntensificacionId
          ? cursadas.find(c => c.id === inscripcion.cursadaIntensificacionId)
          : undefined;
        return { inscripcion, cursadaIntensificacion };
      });

  // Un estudiante está matriculado al curso de la cursada de curso más alto a la que está
  // inscripto (ver cursoEfectivoDe): se recalcula siempre a partir de sus inscripciones
  // vigentes, no del cursoId guardado en Matricula (mismo criterio que en Totalizadora de Cursadas).
  // Por default se muestran los matriculados de todos los cursos (mismo criterio que en Mis
  // Cursadas); el filtro por curso solo acota el listado cuando se elige uno puntual.
  const matriculados = (matriculasData ?? [])
    .map(m => ({ matricula: m, curso: cursoEfectivoDe(m.estudianteDni, inscripciones, cursadas, cursos, cicloActual?.id) }))
    .filter((x): x is { matricula: Matricula; curso: Curso } => x.curso !== undefined)
    .filter(({ curso }) => filtroCurso === '' || curso.id === filtroCurso)
    .map(({ matricula, curso }) => ({ matricula, curso, estudiante: estudiantes.find(e => e.dni === matricula.estudianteDni) }))
    .filter((x): x is { matricula: Matricula; curso: Curso; estudiante: EstudianteListado } => x.estudiante !== undefined)
    // Solo interesan a esta pantalla los matriculados con al menos una inscripción de intensificación.
    .filter(({ estudiante }) => intensificacionesDelEstudiante(estudiante.dni).length > 0)
    .sort((a, b) => a.estudiante.apellido.localeCompare(b.estudiante.apellido));

  const { busquedaMatriculados, setBusquedaMatriculados } = useBusqueda();
  const matriculadosFiltrados = matriculados.filter(({ estudiante }) =>
    norm(`${estudiante.apellido} ${estudiante.nombre}`).includes(norm(busquedaMatriculados))
  );

  const cantColumnasNotas = periodosTabla.length === 0 ? 1 : periodosTabla.length;

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingMatriculas || loadingEstudiantes || loadingCursadas || loadingMaterias
    || loadingInscripciones || loadingPeriodos || loadingCI || loadingCiclos;
  const conError = errorCursos || errorMatriculas || errorEstudiantes || errorCursadas || errorMaterias
    || errorInscripciones || errorPeriodos || errorCI || errorCiclos;
  if (cargando || conError) return <EstadoCarga loading={cargando} error={conError} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div>
        <h1 className="font-headline text-headline-md font-bold text-on-surface">
          Intensificaciones
        </h1>
        <p className="font-body text-body-sm text-on-surface-variant mt-1">
          Notas por período de carga de las inscripciones de intensificación de los matriculados
          {cursoSeleccionado ? ` de ${nombreCurso(cursoSeleccionado)}` : ''}
          {cicloActual ? `, ciclo lectivo ${nombreCicloLectivo(cicloActual)}` : ''}.
        </p>
      </div>

      {/* Filtro por curso */}
      <div ref={filtroCursoRef} className="relative inline-block w-full max-w-55">
        <button
          type="button"
          onClick={() => setFiltroCursoOpen(prev => !prev)}
          style={filtroCurso === '' ? { backgroundColor: 'var(--background)' } : undefined}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
            filtroCurso !== ''
              ? 'bg-secondary-container/80 text-on-secondary-container font-semibold border-transparent'
              : 'border-outline-variant'
          }`}
        >
          <span style={filtroCurso === '' ? { color: 'var(--on-surface-variant)' } : undefined}>
            {cursoSeleccionado ? nombreCurso(cursoSeleccionado) : 'Todos los cursos'}
          </span>
          <span className={`material-symbols-outlined text-[1.1rem] leading-none transition-transform duration-200 ${
            filtroCurso !== '' ? 'text-on-secondary-container' : 'text-on-surface-variant'
          } ${filtroCursoOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <div
          className={`absolute z-10 w-full mt-1 bg-background border border-outline-variant rounded-lg shadow-md grid transition-all duration-300 ease-in-out ${filtroCursoOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <ul className="overflow-hidden max-h-60 overflow-y-auto scrollbar-custom">
            <li>
              <button
                type="button"
                onClick={() => seleccionarFiltroCurso('')}
                className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                  filtroCurso === ''
                    ? 'bg-secondary-container text-on-secondary-container font-semibold'
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Todos los cursos
              </button>
            </li>
            {cursosActivos.map(curso => (
              <li key={curso.id}>
                <button
                  type="button"
                  onClick={() => seleccionarFiltroCurso(curso.id)}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                    filtroCurso === curso.id
                      ? 'bg-secondary-container text-on-secondary-container font-semibold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {nombreCurso(curso)}
                </button>
              </li>
            ))}
          </ul>
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
              : `${matriculados.length} ${matriculados.length === 1 ? 'matriculado' : 'matriculados'} con intensificación`}
          </p>

          {/* Listado */}
          {matriculados.length === 0 ? (
            <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
              {cursoSeleccionado
                ? `${nombreCurso(cursoSeleccionado)} no tiene matriculados con inscripciones de intensificación este ciclo lectivo.`
                : 'No hay matriculados con inscripciones de intensificación este ciclo lectivo.'}
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
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estudiante / Materia</th>
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">DNI</th>
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Curso</th>
                      {periodosTabla.length === 0 ? (
                        <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Notas</th>
                      ) : (
                        periodosTabla.map(periodo => (
                          <th key={periodo.id} className="text-left px-2 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">
                            {abreviarPeriodo(periodo.descripcion)}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {matriculadosFiltrados.map(({ estudiante, curso }) => (
                      <Fragment key={estudiante.id}>
                        <tr className="bg-surface-container/60">
                          <td className="px-4 py-3 font-body text-body-sm text-on-surface font-semibold whitespace-nowrap">
                            {estudiante.apellido}, {estudiante.nombre}
                          </td>
                          <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{estudiante.dni}</td>
                          <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{nombreCurso(curso)}</td>
                          <td colSpan={cantColumnasNotas}></td>
                        </tr>
                        {intensificacionesDelEstudiante(estudiante.dni).map(({ inscripcion, cursadaIntensificacion }) => {
                          const cursoIntensificacion = cursadaIntensificacion
                            ? cursos.find(c => c.id === cursadaIntensificacion.cursoId)
                            : undefined;
                          return (
                            <tr key={inscripcion.id} className="hover:bg-surface-container-high transition-colors duration-150">
                              <td className="px-4 py-3 pl-8 font-body text-body-sm text-on-surface whitespace-nowrap">
                                {cursadaIntensificacion ? nombreMateria(cursadaIntensificacion.materiaId) : '—'}
                                {cursoIntensificacion && (
                                  <span className="text-on-surface-variant"> · {nombreCurso(cursoIntensificacion)}</span>
                                )}
                              </td>
                              <td></td>
                              <td></td>
                              {periodosTabla.length === 0 ? (
                                <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">—</td>
                              ) : (
                                periodosTabla.map(periodo => (
                                  <td key={periodo.id} className="px-2 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">
                                    {cargaDeEnPeriodo(inscripcion.id, periodo)?.calificacionFinal ?? '—'}
                                  </td>
                                ))
                              )}
                            </tr>
                          );
                        })}
                      </Fragment>
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
                {matriculadosFiltrados.map(({ estudiante, curso }) => (
                  <div
                    key={estudiante.id}
                    className="bg-background rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3"
                  >
                    <div>
                      <p className="font-body text-body-sm text-on-surface font-medium">{estudiante.apellido}, {estudiante.nombre}</p>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {estudiante.dni} · {nombreCurso(curso)}</p>
                    </div>
                    {intensificacionesDelEstudiante(estudiante.dni).map(({ inscripcion, cursadaIntensificacion }) => {
                      const cursoIntensificacion = cursadaIntensificacion
                        ? cursos.find(c => c.id === cursadaIntensificacion.cursoId)
                        : undefined;
                      return (
                        <div key={inscripcion.id} className="border-t border-outline-variant pt-3 flex flex-col gap-1.5">
                          <p className="font-body text-xs text-on-surface font-medium">
                            {cursadaIntensificacion ? nombreMateria(cursadaIntensificacion.materiaId) : '—'}
                            {cursoIntensificacion && ` · ${nombreCurso(cursoIntensificacion)}`}
                          </p>
                          {periodosTabla.length === 0 ? (
                            <span className="font-body text-xs text-on-surface-variant">Sin notas cargadas</span>
                          ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                              {periodosTabla.map(periodo => (
                                <span key={periodo.id} className="flex flex-col items-start leading-tight">
                                  <span className="text-[10px] uppercase tracking-wide text-on-surface-variant/70">
                                    {abreviarPeriodo(periodo.descripcion)}
                                  </span>
                                  <span className="font-medium text-on-surface text-xs">
                                    {cargaDeEnPeriodo(inscripcion.id, periodo)?.calificacionFinal ?? '—'}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

    </div>
  );
}

export default Intensificaciones;
