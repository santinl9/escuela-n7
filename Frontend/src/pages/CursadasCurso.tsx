import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useCicloLectivo } from '../hooks/useCicloLectivo';
import { useCursadaModal } from '../hooks/useCursadaModal';
import { useToast } from '../hooks/useToast';
import { nombreCurso, type Curso } from '../types/Curso';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { Aula } from '../types/Aula';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import { nombreBloqueHorario, type BloqueHorario } from '../types/BloqueHorario';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import { DIAS_SEMANA_OPCIONES } from '../constants/bloqueHorarioForm';
import { TOAST } from '../constants/toastMessages';
import CursadaModal from '../components/modals/CursadaModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';

function CursadasCurso() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: cursadasData, setData: setCursadas, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: aulasData, loading: loadingAulas, error: errorAulas } = useFetch<Aula[]>('/data/aulas.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { data: bloquesData, setData: setBloques, loading: loadingBloques, error: errorBloques } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');
  const { setData: setHorarios, loading: loadingHorarios, error: errorHorarios } = useFetch<AsignacionHoraria[]>('/data/asignacionesHorarias.json');

  const curso = (cursosData ?? []).find(c => String(c.id) === id);
  const materias = materiasData ?? [];
  const aulas = aulasData ?? [];
  const ciclos = ciclosData ?? [];
  const bloques = bloquesData ?? [];

  // El ciclo activo de esta sesión (ver CicloLectivoContext).
  const { cicloLectivoActivoId } = useCicloLectivo();
  const cicloActivo = ciclos.find(c => c.id === cicloLectivoActivoId);
  const esCicloActual = cicloActivo !== undefined && cicloActivo.id === cicloLectivoActual(ciclos)?.id;
  const cursadas = (cursadasData ?? []).filter(c => String(c.cursoId) === id && c.cicloLectivoId === cicloActivo?.id);

  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';
  const nombreAula = (aulaId: number) => aulas.find(a => a.id === aulaId)?.nombre ?? '—';
  const nombreAnio = (cicloLectivoId: number) => {
    const ciclo = ciclos.find(c => c.id === cicloLectivoId);
    return ciclo ? nombreCicloLectivo(ciclo) : '—';
  };

  const bloquesDeCursada = (cursadaId: number) =>
    bloques
      .filter(b => b.cursadaId === cursadaId)
      .sort((a, b) => {
        const diffDia = DIAS_SEMANA_OPCIONES.indexOf(a.dia) - DIAS_SEMANA_OPCIONES.indexOf(b.dia);
        return diffDia !== 0 ? diffDia : a.horaIni.localeCompare(b.horaIni);
      });

  // Las materias ofrecidas son las del nivel del curso (una materia se cursa en el nivel al que pertenece).
  const materiaOpciones = materias.filter(m => m.activo && m.nivel === curso?.nivel).map(m => ({ id: m.id, label: m.nombre }));
  const aulaOpciones = aulas.filter(a => a.activo).map(a => ({ id: a.id, label: a.nombre }));

  const [cursadaAEliminar, setCursadaAEliminar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  const {
    modalAbierto: modalCursadaAbierto, modoEdicion: modoEdicionCursada, idEditando: idEditandoCursada,
    form: formCursada, errores: erroresCursada, erroresBloques, errorSinBloques,
    abrirModalNuevo: abrirModalNuevoCursada, abrirModalEdicion: abrirModalEdicionCursada, cerrarModal: cerrarModalCursada,
    handleChange: handleChangeCursada, handleBloqueChange, agregarBloque, eliminarBloque, validarForm: validarFormCursada,
  } = useCursadaModal();

  // ── Guardar cursada (y sus bloques horarios: los existentes se reutilizan, los que no
  // tienen id se crean junto con la cursada, y los que se quitaron del form se eliminan) ──

  const handleGuardarCursada = () => {
    if (!validarFormCursada() || !curso || !cicloActivo) return;

    const cursadaId = modoEdicionCursada && idEditandoCursada !== null
      ? idEditandoCursada
      : ((cursadasData ?? []).length > 0 ? Math.max(...(cursadasData ?? []).map(c => c.id)) + 1 : 1);

    const idsBloquesForm = formCursada.bloques.filter(b => b.id !== undefined).map(b => b.id as number);
    const bloquesExistentesDeCursada = bloques.filter(b => b.cursadaId === cursadaId);
    const bloquesAEliminar = bloquesExistentesDeCursada.filter(b => !idsBloquesForm.includes(b.id)).map(b => b.id);

    let proximoIdBloque = (bloquesData ?? []).length > 0 ? Math.max(...(bloquesData ?? []).map(b => b.id)) + 1 : 1;

    const bloquesFinal = [
      ...bloques
        .filter(b => !bloquesAEliminar.includes(b.id))
        .map(b => {
          if (b.cursadaId !== cursadaId) return b;
          const enForm = formCursada.bloques.find(f => f.id === b.id);
          return enForm ? { ...b, dia: enForm.dia as BloqueHorario['dia'], horaIni: enForm.horaIni, horaFin: enForm.horaFin } : b;
        }),
      ...formCursada.bloques
        .filter(b => b.id === undefined)
        .map(b => ({ id: proximoIdBloque++, cursadaId, dia: b.dia as BloqueHorario['dia'], horaIni: b.horaIni, horaFin: b.horaFin })),
    ];

    setBloques(bloquesFinal);
    if (bloquesAEliminar.length > 0) {
      // Se quitan los bloques eliminados de cada asignación horaria; si alguna se queda sin
      // ningún bloque, se elimina por completo (toda asignación debe tener al menos uno).
      setHorarios(prev =>
        (prev ?? [])
          .map(h => ({ ...h, bloqueHorarioIds: h.bloqueHorarioIds.filter(id => !bloquesAEliminar.includes(id)) }))
          .filter(h => h.bloqueHorarioIds.length > 0)
      );
    }

    if (modoEdicionCursada && idEditandoCursada !== null) {
      setCursadas(prev =>
        (prev ?? []).map(c =>
          c.id === idEditandoCursada
            ? { ...c, materiaId: Number(formCursada.materiaId), aulaId: Number(formCursada.aulaId), tipo: formCursada.tipo as Cursada['tipo'] }
            : c
        )
      );
      cerrarModalCursada();
      mostrarToast(TOAST.CURSADA_MODIFICADA);
    } else {
      setCursadas(prev => [
        ...(prev ?? []),
        {
          id: cursadaId,
          cursoId: curso.id,
          cicloLectivoId: cicloActivo.id,
          materiaId: Number(formCursada.materiaId),
          aulaId: Number(formCursada.aulaId),
          tipo: formCursada.tipo as Cursada['tipo'],
          // No se carga desde este modal: toda cursada nueva arranca en 0 y avanza por otro medio.
          cantidadClases: 0,
        },
      ]);
      cerrarModalCursada();
      mostrarToast(TOAST.CURSADA_CREADA);
    }
  };

  // ── Eliminar cursada (también elimina los bloques horarios y asignaciones horarias asociadas) ──

  const handleEliminarCursada = () => {
    if (cursadaAEliminar === null) return;
    const bloquesAEliminar = bloques.filter(b => b.cursadaId === cursadaAEliminar).map(b => b.id);
    setCursadas(prev => (prev ?? []).filter(c => c.id !== cursadaAEliminar));
    setBloques(prev => (prev ?? []).filter(b => b.cursadaId !== cursadaAEliminar));
    // Se quitan los bloques eliminados de cada asignación horaria; si alguna se queda sin
    // ningún bloque, se elimina por completo (toda asignación debe tener al menos uno).
    setHorarios(prev =>
      (prev ?? [])
        .map(h => ({ ...h, bloqueHorarioIds: h.bloqueHorarioIds.filter(id => !bloquesAEliminar.includes(id)) }))
        .filter(h => h.bloqueHorarioIds.length > 0)
    );
    setCursadaAEliminar(null);
    mostrarToast(TOAST.CURSADA_ELIMINADA);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingCursadas || loadingMaterias || loadingAulas || loadingCiclos || loadingBloques || loadingHorarios;
  const conError = errorCursos || errorCursadas || errorMaterias || errorAulas || errorCiclos || errorBloques || errorHorarios;
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

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-headline text-headline-md font-bold text-on-surface">
              Cursadas de {nombreCurso(curso)}
            </h1>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">
              {cicloActivo
                ? `Materias que se cursan en este curso durante el ciclo lectivo ${nombreCicloLectivo(cicloActivo)}${esCicloActual ? ' (actual)' : ''}.`
                : 'No hay un ciclo lectivo activo configurado.'}
            </p>
          </div>
          <div className="flex items-center gap-sm flex-wrap shrink-0">
            {cicloActivo && esCicloActual && (
              <button
                onClick={abrirModalNuevoCursada}
                className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
              >
                <span className="material-symbols-outlined text-[1.25rem]">add</span>
                Nueva Cursada
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aviso de ciclo histórico */}
      {cicloActivo && !esCicloActual && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container font-body text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[1.25rem] shrink-0">lock</span>
          Estás viendo un ciclo lectivo histórico. No se pueden agregar, editar ni eliminar cursadas ni bloques horarios para preservar el historial.
        </div>
      )}

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {cursadas.length} {cursadas.length === 1 ? 'cursada en total' : 'cursadas en total'}
      </p>

      {/* Tabla */}
      {!cicloActivo ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Marcá un ciclo lectivo como activo para ver las cursadas de este curso.
        </div>
      ) : cursadas.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Este curso no tiene cursadas registradas en el ciclo lectivo activo.
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Materia</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Aula</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Ciclo Lectivo</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Tipo</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Cant. de clases</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Bloques Horarios</th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {cursadas.map(cursada => (
                  <tr key={cursada.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{nombreMateria(cursada.materiaId)}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{nombreAula(cursada.aulaId)}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{nombreAnio(cursada.cicloLectivoId)}</td>
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
                      <div className="flex items-center gap-xs">
                        <button
                          onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/cursadas/${cursada.id}/inscripciones`)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title="Ver inscripciones"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                        </button>
                        <button
                          onClick={() => esCicloActual && abrirModalEdicionCursada(cursada, bloquesDeCursada(cursada.id))}
                          disabled={!esCicloActual}
                          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title={esCicloActual ? 'Editar cursada' : 'No se puede editar: ciclo lectivo histórico'}
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                        </button>
                        <button
                          onClick={() => setCursadaAEliminar(cursada.id)}
                          disabled={!esCicloActual}
                          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                          title={esCicloActual ? 'Eliminar cursada' : 'No se puede eliminar: ciclo lectivo histórico'}
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
                  <p className="font-body text-body-sm text-on-surface font-medium">{nombreMateria(cursada.materiaId)}</p>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container">
                      {cursada.tipo}
                    </span>
                    <div className="flex items-center gap-xs">
                      <button
                        onClick={() => navigate(`/estructura-institucional/cursos/${curso.id}/cursadas/${cursada.id}/inscripciones`)}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        title="Ver inscripciones"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                      </button>
                      <button
                        onClick={() => esCicloActual && abrirModalEdicionCursada(cursada, bloquesDeCursada(cursada.id))}
                        disabled={!esCicloActual}
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        title={esCicloActual ? 'Editar cursada' : 'No se puede editar: ciclo lectivo histórico'}
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                      </button>
                      <button
                        onClick={() => setCursadaAEliminar(cursada.id)}
                        disabled={!esCicloActual}
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                        title={esCicloActual ? 'Eliminar cursada' : 'No se puede eliminar: ciclo lectivo histórico'}
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap border-t border-outline-variant pt-3 font-body text-xs text-on-surface-variant">
                  <span>Aula: {nombreAula(cursada.aulaId)}</span>
                  <span>Ciclo: {nombreAnio(cursada.cicloLectivoId)}</span>
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

      {/* Modal nuevo / edición de cursada (incluye la gestión de sus bloques horarios) */}
      {modalCursadaAbierto && (
        <CursadaModal
          modoEdicion={modoEdicionCursada}
          form={formCursada}
          errores={erroresCursada}
          erroresBloques={erroresBloques}
          errorBloques={errorSinBloques}
          materiaOpciones={materiaOpciones}
          aulaOpciones={aulaOpciones}
          onClose={cerrarModalCursada}
          onGuardar={handleGuardarCursada}
          onChange={handleChangeCursada}
          onBloqueChange={handleBloqueChange}
          onAgregarBloque={agregarBloque}
          onEliminarBloque={eliminarBloque}
        />
      )}

      {/* Modal confirmación de eliminación de cursada */}
      {cursadaAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Cursada"
          mensaje="¿Estás seguro de que querés eliminar esta cursada? Esta acción no se puede deshacer, y se eliminarán también sus bloques horarios y asignaciones horarias asociadas."
          onConfirmar={handleEliminarCursada}
          onCancelar={() => setCursadaAEliminar(null)}
        />
      )}

    </div>
  );
}

export default CursadasCurso;
