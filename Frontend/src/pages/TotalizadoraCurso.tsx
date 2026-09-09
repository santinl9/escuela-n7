import { Fragment } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useBusqueda } from '../hooks/useBusqueda';
import { nombreCurso, cursoEfectivoDe, type Curso } from '../types/Curso';
import type { Matricula } from '../types/Matricula';
import type { EstudianteListado } from '../types/EstudianteListado';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { Inscripcion } from '../types/Inscripcion';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import type { CargaNumerica } from '../types/CargaNumerica';
import type { CargaValorativa } from '../types/CargaValorativa';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import EstadoCarga from '../components/elements/EstadoCarga';
import { diasHasta } from '../constants/fechas';
import { abreviarPeriodo } from '../constants/periodoCargaForm';
import { normalizarBusqueda as norm } from '../constants/normalizarTexto';

// Totalizadora: por cada matriculado, sus cursadas de ESTE curso (no las que tenga en otros
// cursos por recupera/intensifica) con la nota de cada período de carga, una al lado de la otra.
function TotalizadoraCurso() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: matriculasData, loading: loadingMatriculas, error: errorMatriculas } = useFetch<Matricula[]>('/data/matriculas.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: inscripcionesData, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { data: periodosData, loading: loadingPeriodos, error: errorPeriodos } = useFetch<PeriodoCarga[]>('/data/periodosCarga.json');
  const { data: cargasNumericasData, loading: loadingCN, error: errorCN } = useFetch<CargaNumerica[]>('/data/cargasNumericas.json');
  const { data: cargasValorativasData, loading: loadingCV, error: errorCV } = useFetch<CargaValorativa[]>('/data/cargasValorativas.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');

  const curso = (cursosData ?? []).find(c => String(c.id) === id);
  const estudiantes = estudiantesData ?? [];
  const cursadas = cursadasData ?? [];
  const materias = materiasData ?? [];
  const inscripciones = inscripcionesData ?? [];
  const periodos = periodosData ?? [];
  const cargasNumericas = cargasNumericasData ?? [];
  const cargasValorativas = cargasValorativasData ?? [];
  const ciclos = ciclosData ?? [];

  const cicloActual = cicloLectivoActual(ciclos);
  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';

  // Solo las cursadas de este curso (no las de otros cursos por recupera/intensifica) del
  // ciclo lectivo actual: los períodos de carga son por ciclo, así que mezclar ciclos
  // desalinearía las columnas.
  const cursadasDelCurso = curso && cicloActual
    ? cursadas.filter(c => c.cursoId === curso.id && c.cicloLectivoId === cicloActual.id)
    : [];

  // Mismas columnas que en Inscripciones de Cursada: solo períodos ya concluidos del ciclo
  // actual, del más antiguo al más reciente.
  const periodosTabla = cicloActual
    ? periodos
        .filter(p => p.cicloLectivoId === cicloActual.id && diasHasta(p.fechaFin) < 0)
        .sort((a, b) => a.fechaIni.localeCompare(b.fechaIni))
    : [];

  const cargaDeEnPeriodo = (inscripcionId: number, periodo: PeriodoCarga): CargaValorativa | CargaNumerica | undefined =>
    periodo.tipo === 'Numerica'
      ? cargasNumericas.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id)
      : cargasValorativas.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id);

  // Cursadas de este curso a las que el estudiante está inscripto, con su inscripción.
  const cursadasDelEstudiante = (dni: number) =>
    cursadasDelCurso
      .map(cursada => ({ cursada, inscripcion: inscripciones.find(i => i.cursadaId === cursada.id && i.estudianteDni === dni) }))
      .filter((x): x is { cursada: Cursada; inscripcion: Inscripcion } => x.inscripcion !== undefined);

  // Un estudiante está matriculado al curso de la cursada de curso más alto a la que está
  // inscripto (ver cursoEfectivoDe): se recalcula siempre a partir de sus inscripciones
  // vigentes, no del cursoId guardado en Matricula, para no arrastrar una matrícula de un
  // ciclo lectivo ya cerrado (p.ej. un estudiante "Libre" el año pasado sin inscripción
  // nueva este año no está matriculado en ningún curso hoy, y no debería figurar acá).
  const matriculados = (matriculasData ?? [])
    .filter(m => curso !== undefined && cursoEfectivoDe(m.estudianteDni, inscripciones, cursadas, cursosData ?? [], cicloActual?.id)?.id === curso.id)
    .map(m => ({ matricula: m, estudiante: estudiantes.find(e => e.dni === m.estudianteDni) }))
    .filter((x): x is { matricula: Matricula; estudiante: EstudianteListado } => x.estudiante !== undefined)
    .sort((a, b) => a.estudiante.apellido.localeCompare(b.estudiante.apellido));

  const { busquedaMatriculados, setBusquedaMatriculados } = useBusqueda();
  const matriculadosFiltrados = matriculados.filter(({ estudiante }) =>
    norm(`${estudiante.apellido} ${estudiante.nombre}`).includes(norm(busquedaMatriculados))
  );

  const cantColumnasNotas = periodosTabla.length === 0 ? 1 : periodosTabla.length;

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingMatriculas || loadingEstudiantes || loadingCursadas || loadingMaterias
    || loadingInscripciones || loadingPeriodos || loadingCN || loadingCV || loadingCiclos;
  const conError = errorCursos || errorMatriculas || errorEstudiantes || errorCursadas || errorMaterias
    || errorInscripciones || errorPeriodos || errorCN || errorCV || errorCiclos;
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
            Totalizadora — {nombreCurso(curso)}
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Notas por período de carga de cada cursada de este curso{cicloActual ? `, ciclo lectivo ${nombreCicloLectivo(cicloActual)}` : ''}.
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
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estudiante / Cursada</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">DNI</th>
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
                {matriculadosFiltrados.map(({ estudiante }) => (
                  <Fragment key={estudiante.id}>
                    <tr className="bg-surface-container/60">
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface font-semibold whitespace-nowrap">
                        {estudiante.apellido}, {estudiante.nombre}
                      </td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{estudiante.dni}</td>
                      <td colSpan={cantColumnasNotas}></td>
                    </tr>
                    {cursadasDelEstudiante(estudiante.dni).map(({ cursada, inscripcion }) => (
                      <tr key={cursada.id} className="hover:bg-surface-container-high transition-colors duration-150">
                        <td className="px-4 py-3 pl-8 font-body text-body-sm text-on-surface whitespace-nowrap">
                          {nombreMateria(cursada.materiaId)}
                        </td>
                        <td></td>
                        {periodosTabla.length === 0 ? (
                          <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">—</td>
                        ) : (
                          periodosTabla.map(periodo => (
                            <td key={periodo.id} className="px-2 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">
                              {cargaDeEnPeriodo(inscripcion.id, periodo)?.calificacion ?? '—'}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
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
            {matriculadosFiltrados.map(({ estudiante }) => {
              return (
                <div
                  key={estudiante.id}
                  className="bg-background rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3"
                >
                  <div>
                    <p className="font-body text-body-sm text-on-surface font-medium">{estudiante.apellido}, {estudiante.nombre}</p>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {estudiante.dni}</p>
                  </div>
                  {cursadasDelEstudiante(estudiante.dni).map(({ cursada, inscripcion }) => (
                    <div key={cursada.id} className="border-t border-outline-variant pt-3 flex flex-col gap-1.5">
                      <p className="font-body text-xs text-on-surface font-medium">{nombreMateria(cursada.materiaId)}</p>
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
                                {cargaDeEnPeriodo(inscripcion.id, periodo)?.calificacion ?? '—'}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}

export default TotalizadoraCurso;
