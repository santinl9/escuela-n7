import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useMesaExamenModal } from '../hooks/useMesaExamenModal';
import { useToast } from '../hooks/useToast';
import { useCicloLectivo } from '../hooks/useCicloLectivo';
import type { MesasDeExamen } from '../types/MesasDeExamen';
import type { InscripcionMesa } from '../types/InscripcionMesa';
import type { Materia } from '../types/Materia';
import type { Personal } from '../types/Personal';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import MesaExamenModal from '../components/modals/MesaExamenModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';
import { formatFecha } from '../constants/fechas';

function GestionMesasExamen() {
  const navigate = useNavigate();
  const { data: mesasData, setData: setMesas, loading: loadingMesas, error: errorMesas } = useFetch<MesasDeExamen[]>('/data/mesasDeExamen.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: personalData, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');
  const { data: inscripcionesData, setData: setInscripciones, loading: loadingInscripciones, error: errorInscripciones } = useFetch<InscripcionMesa[]>('/data/inscripcionesMesa.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { data: horariosData, loading: loadingHorarios, error: errorHorarios } = useFetch<AsignacionHoraria[]>('/data/asignacionesHorarias.json');

  const materias = (materiasData ?? []).filter(m => m.activo);
  const personal = (personalData ?? []).filter(p => p.activo);
  const inscripciones = inscripcionesData ?? [];
  const ciclos = ciclosData ?? [];
  const horarios = horariosData ?? [];

  // El docente a cargo de una mesa debe tener cargo de Profesor.
  const esDocente = (personalId: string) => horarios.some(h => h.personalId === personalId && h.tipoCargo === 'Profesor');

  const esDocenteDisponible = (personalId: string): boolean => esDocente(personalId);

  // El ciclo activo de esta sesión (ver CicloLectivoContext).
  const { cicloLectivoActivoId } = useCicloLectivo();
  const cicloActivo = ciclos.find(c => c.id === cicloLectivoActivoId);
  const mesas = (mesasData ?? []).filter(m => m.cicloLectivoId === cicloActivo?.id);

  // Si el ciclo que se está viendo no es el ciclo lectivo actual (por fecha),
  // se trata de un ciclo histórico: no se puede crear, editar ni eliminar
  // nada que pertenezca a él, para no alterar el historial.
  const esCicloActualEfectivo = cicloActivo !== undefined && cicloActivo.id === cicloLectivoActual(ciclos)?.id;

  // La mesa más próxima va primero.
  const mesasOrdenadas = [...mesas].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));

  const [mesaAEliminar, setMesaAEliminar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, validarForm,
  } = useMesaExamenModal();

  const nombreMateria = (materiaId: number) => {
    const materia = materias.find(m => m.id === materiaId);
    return materia ? `${materia.nombre} ${materia.nivel}°` : '—';
  };
  const nombreDocente = (personalId: string) => {
    const p = personal.find(p => p.id === personalId);
    return p ? `${p.apellido}, ${p.nombre}` : '—';
  };
  const cantidadInscriptos = (mesaId: number) => inscripciones.filter(i => i.mesaId === mesaId).length;

  // El docente ya asignado se mantiene visible aunque deje de estar disponible para esa fecha.
  const personalDocente = personal.filter(p => esDocente(p.id));

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(esDocenteDisponible) || !cicloActivo || !esCicloActualEfectivo) return;

    if (modoEdicion && idEditando !== null) {
      setMesas(prev =>
        (prev ?? []).map(m =>
          m.id === idEditando
            ? { ...m, materiaId: Number(form.materiaId), personalId: form.personalId, fecha: form.fecha, hora: form.hora, cupo: Number(form.cupo) }
            : m
        )
      );
      cerrarModal();
      mostrarToast(TOAST.MESA_EXAMEN_MODIFICADA);
    } else {
      const nuevoId = (mesasData ?? []).length > 0 ? Math.max(...(mesasData ?? []).map(m => m.id)) + 1 : 1;
      setMesas(prev => [
        ...(prev ?? []),
        {
          id: nuevoId,
          materiaId: Number(form.materiaId),
          personalId: form.personalId,
          cicloLectivoId: cicloActivo.id,
          fecha: form.fecha,
          hora: form.hora,
          cupo: Number(form.cupo),
        },
      ]);
      cerrarModal();
      mostrarToast(TOAST.MESA_EXAMEN_CREADA);
    }
  };

  // ── Eliminar (también elimina las inscripciones asociadas) ─────────────────

  const handleEliminar = () => {
    if (mesaAEliminar === null || !esCicloActualEfectivo) return;
    setMesas(prev => (prev ?? []).filter(m => m.id !== mesaAEliminar));
    setInscripciones(prev => (prev ?? []).filter(i => i.mesaId !== mesaAEliminar));
    setMesaAEliminar(null);
    mostrarToast(TOAST.MESA_EXAMEN_ELIMINADA);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const loading = loadingMesas || loadingMaterias || loadingPersonal || loadingInscripciones || loadingCiclos || loadingHorarios;
  const error   = errorMesas   || errorMaterias   || errorPersonal   || errorInscripciones   || errorCiclos   || errorHorarios;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Gestión de Mesas de Examen
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            {cicloActivo
              ? `Mesas de examen para la inscripción de los egresados en el ciclo lectivo ${nombreCicloLectivo(cicloActivo)}.`
              : 'Administra las mesas de examen para la inscripción de los egresados.'}
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          disabled={!cicloActivo || !esCicloActualEfectivo}
          title={
            !cicloActivo
              ? 'Marcá un ciclo lectivo como activo para crear mesas de examen'
              : !esCicloActualEfectivo
              ? 'No se pueden crear mesas de examen en un ciclo lectivo que no es el actual'
              : undefined
          }
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nueva Mesa de Examen
        </button>
      </div>

      {/* Aviso de ciclo histórico */}
      {cicloActivo && !esCicloActualEfectivo && (
        <div className="flex items-start gap-2 -mt-4 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container font-body text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[1.25rem] shrink-0">lock</span>
          Estás viendo un ciclo lectivo histórico. No se pueden crear, editar ni eliminar mesas de examen para preservar el historial.
        </div>
      )}

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {mesas.length} {mesas.length === 1 ? 'mesa de examen' : 'mesas de examen'} en total
      </p>

      {/* Listado */}
      {!cicloActivo ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Marcá un ciclo lectivo como activo para ver las mesas de examen de ese ciclo.
        </div>
      ) : mesas.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No hay mesas de examen registradas para el ciclo lectivo {nombreCicloLectivo(cicloActivo)}.
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
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Fecha</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Hora</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Docente a cargo</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Inscriptos</th>
                  <th className="w-28 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {mesasOrdenadas.map(mesa => {
                  const inscriptos = cantidadInscriptos(mesa.id);
                  const cupoLleno = inscriptos >= mesa.cupo;
                  return (
                    <tr key={mesa.id} className="hover:bg-surface-container-high transition-colors duration-150">
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{nombreMateria(mesa.materiaId)}</td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{formatFecha(mesa.fecha)}</td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{mesa.hora}</td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{nombreDocente(mesa.personalId)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium ${
                          cupoLleno ? 'bg-error-container text-error' : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {inscriptos}/{mesa.cupo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-xs">
                          <button
                            onClick={() => navigate(`/trayectorias-estudiantiles/mesas-examen/${mesa.id}`)}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                            title="Ver inscriptos"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                          </button>
                          <button
                            onClick={() => abrirModalEdicion(mesa)}
                            disabled={!esCicloActualEfectivo}
                            title={esCicloActualEfectivo ? 'Editar' : 'No se puede editar: ciclo lectivo histórico'}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                          </button>
                          <button
                            onClick={() => setMesaAEliminar(mesa.id)}
                            disabled={!esCicloActualEfectivo}
                            title={esCicloActualEfectivo ? 'Eliminar' : 'No se puede eliminar: ciclo lectivo histórico'}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="px-md py-sm bg-surface-container border-t border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {mesas.length} {mesas.length === 1 ? 'mesa de examen' : 'mesas de examen'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {mesasOrdenadas.map(mesa => {
              const inscriptos = cantidadInscriptos(mesa.id);
              const cupoLleno = inscriptos >= mesa.cupo;
              return (
                <div
                  key={mesa.id}
                  className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="material-symbols-outlined text-primary !text-[2rem] shrink-0 bg-surface-container-high p-2 rounded-xl">
                        workspace_premium
                      </span>
                      <div className="flex flex-col gap-1 min-w-0">
                        <h3
                          className="font-headline text-lg xl:text-xl text-on-surface leading-tight break-words"
                          style={{ wordBreak: 'break-word' }}
                        >
                          {nombreMateria(mesa.materiaId)}
                        </h3>
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full font-label text-xs font-medium ${
                          cupoLleno ? 'bg-error-container text-error' : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {inscriptos}/{mesa.cupo} inscriptos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-xs shrink-0">
                      <button
                        onClick={() => navigate(`/trayectorias-estudiantiles/mesas-examen/${mesa.id}`)}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        title="Ver inscriptos"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                      </button>
                      <button
                        onClick={() => abrirModalEdicion(mesa)}
                        disabled={!esCicloActualEfectivo}
                        title={esCicloActualEfectivo ? 'Editar' : 'No se puede editar: ciclo lectivo histórico'}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                      </button>
                      <button
                        onClick={() => setMesaAEliminar(mesa.id)}
                        disabled={!esCicloActualEfectivo}
                        title={esCicloActualEfectivo ? 'Eliminar' : 'No se puede eliminar: ciclo lectivo histórico'}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 font-body text-body-sm text-on-surface-variant border-t border-outline-variant pt-4">
                    <div className="flex items-center justify-between">
                      <span>Fecha</span>
                      <span className="font-label text-label-md text-on-surface">{formatFecha(mesa.fecha)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Hora</span>
                      <span className="font-label text-label-md text-on-surface">{mesa.hora}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Docente a cargo</span>
                      <span className="font-label text-label-md text-on-surface">{nombreDocente(mesa.personalId)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal nuevo / edición */}
      {modalAbierto && (
        <MesaExamenModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          materias={materias}
          personal={personalDocente}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {mesaAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Mesa de Examen"
          mensaje="¿Estás seguro de que querés eliminar esta mesa de examen? Esta acción no se puede deshacer, y se eliminarán también las inscripciones asociadas."
          onConfirmar={handleEliminar}
          onCancelar={() => setMesaAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionMesasExamen;
