import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useCicloLectivo } from '../hooks/useCicloLectivo';
import { nombreCurso, type Curso } from '../types/Curso';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { Aula } from '../types/Aula';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import { nombreBloqueHorario, type BloqueHorario } from '../types/BloqueHorario';
import { DIAS_SEMANA_OPCIONES } from '../constants/bloqueHorarioForm';
import EstadoCarga from '../components/elements/EstadoCarga';

function GestionCursadas() {
  const navigate = useNavigate();
  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: aulasData, loading: loadingAulas, error: errorAulas } = useFetch<Aula[]>('/data/aulas.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { data: bloquesData, loading: loadingBloques, error: errorBloques } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');

  const cursos = cursosData ?? [];
  const materias = materiasData ?? [];
  const aulas = aulasData ?? [];
  const ciclos = ciclosData ?? [];
  const bloques = bloquesData ?? [];

  // El ciclo activo de esta sesión (ver CicloLectivoContext).
  const { cicloLectivoActivoId } = useCicloLectivo();
  const cicloActivo = ciclos.find(c => c.id === cicloLectivoActivoId);
  const esCicloActual = cicloActivo !== undefined && cicloActivo.id === cicloLectivoActual(ciclos)?.id;

  const cursadasDelCiclo = (cursadasData ?? []).filter(c => c.cicloLectivoId === cicloActivo?.id);

  const nombreCursoDe = (cursoId: number) => {
    const curso = cursos.find(c => c.id === cursoId);
    return curso ? nombreCurso(curso) : '—';
  };
  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';
  const nombreAula = (aulaId: number) => aulas.find(a => a.id === aulaId)?.nombre ?? '—';

  // ── Filtro por curso — dropdown estilo GestionCursos: permite consultar las cursadas
  // (y las intensificaciones que se dan dentro de ellas) por curso en vez de recorrer
  // el listado completo. ────────────────────────────────────────────────────────────

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

  const cursadas = cursadasDelCiclo.filter(c => filtroCurso === '' || c.cursoId === filtroCurso);

  const bloquesDeCursada = (cursadaId: number) =>
    bloques
      .filter(b => b.cursadaId === cursadaId)
      .sort((a, b) => {
        const diffDia = DIAS_SEMANA_OPCIONES.indexOf(a.dia) - DIAS_SEMANA_OPCIONES.indexOf(b.dia);
        return diffDia !== 0 ? diffDia : a.horaIni.localeCompare(b.horaIni);
      });

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingCursadas || loadingMaterias || loadingAulas || loadingCiclos || loadingBloques;
  const conError = errorCursos || errorCursadas || errorMaterias || errorAulas || errorCiclos || errorBloques;
  if (cargando || conError) return <EstadoCarga loading={cargando} error={conError} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div>
        <h1 className="font-headline text-headline-md font-bold text-on-surface">
          Mis Cursadas
        </h1>
        <p className="font-body text-body-sm text-on-surface-variant mt-1">
          {cicloActivo
            ? `Todas las cursadas registradas durante el ciclo lectivo ${nombreCicloLectivo(cicloActivo)}${esCicloActual ? ' (actual)' : ''}.`
            : 'No hay un ciclo lectivo activo configurado.'}
        </p>
      </div>

      {/* Filtro por curso */}
      {cicloActivo && (
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
      )}

      {/* Contador */}
      {cicloActivo && (
        <p className="font-body text-body-sm text-on-surface-variant -mt-4">
          {filtroCurso !== ''
            ? `${cursadas.length} de ${cursadasDelCiclo.length} ${cursadasDelCiclo.length === 1 ? 'cursada encontrada' : 'cursadas encontradas'}`
            : `${cursadas.length} ${cursadas.length === 1 ? 'cursada en total' : 'cursadas en total'}`}
        </p>
      )}

      {/* Tabla */}
      {!cicloActivo ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Marcá un ciclo lectivo como activo para ver las cursadas del sistema.
        </div>
      ) : cursadas.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          {filtroCurso !== '' ? 'No hay cursadas registradas para el curso elegido.' : 'No hay cursadas registradas en el ciclo lectivo activo.'}
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
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Materia</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Aula</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Tipo</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Cant. de clases</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Bloques Horarios</th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {cursadas.map(cursada => (
                  <tr key={cursada.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{nombreCursoDe(cursada.cursoId)}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{nombreMateria(cursada.materiaId)}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{nombreAula(cursada.aulaId)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                        {cursada.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{cursada.cantidadClases || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {bloquesDeCursada(cursada.id).length === 0 ? (
                          <span className="font-body text-xs text-on-surface-variant">Sin bloques</span>
                        ) : (
                          bloquesDeCursada(cursada.id).map(bloque => (
                            <span
                              key={bloque.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-label text-xs font-medium"
                            >
                              {nombreBloqueHorario(bloque)}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/seguimiento-evaluacion/cursadas/${cursada.id}/inscriptos`)}
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
                {cursadas.length} {cursadas.length === 1 ? 'cursada' : 'cursadas'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {cursadas.map(cursada => (
              <div
                key={cursada.id}
                className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-body text-body-sm text-on-surface font-medium">{nombreMateria(cursada.materiaId)}</p>
                    <p className="font-body text-xs text-on-surface-variant">{nombreCursoDe(cursada.cursoId)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                      {cursada.tipo}
                    </span>
                    <button
                      onClick={() => navigate(`/seguimiento-evaluacion/cursadas/${cursada.id}/inscriptos`)}
                      title="Ver detalle"
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap border-t border-outline-variant pt-3 font-body text-xs text-on-surface-variant">
                  <span>Aula: {nombreAula(cursada.aulaId)}</span>
                  <span>{cursada.cantidadClases > 0 ? `${cursada.cantidadClases} clases` : '—'}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 border-t border-outline-variant pt-3">
                  {bloquesDeCursada(cursada.id).length === 0 ? (
                    <span className="font-body text-xs text-on-surface-variant">Sin bloques horarios</span>
                  ) : (
                    bloquesDeCursada(cursada.id).map(bloque => (
                      <span
                        key={bloque.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-on-secondary-container font-label text-xs font-medium"
                      >
                        {nombreBloqueHorario(bloque)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

export default GestionCursadas;
