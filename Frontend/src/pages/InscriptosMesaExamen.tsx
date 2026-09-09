import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useInscripcionMesaModal } from '../hooks/useInscripcionMesaModal';
import { useToast } from '../hooks/useToast';
import type { MesasDeExamen } from '../types/MesasDeExamen';
import type { InscripcionMesa } from '../types/InscripcionMesa';
import type { Materia } from '../types/Materia';
import type { Personal } from '../types/Personal';
import type { EstudianteListado } from '../types/EstudianteListado';
import { cicloLectivoActual, type CicloLectivo } from '../types/CicloLectivo';
import InscripcionMesaModal from '../components/modals/InscripcionMesaModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';
import { formatFecha } from '../constants/fechas';

function InscriptosMesaExamen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: mesasData, loading: loadingMesas, error: errorMesas } = useFetch<MesasDeExamen[]>('/data/mesasDeExamen.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: personalData, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
  const { data: inscripcionesData, setData: setInscripciones, loading: loadingInscripciones, error: errorInscripciones } = useFetch<InscripcionMesa[]>('/data/inscripcionesMesa.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');

  const mesas = mesasData ?? [];
  const materias = materiasData ?? [];
  const personal = personalData ?? [];
  const estudiantes = estudiantesData ?? [];
  const inscripciones = inscripcionesData ?? [];
  const ciclos = ciclosData ?? [];

  const mesa = mesas.find(m => String(m.id) === id);
  const inscriptosMesa = inscripciones.filter(i => mesa !== undefined && i.mesaId === mesa.id);

  // Si la mesa pertenece a un ciclo lectivo que no es el actual (por fecha),
  // es historial: no se puede inscribir, cargar nota ni eliminar inscripciones.
  const esCicloActualEfectivo = mesa !== undefined && mesa.cicloLectivoId === cicloLectivoActual(ciclos)?.id;

  const egresados = estudiantes.filter(e => e.estado === 'Egresado');
  const egresadosDisponibles = egresados.filter(e => !inscriptosMesa.some(i => i.estudianteDni === e.dni));

  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';
  const nombreDocente = (personalId: string) => {
    const p = personal.find(p => p.id === personalId);
    return p ? `${p.apellido}, ${p.nombre}` : '—';
  };
  const estudianteDe = (dni: number) => estudiantes.find(e => e.dni === dni);

  const [inscripcionAEliminar, setInscripcionAEliminar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, handleToggleAsistio, validarForm,
  } = useInscripcionMesaModal();

  const inscripcionEditando = inscriptosMesa.find(i => i.id === idEditando);
  const estudianteActual = inscripcionEditando ? estudianteDe(inscripcionEditando.estudianteDni) : undefined;

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm() || !mesa || !esCicloActualEfectivo) return;

    if (modoEdicion && idEditando !== null) {
      setInscripciones(prev =>
        (prev ?? []).map(i => (i.id === idEditando ? { ...i, nota: Number(form.nota), asistio: form.asistio } : i))
      );
      cerrarModal();
      mostrarToast(TOAST.INSCRIPCION_MESA_MODIFICADA);
    } else {
      const nuevoId = (inscripcionesData ?? []).length > 0 ? Math.max(...(inscripcionesData ?? []).map(i => i.id)) + 1 : 1;
      setInscripciones(prev => [
        ...(prev ?? []),
        {
          id: nuevoId,
          mesaId: mesa.id,
          estudianteDni: Number(form.estudianteDni),
          fechaInscripcion: new Date().toISOString().slice(0, 10),
          nota: null,
          asistio: false,
        },
      ]);
      cerrarModal();
      mostrarToast(TOAST.INSCRIPCION_MESA_CREADA);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────

  const handleEliminar = () => {
    if (inscripcionAEliminar === null || !esCicloActualEfectivo) return;
    setInscripciones(prev => (prev ?? []).filter(i => i.id !== inscripcionAEliminar));
    setInscripcionAEliminar(null);
    mostrarToast(TOAST.INSCRIPCION_MESA_ELIMINADA);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const loading = loadingMesas || loadingMaterias || loadingPersonal || loadingEstudiantes || loadingInscripciones || loadingCiclos;
  const error   = errorMesas   || errorMaterias   || errorPersonal   || errorEstudiantes   || errorInscripciones   || errorCiclos;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  if (!mesa) {
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
          <h1 className="font-headline text-headline-md font-bold text-on-surface">Mesa de examen no encontrada</h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            No existe una mesa de examen con el id {id}.
          </p>
        </div>
      </div>
    );
  }

  const cupoLleno = inscriptosMesa.length >= mesa.cupo;

  // Cantidad de veces que el estudiante se inscribió a una mesa final de esta materia, sin
  // importar el docente o la fecha de esa mesa (incluye esta inscripción).
  const intentosDe = (dni: number): number =>
    inscripciones.filter(i => i.estudianteDni === dni && mesas.find(m => m.id === i.mesaId)?.materiaId === mesa.materiaId).length;

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
              Inscriptos — Mesa de {nombreMateria(mesa.materiaId)}
            </h1>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">
              {formatFecha(mesa.fecha)} a las {mesa.hora} · Docente a cargo: {nombreDocente(mesa.personalId)}
            </p>
          </div>
          <button
            onClick={abrirModalNuevo}
            disabled={cupoLleno || !esCicloActualEfectivo}
            title={
              !esCicloActualEfectivo
                ? 'No se pueden inscribir egresados en un ciclo lectivo que no es el actual'
                : cupoLleno
                ? 'El cupo de la mesa está completo'
                : undefined
            }
            className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50"
          >
            <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
            Inscribir Egresado
          </button>
        </div>
      </div>

      {/* Aviso de ciclo histórico */}
      {!esCicloActualEfectivo && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container font-body text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[1.25rem] shrink-0">lock</span>
          Estás viendo un ciclo lectivo histórico. No se pueden inscribir egresados, cargar notas ni eliminar inscripciones para preservar el historial.
        </div>
      )}

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {inscriptosMesa.length}/{mesa.cupo} egresados inscriptos
      </p>

      {/* Listado */}
      {inscriptosMesa.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Todavía no hay egresados inscriptos en esta mesa de examen.
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Egresado</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">DNI</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Fecha de inscripción</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Intentos</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Nota</th>
                  <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {inscriptosMesa.map(inscripcion => {
                  const estudiante = estudianteDe(inscripcion.estudianteDni);
                  return (
                    <tr key={inscripcion.id} className="hover:bg-surface-container-high transition-colors duration-150">
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">
                        {estudiante ? `${estudiante.apellido}, ${estudiante.nombre}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{estudiante ? estudiante.dni : '—'}</td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{formatFecha(inscripcion.fechaInscripcion)}</td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{intentosDe(inscripcion.estudianteDni)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {inscripcion.nota !== null ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container ${
                            inscripcion.nota < 4 ? 'bg-secondary-container/50' : ''
                          }`}>
                            {inscripcion.nota}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-surface-variant text-on-surface-variant">
                            Sin calificar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-xs">
                          <button
                            onClick={() => abrirModalEdicion(inscripcion)}
                            disabled={!esCicloActualEfectivo}
                            title={esCicloActualEfectivo ? 'Cargar nota' : 'No se puede editar: ciclo lectivo histórico'}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">note_add</span>
                          </button>
                          <button
                            onClick={() => setInscripcionAEliminar(inscripcion.id)}
                            disabled={!esCicloActualEfectivo}
                            title={esCicloActualEfectivo ? 'Eliminar inscripción' : 'No se puede eliminar: ciclo lectivo histórico'}
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
                {inscriptosMesa.length} {inscriptosMesa.length === 1 ? 'inscripto' : 'inscriptos'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {inscriptosMesa.map(inscripcion => {
              const estudiante = estudianteDe(inscripcion.estudianteDni);
              return (
                <div
                  key={inscripcion.id}
                  className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-body text-body-sm text-on-surface font-medium">
                        {estudiante ? `${estudiante.apellido}, ${estudiante.nombre}` : '—'}
                      </p>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {estudiante ? estudiante.dni : '—'}</p>
                    </div>
                    <div className="flex items-center gap-xs flex-wrap shrink-0">
                      <button
                        onClick={() => abrirModalEdicion(inscripcion)}
                        disabled={!esCicloActualEfectivo}
                        title={esCicloActualEfectivo ? 'Cargar nota' : 'No se puede editar: ciclo lectivo histórico'}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                      </button>
                      <button
                        onClick={() => setInscripcionAEliminar(inscripcion.id)}
                        disabled={!esCicloActualEfectivo}
                        title={esCicloActualEfectivo ? 'Eliminar inscripción' : 'No se puede eliminar: ciclo lectivo histórico'}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap border-t border-outline-variant pt-3 font-body text-xs text-on-surface-variant">
                    <span>Inscripto el {formatFecha(inscripcion.fechaInscripcion)}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-surface-variant text-on-surface-variant">
                      Intentos: {intentosDe(inscripcion.estudianteDni)}
                    </span>
                    {inscripcion.nota !== null ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container text-on-secondary-container ${
                        inscripcion.nota < 4 ? 'opacity-50' : ''
                      }`}>
                        Nota: {inscripcion.nota}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-surface-variant text-on-surface-variant">
                        Sin calificar
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal nuevo / edición */}
      {modalAbierto && (
        <InscripcionMesaModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          egresadosDisponibles={egresadosDisponibles}
          estudianteActual={estudianteActual}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
          onToggleAsistio={handleToggleAsistio}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {inscripcionAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Inscripción"
          mensaje="¿Estás seguro de que querés eliminar esta inscripción a la mesa de examen? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setInscripcionAEliminar(null)}
        />
      )}

    </div>
  );
}

export default InscriptosMesaExamen;
