import { Fragment, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { nombreCurso, cursoEfectivoDe, type Curso } from '../types/Curso';
import type { Matricula } from '../types/Matricula';
import type { EstudianteListado } from '../types/EstudianteListado';
import type { AsistenciaInstitucional, TipoAsistencia } from '../types/AsistenciaInstitucional';
import type { Inscripcion } from '../types/Inscripcion';
import type { Cursada } from '../types/Cursada';
import type { BloqueHorario } from '../types/BloqueHorario';
import type { Aula } from '../types/Aula';
import type { Materia } from '../types/Materia';
import { cicloLectivoActual, type CicloLectivo } from '../types/CicloLectivo';
import EstadoCarga from '../components/elements/EstadoCarga';
import { formatFecha, hoyISO } from '../constants/fechas';
import { DIAS_SEMANA_OPCIONES } from '../constants/bloqueHorarioForm';
import { ACCION_INSCRIPCION } from '../constants/inscripcionForm';
import { TOAST } from '../constants/toastMessages';

// Día de la semana según la fecha del dispositivo (getDay: 0 domingo ... 6 sábado); la
// escuela no tiene clases los domingos, por eso ese caso no tiene bloque horario asociado.
const diaSemanaActual = () => DIAS_SEMANA_OPCIONES[new Date().getDay() - 1];

const horaActual = (): string => {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
};

function PasarListaCurso() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: matriculasData, loading: loadingMatriculas, error: errorMatriculas } = useFetch<Matricula[]>('/data/matriculas.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
  const { data: asistenciasData, setData: setAsistencias, loading: loadingAsistencias, error: errorAsistencias } = useFetch<AsistenciaInstitucional[]>('/data/asistenciasInstitucionales.json');
  const { data: inscripcionesData, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: bloquesData, loading: loadingBloques, error: errorBloques } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');
  const { data: aulasData, loading: loadingAulas, error: errorAulas } = useFetch<Aula[]>('/data/aulas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');

  const curso = (cursosData ?? []).find(c => String(c.id) === id);
  const estudiantes = estudiantesData ?? [];
  const inscripciones = inscripcionesData ?? [];
  const cursadas = cursadasData ?? [];
  const bloques = bloquesData ?? [];
  const aulas = aulasData ?? [];
  const materias = materiasData ?? [];
  const cursos = cursosData ?? [];
  const cicloActual = cicloLectivoActual(ciclosData ?? []);
  const hoy = hoyISO();

  // Un estudiante está matriculado al curso de la cursada de curso más alto a la que está
  // inscripto (ver cursoEfectivoDe): se recalcula a partir de sus inscripciones vigentes,
  // no del cursoId guardado en Matricula, para no arrastrar una matrícula de un ciclo
  // lectivo ya cerrado.
  const matriculados = (matriculasData ?? [])
    .filter(m => curso !== undefined && cursoEfectivoDe(m.estudianteDni, inscripciones, cursadas, cursos, cicloActual?.id)?.id === curso.id)
    .map(m => estudiantes.find(e => e.dni === m.estudianteDni))
    .filter((e): e is EstudianteListado => e !== undefined)
    .sort((a, b) => a.apellido.localeCompare(b.apellido));

  interface UbicacionActual {
    aula: string;
    materia: string;
    tipo: Inscripcion['tipo'];
  }

  // Dónde está el estudiante en este momento (aula + materia + tipo de inscripción), si el
  // bloque horario (día + franja) vigente de alguna de sus inscripciones regulares corresponde
  // a una cursada de OTRO curso: por ejemplo está recuperando, intensificando o cursando una
  // materia que lo tiene habilitado en este curso pero que ahora mismo se dicta en otro salón.
  // Si ahora no tiene clase, o la tiene en una cursada de este mismo curso, undefined: no hay
  // nada que aclararle al preceptor.
  const ubicacionActualDe = (dni: number): UbicacionActual | undefined => {
    if (!curso) return undefined;
    const dia = diaSemanaActual();
    if (!dia) return undefined;
    const hora = horaActual();
    const inscripcionesDelEstudiante = inscripciones.filter(i => i.estudianteDni === dni && i.estado === 'Regular');
    for (const insc of inscripcionesDelEstudiante) {
      const cursada = cursadas.find(c => c.id === insc.cursadaId);
      if (!cursada || cursada.cursoId === curso.id) continue;
      const bloqueActual = bloques.find(b => b.cursadaId === insc.cursadaId && b.dia === dia && b.horaIni <= hora && hora < b.horaFin);
      if (!bloqueActual) continue;
      const aula = aulas.find(a => a.id === cursada.aulaId);
      const materia = materias.find(m => m.id === cursada.materiaId);
      if (aula && materia) return { aula: aula.nombre, materia: materia.nombre, tipo: insc.tipo };
    }
    return undefined;
  };

  // La lista institucional se puede pasar más de una vez por día porque un curso tiene horario
  // curricular y horario extracurricular. En la primera apertura del día están habilitados
  // todos los matriculados; de ahí en más solo quedan habilitados quienes, en el horario de
  // esta apertura, tengan una inscripción Regular a alguna cursada extracurricular en curso
  // (de este curso o de otro): son quienes corresponde volver a marcar en esta segunda vuelta.
  const estaCursandoExtracurricularAhora = (dni: number): boolean => {
    const dia = diaSemanaActual();
    if (!dia) return false;
    const hora = horaActual();
    const inscripcionesDelEstudiante = inscripciones.filter(i => i.estudianteDni === dni && i.estado === 'Regular');
    return inscripcionesDelEstudiante.some(insc => {
      const cursada = cursadas.find(c => c.id === insc.cursadaId);
      if (!cursada) return false;
      const materia = materias.find(m => m.id === cursada.materiaId);
      if (!materia || materia.curricular) return false;
      return bloques.some(b => b.cursadaId === insc.cursadaId && b.dia === dia && b.horaIni <= hora && hora < b.horaFin);
    });
  };

  // A diferencia de estaCursandoExtracurricularAhora (que mira el instante actual, para
  // habilitar la segunda apertura), esto mira el día entero: si el estudiante tiene alguna
  // cursada extracurricular con bloque horario hoy, sus inasistencias del día se parten en dos
  // mitades (una por el horario curricular, otra por el extracurricular) en vez de contar entera.
  const tieneExtracurricularHoy = (dni: number): boolean => {
    const dia = diaSemanaActual();
    if (!dia) return false;
    const inscripcionesDelEstudiante = inscripciones.filter(i => i.estudianteDni === dni && i.estado === 'Regular');
    return inscripcionesDelEstudiante.some(insc => {
      const cursada = cursadas.find(c => c.id === insc.cursadaId);
      if (!cursada) return false;
      const materia = materias.find(m => m.id === cursada.materiaId);
      if (!materia || materia.curricular) return false;
      return bloques.some(b => b.cursadaId === insc.cursadaId && b.dia === dia);
    });
  };

  // Presente por defecto para todos; si ya se pasó lista hoy para este estudiante,
  // se respeta lo cargado (permite retomar la lista sin perder lo ya marcado).
  const [presentes, setPresentes] = useState<Record<number, boolean>>({});
  const [sincronizado, setSincronizado] = useState(false);

  if (!sincronizado && cursosData && matriculasData && estudiantesData && asistenciasData) {
    setSincronizado(true);
    const mapa: Record<number, boolean> = {};
    matriculados.forEach(est => {
      const registroHoy = asistenciasData.find(a => a.estudianteDni === est.dni && a.fecha === hoy);
      mapa[est.id] = !registroHoy || registroHoy.tipo !== 'Falta Completa';
    });
    setPresentes(mapa);
  }

  const toggleAsistencia = (id: number) => {
    setPresentes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cantidadAusentes = matriculados.filter(est => presentes[est.id] === false).length;

  // Ya se pasó lista hoy si al menos uno de los matriculados tiene un registro de hoy:
  // se puede seguir editando (guardar vuelve a reemplazar el registro de hoy de cada uno).
  const yaPasoListaHoy = matriculados.length > 0 && matriculados.some(est =>
    (asistenciasData ?? []).some(a => a.estudianteDni === est.dni && a.fecha === hoy)
  );

  // En la primera apertura del día está habilitado todo el mundo; de la segunda en más,
  // solo quienes ahora mismo estén cursando una materia extracurricular.
  const estaAccesible = (dni: number): boolean => !yaPasoListaHoy || estaCursandoExtracurricularAhora(dni);

  const matriculadosAccesibles = matriculados.filter(est => estaAccesible(est.dni));

  // Registro de asistencia de hoy ya guardado (de una apertura anterior), para mostrarlo
  // en los inaccesibles en vez de inferirlo del checkbox de esta apertura.
  const registroDeHoy = (dni: number): AsistenciaInstitucional | undefined =>
    (asistenciasData ?? []).find(a => a.estudianteDni === dni && a.fecha === hoy);

  // Combina la falta de la otra apertura del día (la curricular, si esta es la extracurricular
  // o viceversa) con la de esta apertura para decidir el tipo final del día: falta en una sola
  // cuenta media falta; falta en las dos completa la falta entera; si no falta en ninguna, o el
  // estudiante no tiene materias extracurriculares hoy (una sola apertura define todo el día),
  // el resultado es directo.
  const tipoParaHoy = (est: EstudianteListado, registroExistente: AsistenciaInstitucional | undefined): TipoAsistencia => {
    const faltoEstaApertura = !presentes[est.id];

    if (!tieneExtracurricularHoy(est.dni)) {
      return faltoEstaApertura ? 'Falta Completa' : 'Asistencia Completa';
    }

    const faltoLaOtraApertura = yaPasoListaHoy && registroExistente
      ? registroExistente.tipo !== 'Asistencia Completa'
      : false;

    if (faltoEstaApertura && faltoLaOtraApertura) return 'Falta Completa';
    if (faltoEstaApertura || faltoLaOtraApertura) return 'Media Falta';
    return 'Asistencia Completa';
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    // Solo se guarda el registro de hoy de los matriculados accesibles en esta apertura: los
    // inaccesibles ya tienen su asistencia de hoy tomada en otra apertura y no se toca.
    const dnisAGuardar = matriculadosAccesibles.map(est => est.dni);
    setAsistencias(prev => {
      const actuales = prev ?? [];
      const restantes = actuales.filter(a => !(a.fecha === hoy && dnisAGuardar.includes(a.estudianteDni)));
      let proximoId = actuales.length > 0 ? Math.max(...actuales.map(a => a.id)) + 1 : 1;
      const nuevos: AsistenciaInstitucional[] = matriculadosAccesibles.map(est => {
        const registroExistente = actuales.find(a => a.estudianteDni === est.dni && a.fecha === hoy);
        return {
          id: proximoId++,
          estudianteDni: est.dni,
          fecha: hoy,
          tipo: tipoParaHoy(est, registroExistente),
          justificada: registroExistente?.justificada ?? false,
        };
      });
      return [...restantes, ...nuevos];
    });
    mostrarToast(TOAST.ASISTENCIA_GUARDADA);
    navigate(-1);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingMatriculas || loadingEstudiantes || loadingAsistencias
    || loadingInscripciones || loadingCursadas || loadingBloques || loadingAulas || loadingMaterias || loadingCiclos;
  const conError = errorCursos || errorMatriculas || errorEstudiantes || errorAsistencias
    || errorInscripciones || errorCursadas || errorBloques || errorAulas || errorMaterias || errorCiclos;
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
            Pasar Lista — {nombreCurso(curso)}
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            {formatFecha(hoy)} · Todos los estudiantes empiezan marcados como presentes; destildá para registrar una inasistencia.
          </p>
        </div>
      </div>

      {/* Aviso de lista ya pasada */}
      {yaPasoListaHoy && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container font-body text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[1.25rem] shrink-0">edit_calendar</span>
          Ya se pasó lista hoy en este curso. Ahora solo podés tomar asistencia a quienes estén cursando una materia extracurricular en este momento; el resto ya quedó registrado y aparece inaccesible. Para quien tenga materias extracurriculares hoy, faltar en una sola apertura cuenta media falta; faltar en las dos completa la falta.
        </div>
      )}

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {matriculados.length} {matriculados.length === 1 ? 'estudiante' : 'estudiantes'}
        {cantidadAusentes > 0 && ` · ${cantidadAusentes} ${cantidadAusentes === 1 ? 'ausente' : 'ausentes'}`}
      </p>

      {/* Listado */}
      {matriculados.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Este curso todavía no tiene estudiantes matriculados.
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
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Aula actual</th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Presente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {matriculados.map(est => {
                  const presente = presentes[est.id] ?? true;
                  const ubicacion = ubicacionActualDe(est.dni);
                  const accesible = estaAccesible(est.dni);
                  const tipoGuardado = accesible ? undefined : registroDeHoy(est.dni)?.tipo;
                  const esPresenteFinal = accesible ? presente : tipoGuardado === 'Asistencia Completa';
                  return (
                    <Fragment key={est.id}>
                      <tr
                        onClick={accesible ? () => toggleAsistencia(est.id) : undefined}
                        title={accesible ? undefined : 'Ya se le tomó asistencia hoy en este curso; no tiene una materia extracurricular en curso ahora mismo.'}
                        className={`transition-colors duration-150 ${
                          accesible ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                        } ${
                          esPresenteFinal
                            ? `bg-success-container/30 ${accesible ? 'hover:bg-surface-container-high' : ''}`
                            : 'bg-error-container'
                        }`}
                      >
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{est.apellido}, {est.nombre}</td>
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{est.dni}</td>
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{ubicacion?.aula ?? '—'}</td>
                        <td className="px-4 py-3">
                          <label onClick={(e) => e.stopPropagation()} className="switch-lg">
                            <input
                              type="checkbox"
                              checked={presente}
                              disabled={!accesible}
                              onChange={() => toggleAsistencia(est.id)}
                            />
                            <span className="switch-lg-track" />
                          </label>
                        </td>
                      </tr>
                      {ubicacion && (
                        <tr className="bg-surface-container">
                          <td colSpan={4} className="px-4 py-2">
                            <p className="flex items-center gap-xs font-body text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-[1rem] shrink-0">info</span>
                              Actualmente en el salón {ubicacion.aula}, {ACCION_INSCRIPCION[ubicacion.tipo]} {ubicacion.materia}.
                            </p>
                          </td>
                        </tr>
                      )}
                      {!accesible && (
                        <tr className="bg-surface-container">
                          <td colSpan={4} className="px-4 py-2">
                            <p className="flex items-center gap-xs font-body text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-[1rem] shrink-0">lock</span>
                              Inaccesible: ya se le tomó asistencia hoy ({tipoGuardado}) y no tiene una materia extracurricular en curso ahora mismo.
                            </p>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {matriculados.map(est => {
              const presente = presentes[est.id] ?? true;
              const ubicacion = ubicacionActualDe(est.dni);
              const accesible = estaAccesible(est.dni);
              const tipoGuardado = accesible ? undefined : registroDeHoy(est.dni)?.tipo;
              const esPresenteFinal = accesible ? presente : tipoGuardado === 'Asistencia Completa';
              return (
                <div
                  key={est.id}
                  className={`rounded-xl border border-outline-variant shadow-sm overflow-hidden ${accesible ? '' : 'opacity-50'} ${
                    esPresenteFinal ? 'bg-success-container/30' : 'bg-error-container'
                  }`}
                >
                  <label className={`p-4 flex items-center justify-between gap-3 ${accesible ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <div>
                      <p className="font-body text-body-sm text-on-surface font-medium">{est.apellido}, {est.nombre}</p>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {est.dni} · Aula: {ubicacion?.aula ?? '—'}</p>
                    </div>
                    <span className="switch-lg">
                      <input
                        type="checkbox"
                        checked={presente}
                        disabled={!accesible}
                        onChange={() => toggleAsistencia(est.id)}
                      />
                      <span className="switch-lg-track" />
                    </span>
                  </label>
                  {ubicacion && (
                    <p className="flex items-center gap-xs px-4 py-2 border-t border-outline-variant bg-surface-container font-body text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[1rem] shrink-0">info</span>
                      Actualmente en el salón {ubicacion.aula}, {ACCION_INSCRIPCION[ubicacion.tipo]} {ubicacion.materia}.
                    </p>
                  )}
                  {!accesible && (
                    <p className="flex items-center gap-xs px-4 py-2 border-t border-outline-variant bg-surface-container font-body text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[1rem] shrink-0">lock</span>
                      Inaccesible: ya se le tomó asistencia hoy ({tipoGuardado}) y no tiene una materia extracurricular en curso ahora mismo.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Guardar */}
          <button
            onClick={handleGuardar}
            disabled={matriculadosAccesibles.length === 0}
            className="cursor-pointer self-end px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
          >
            {yaPasoListaHoy ? 'Guardar Cambios' : 'Guardar Asistencia'}
          </button>
        </>
      )}

    </div>
  );
}

export default PasarListaCurso;
