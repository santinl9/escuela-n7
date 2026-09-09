import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import type { Estudiante } from '../types/Estudiante';
import type { Inscripcion } from '../types/Inscripcion';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { Matricula } from '../types/Matricula';
import { nombreCurso, cursoEfectivoDe, type Curso } from '../types/Curso';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import EstadoBadge from '../components/elements/EstadoBadge';
import SeccionInfo from '../components/elements/SeccionInfo';
import CampoDetalle from '../components/elements/CampoDetalle';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { formatFecha } from '../constants/fechas';
import { TOAST } from '../constants/toastMessages';

// Detalle de un matriculado desde "Ver Matriculados" (Estructura Institucional): misma
// ficha que DetalleEstudianteMiCurso, salvo que en vez de asistencias se muestran las
// cursadas de ESTE curso a las que está inscripto, con la posibilidad de desinscribirlo.
function DetalleMatriculadoCurso() {
  const { cursoId, id } = useParams<{ cursoId: string; id: string }>();
  const navigate = useNavigate();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<Estudiante[]>('/data/estudiantes.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { data: inscripcionesData, setData: setInscripciones, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { setData: setMatriculas, loading: loadingMatriculas, error: errorMatriculas } = useFetch<Matricula[]>('/data/matriculas.json');
  const { mostrarToast } = useToast();

  const curso = (cursosData ?? []).find(c => String(c.id) === cursoId);
  const estudiante = (estudiantesData ?? []).find(e => String(e.id) === id);
  const cursadasTodas = cursadasData ?? [];
  const cursos = cursosData ?? [];
  const materias = materiasData ?? [];
  const ciclos = ciclosData ?? [];
  const inscripciones = inscripcionesData ?? [];

  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';
  const nombreCicloDeCursada = (cicloLectivoId: number) => {
    const ciclo = ciclos.find(c => c.id === cicloLectivoId);
    return ciclo ? nombreCicloLectivo(ciclo) : '—';
  };

  // Cursadas de ESTE curso a las que el estudiante está inscripto (puede haberlas de
  // más de un ciclo lectivo si nunca se desinscribió de las anteriores).
  const cursadasDelCurso = estudiante && curso
    ? inscripciones
        .filter(i => i.estudianteDni === estudiante.dni)
        .map(inscripcion => {
          const cursada = cursadasTodas.find(c => c.id === inscripcion.cursadaId);
          return cursada && cursada.cursoId === curso.id ? { inscripcion, cursada } : null;
        })
        .filter((x): x is { inscripcion: Inscripcion; cursada: Cursada } => x !== null)
    : [];

  const [inscripcionAEliminar, setInscripcionAEliminar] = useState<number | null>(null);

  const handleDesinscribir = () => {
    if (inscripcionAEliminar === null || !estudiante) return;

    const inscripcionesRestantes = inscripciones.filter(
      i => i.estudianteDni === estudiante.dni && i.id !== inscripcionAEliminar
    );
    setInscripciones(prev => (prev ?? []).filter(i => i.id !== inscripcionAEliminar));

    // La matrícula se recalcula sobre las inscripciones restantes del ciclo lectivo actual:
    // si el curso más alto no cambió, se conserva tal cual (con su fecha original); si
    // cambió, pasa al nuevo curso más alto (el "próximo más bajo" tras sacar la matrícula
    // que tenía); y si ya no quedan inscripciones vigentes en ningún curso, se elimina la
    // matrícula por completo.
    const cursoMasAlto = cursoEfectivoDe(estudiante.dni, inscripcionesRestantes, cursadasTodas, cursos, cicloLectivoActual(ciclos)?.id);
    setMatriculas(prevMatriculas => {
      const resultado = prevMatriculas ?? [];
      const matriculaActual = resultado.find(m => m.estudianteDni === estudiante.dni);

      if (matriculaActual && cursoMasAlto && matriculaActual.cursoId === cursoMasAlto.id) {
        return resultado;
      }

      const restantes = resultado.filter(m => m.estudianteDni !== estudiante.dni);
      if (!cursoMasAlto) return restantes;

      const proximoId = restantes.length > 0 ? Math.max(...restantes.map(m => m.id)) + 1 : 1;
      return [
        ...restantes,
        { id: proximoId, estudianteDni: estudiante.dni, cursoId: cursoMasAlto.id, fecha: new Date().toISOString().slice(0, 10) },
      ];
    });

    setInscripcionAEliminar(null);
    mostrarToast(TOAST.INSCRIPCION_ELIMINADA);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingEstudiantes || loadingCursadas || loadingMaterias
    || loadingCiclos || loadingInscripciones || loadingMatriculas;
  const conError = errorCursos || errorEstudiantes || errorCursadas || errorMaterias
    || errorCiclos || errorInscripciones || errorMatriculas;
  if (cargando || conError) return <EstadoCarga loading={cargando} error={conError} />;

  if (!curso || !estudiante) {
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
          <h1 className="font-headline text-headline-md font-bold text-on-surface">Estudiante no encontrado</h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            No existe un estudiante con el id {id} en este curso.
          </p>
        </div>
      </div>
    );
  }

  const inscripcionEnEliminacion = cursadasDelCurso.find(x => x.inscripcion.id === inscripcionAEliminar);

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
            {estudiante.apellido}, {estudiante.nombre}
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Estudiante de {nombreCurso(curso)}
          </p>
        </div>
      </div>

      {/* Datos personales */}
      <SeccionInfo icono="person" titulo="Datos personales">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CampoDetalle label="DNI"                 value={estudiante.dni} />
          <CampoDetalle label="CUIL"                value={estudiante.cuil} />
          <CampoDetalle label="Email"               value={estudiante.email} />
          <CampoDetalle label="Teléfono"            value={estudiante.telefono} />
          <CampoDetalle label="Fecha de Nacimiento" value={formatFecha(estudiante.fechaNacimiento)} />
          <CampoDetalle label="Nacionalidad"        value={estudiante.nacionalidad} />
          <CampoDetalle label="Edad"                value={`${estudiante.edad} años`} />
          <div className="flex flex-col gap-1">
            <span className="font-label text-label-md text-on-surface-variant">Estado</span>
            <EstadoBadge estado={estudiante.estado} />
          </div>
        </div>
      </SeccionInfo>

      {/* Cursadas del curso */}
      <SeccionInfo icono="school" titulo="Cursadas del Curso">
        {cursadasDelCurso.length === 0 ? (
          <p className="font-body text-body-sm text-on-surface-variant">
            No tiene inscripciones a cursadas de este curso.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-outline-variant">
            {cursadasDelCurso.map(({ inscripcion, cursada }) => (
              <div
                key={inscripcion.id}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-4 py-4 first:pt-0 last:pb-0 items-center"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Materia</span>
                  <span className="font-body text-body-sm text-on-surface font-medium">{nombreMateria(cursada.materiaId)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Ciclo Lectivo</span>
                  <span className="font-body text-body-sm text-on-surface-variant">{nombreCicloDeCursada(cursada.cicloLectivoId)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Tipo</span>
                  <span className="w-fit px-2.5 py-1 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                    {inscripcion.tipo}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Estado</span>
                  <EstadoBadge estado={inscripcion.estado} />
                </div>
                <div className="flex justify-start lg:justify-end">
                  <button
                    onClick={() => setInscripcionAEliminar(inscripcion.id)}
                    className="cursor-pointer flex items-center gap-xs px-3 py-1.5 border border-outline-variant text-on-surface-variant font-label text-label-md rounded-lg hover:bg-error-container hover:text-error hover:border-error transition-colors duration-150"
                  >
                    <span className="material-symbols-outlined text-[1.1rem]">person_remove</span>
                    Desinscribir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SeccionInfo>

      {/* Confirmación de desinscripción */}
      {inscripcionEnEliminacion && (
        <ConfirmEliminar
          titulo="Desinscribir de la Cursada"
          mensaje={
            <>
              ¿Estás seguro de que querés desinscribir a <strong>{estudiante.apellido}, {estudiante.nombre}</strong> de{' '}
              <strong>{nombreMateria(inscripcionEnEliminacion.cursada.materiaId)}</strong>? Si esta era su última cursada
              de {nombreCurso(curso)}, su matrícula pasará al curso más alto entre sus cursadas restantes.
            </>
          }
          onConfirmar={handleDesinscribir}
          onCancelar={() => setInscripcionAEliminar(null)}
        />
      )}

    </div>
  );
}

export default DetalleMatriculadoCurso;
