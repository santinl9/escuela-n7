import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { usePersonalModal } from '../hooks/usePersonalModal';
import { useToast } from '../hooks/useToast';
import type { Personal } from '../types/Personal';
import type { Usuario } from '../types/Usuario';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import { nombreCurso, type Curso } from '../types/Curso';
import { cicloLectivoActual, type CicloLectivo } from '../types/CicloLectivo';
import { nombreBloqueHorario, type BloqueHorario } from '../types/BloqueHorario';
import type { HorarioForm } from '../types/formTypes/personalFormTypes';
import { cargoDeMayorJerarquia, rolesDeCargos } from '../constants/cargoJerarquia';
import { resolverBloquesDeHorario } from '../constants/resolverBloquesAsignacion';
import { cursadasDisponiblesParaHorario } from '../constants/cursadasCobertura';
import { formatFecha } from '../constants/fechas';
import SeccionInfo from '../components/elements/SeccionInfo';
import CampoDetalle from '../components/elements/CampoDetalle';
import EstadoBadge from '../components/elements/EstadoBadge';
import PersonalModal from '../components/modals/PersonalModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';

function DetallePersonal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: personalData, setData: setPersonalData, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');
  const { data: usuariosData, setData: setUsuarios,      loading: loadingUsuarios, error: errorUsuarios } = useFetch<Usuario[]>('/data/usuarios.json');
  const { data: horariosData, setData: setHorarios,      loading: loadingHorarios, error: errorHorarios } = useFetch<AsignacionHoraria[]>('/data/asignacionesHorarias.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: cursosData,   loading: loadingCursos,   error: errorCursos   } = useFetch<Curso[]>('/data/cursos.json');
  const { data: ciclosData,   loading: loadingCiclos,   error: errorCiclos   } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { data: bloquesData, setData: setBloques, loading: loadingBloques,  error: errorBloques  } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');

  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [filtroVigenciaAsignacion, setFiltroVigenciaAsignacion] = useState<'' | 'vigente' | 'finalizada'>('');
  const { mostrarToast } = useToast();

  const {
    modalAbierto, form, errores, erroresHorarios, erroresBloquesLibres,
    abrirModalEdicion, cerrarModal,
    handleChange, handleHorarioChange, agregarHorario, eliminarHorario,
    handleCursadaDeHorarioChange, handleToggleCursoHorario,
    handleBloqueLibreChange, handleDiasBloqueLibreChange, agregarBloqueLibre, eliminarBloqueLibre,
    validarForm,
  } = usePersonalModal();

  const personal  = (personalData ?? []).find(p => p.id === id);
  const usuario   = (usuariosData ?? []).find(u => u.personalId === id);

  const cursadas = cursadasData ?? [];
  const materias = materiasData ?? [];
  const cursosLista = cursosData ?? [];
  // Preceptor: cursos disponibles para asignar a cargo (independiente del ciclo lectivo).
  const cursoOpciones = cursosLista.filter(c => c.activo).map(c => ({ id: c.id, label: nombreCurso(c) }));
  const ciclos = ciclosData ?? [];
  const bloques = bloquesData ?? [];
  const todosLosHorarios = horariosData ?? [];
  const cicloActualId = cicloLectivoActual(ciclos)?.id;
  // Vigentes primero (sin fecha de fin) y, dentro de cada grupo, de la más reciente a la más antigua.
  const horarios = (horariosData ?? []).filter(h => h.personalId === id).sort((a, b) => {
    const aVigente = a.fechaFin === '';
    const bVigente = b.fechaFin === '';
    if (aVigente !== bVigente) return aVigente ? -1 : 1;
    return b.fechaIni.localeCompare(a.fechaIni);
  });
  const horariosFiltrados = horarios.filter(h => {
    if (filtroVigenciaAsignacion === '') return true;
    const esVigente = h.fechaFin === '';
    return filtroVigenciaAsignacion === 'vigente' ? esVigente : !esVigente;
  });
  const cargoPrincipal = cargoDeMayorJerarquia(horarios.map(h => ({ id: h.id, tipo: h.tipoCargo })));

  const labelCursada = (cursadaId: number): string => {
    const cursada = cursadas.find(c => c.id === cursadaId);
    if (!cursada) return '—';
    const materia = materias.find(m => m.id === cursada.materiaId)?.nombre ?? '—';
    const curso = cursosLista.find(c => c.id === cursada.cursoId);
    return `${materia} — ${curso ? nombreCurso(curso) : '—'}`;
  };

  // Para Profesor se muestra "Materia Curso" (sin ciclo lectivo: puede ser titular por muchos
  // años) y el bloque horario debajo. El resto de los cargos, incluido Preceptor, se muestran
  // como cualquier cargo no docente: solo el día y horario del bloque.
  const renderBloque = (bloqueHorarioId: number, esDocente: boolean) => {
    const bloque = bloques.find(b => b.id === bloqueHorarioId);
    if (!bloque) return '—';
    if (esDocente && bloque.cursadaId !== undefined) {
      const cursada = cursadas.find(c => c.id === bloque.cursadaId);
      const materia = cursada ? materias.find(m => m.id === cursada.materiaId)?.nombre ?? '—' : '—';
      const curso = cursada ? cursosLista.find(c => c.id === cursada.cursoId) : undefined;
      return (
        <>
          <span className="block">{materia} {curso ? nombreCurso(curso) : '—'}</span>
          <span className="block font-normal text-on-surface-variant">{nombreBloqueHorario(bloque)}</span>
        </>
      );
    }
    return nombreBloqueHorario(bloque);
  };

  // Profesor: elige una cursada (ocupa todos sus bloques) del ciclo lectivo actual que no esté
  // cubierta por otro profesor vigente.
  const cursadaOpciones = (horario: HorarioForm) => {
    const disponibles = cursadasDisponiblesParaHorario(
      cursadas, cicloActualId, todosLosHorarios, bloques, personal?.id
    );
    // La cursada ya asignada a este horario debe seguir apareciendo aunque esté temporalmente cubierta.
    const actual = horario.cursadaId ? cursadas.find(c => c.id === Number(horario.cursadaId)) : undefined;
    const opciones = actual && !disponibles.some(c => c.id === actual.id) ? [...disponibles, actual] : disponibles;
    return opciones.map(c => ({ id: c.id, label: labelCursada(c.id) }));
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(personalData ?? []) || !personal) return;

    const rolesAsignados = rolesDeCargos(form.horarios.map(h => h.tipoCargo as AsignacionHoraria['tipoCargo']));

    setPersonalData(prev => (prev ?? []).map(p =>
      p.id === personal.id
        ? { ...p, apellido: form.apellido, nombre: form.nombre, email: form.email, dni: Number(form.dni), cuil: form.cuil, telefono: form.telefono }
        : p
    ));

    const bloquesNuevos: BloqueHorario[] = [];
    const proximoId = { valor: (bloquesData ?? []).length > 0 ? Math.max(...(bloquesData ?? []).map(b => b.id)) + 1 : 1 };

    const baseIdHorario = (horariosData ?? []).length > 0 ? Math.max(...(horariosData ?? []).map(h => h.id)) + 1 : 1;
    setHorarios(prev => [
      ...(prev ?? []).filter(h => h.personalId !== personal.id),
      ...form.horarios.map((h, idx) => ({
        id: baseIdHorario + idx,
        personalId: personal.id,
        bloqueHorarioIds: resolverBloquesDeHorario(h, bloques, bloquesNuevos, proximoId),
        tipoCargo: h.tipoCargo as AsignacionHoraria['tipoCargo'],
        situacionRevista: h.situacionRevista as AsignacionHoraria['situacionRevista'],
        fechaIni: h.fechaIni,
        fechaFin: h.fechaFin,
        ...(h.tipoCargo === 'Preceptor' ? { cursoIds: h.cursoIds } : {}),
      })),
    ]);

    if (bloquesNuevos.length > 0) setBloques(prev => [...(prev ?? []), ...bloquesNuevos]);
    setUsuarios(prev => {
      const lista = prev ?? [];
      // Auxiliar no tiene usuario asociado: si los cargos ya no incluyen ninguno con rol, se elimina su usuario.
      if (rolesAsignados.length === 0) return lista.filter(u => u.personalId !== personal.id);
      if (lista.some(u => u.personalId === personal.id)) {
        return lista.map(u => u.personalId === personal.id ? { ...u, roles: rolesAsignados } : u);
      }
      // Antes solo tenía cargos sin rol (ej. Auxiliar) y los nuevos cargos sí requieren uno.
      return [...lista, {
        id: `u-${lista.length + 1}`,
        personalId: personal.id,
        roles: rolesAsignados,
        activo: true,
        contrasenia: `hash_placeholder_${personal.id}`,
      }];
    });

    cerrarModal();
    mostrarToast(TOAST.PERSONAL_MODIFICADO);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingPersonal || loadingUsuarios || loadingHorarios || loadingCursadas || loadingMaterias || loadingCursos || loadingCiclos || loadingBloques;
  const conError = errorPersonal   || errorUsuarios   || errorHorarios   || errorCursadas   || errorMaterias   || errorCursos   || errorCiclos   || errorBloques;
  if (cargando || conError) return <EstadoCarga loading={cargando} error={conError} />;

  if (!personal) {
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
          <h1 className="font-headline text-headline-md font-bold text-on-surface">Personal no encontrado</h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            No existe una persona con el id {id}.
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer flex items-center gap-xs px-3 py-1.5 text-on-surface-variant font-label text-label-md rounded-lg hover:bg-surface-container-high transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[1.25rem]">arrow_back</span>
            Volver
          </button>

          <div className="flex items-center gap-sm flex-wrap">
            <button
              onClick={() => abrirModalEdicion(personal, horarios, bloques)}
              className="cursor-pointer flex items-center gap-xs px-4 py-2 border border-outline-variant text-on-surface-variant font-label text-label-md rounded-xl hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[1.25rem]">edit</span>
              Editar
            </button>
            <button
              onClick={() => setConfirmEliminar(true)}
              className="cursor-pointer flex items-center gap-xs px-4 py-2 border border-outline-variant text-on-surface-variant font-label text-label-md rounded-xl hover:bg-error-container hover:text-error hover:border-error transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[1.25rem]">delete</span>
              Eliminar
            </button>
          </div>
        </div>

        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            {personal.apellido}, {personal.nombre}
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            {cargoPrincipal ? cargoPrincipal.tipo : 'Sin cargo asignado'} · Ficha completa del personal
          </p>
        </div>
      </div>

      {/* Datos personales */}
      <SeccionInfo icono="person" titulo="Datos personales">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CampoDetalle label="Apellido"          value={personal.apellido} />
          <CampoDetalle label="Nombre"            value={personal.nombre} />
          <CampoDetalle label="DNI"               value={personal.dni} />
          <CampoDetalle label="CUIL"               value={personal.cuil} />
          <CampoDetalle label="Email"             value={personal.email} />
          <CampoDetalle label="Teléfono"          value={personal.telefono} />
          <CampoDetalle label="Fecha de ingreso"  value={formatFecha(personal.fechaIngreso)} />
        </div>
      </SeccionInfo>

      {/* Usuario asociado */}
      <SeccionInfo icono="account_circle" titulo="Usuario asociado">
        {usuario ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-label text-label-md text-on-surface-variant">Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {usuario.roles.map(rol => (
                  <span key={rol} className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                    {rol}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label text-label-md text-on-surface-variant">Estado</span>
              <EstadoBadge estado={usuario.activo ? 'Activo' : 'Inactivo'} />
            </div>
          </div>
        ) : (
          <p className="font-body text-body-sm text-on-surface-variant">
            Esta persona no tiene un usuario asociado.
          </p>
        )}
      </SeccionInfo>

      {/* Asignaciones horarias: cargo + situación de revista + bloque horario que ocupa; se editan desde "Editar" */}
      <SeccionInfo
        icono="work_history"
        titulo={`Asignaciones Horarias (${horarios.length})`}
        accionesHeader={horarios.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant">
            {([
              { valor: '',           label: 'Todas' },
              { valor: 'vigente',    label: 'Vigentes' },
              { valor: 'finalizada', label: 'Finalizadas' },
            ] as const).map(opcion => (
              <button
                key={opcion.valor}
                onClick={() => setFiltroVigenciaAsignacion(opcion.valor)}
                className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-lg font-label text-label-md transition-colors duration-150 whitespace-nowrap ${
                  filtroVigenciaAsignacion === opcion.valor
                    ? 'bg-secondary-container/80 text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        )}
      >
        {horarios.length === 0 ? (
          <p className="font-body text-body-sm text-on-surface-variant">
            Esta persona no tiene asignaciones registradas.
          </p>
        ) : (
          <>
            <p className="font-body text-body-sm text-on-surface-variant mb-4">
              {filtroVigenciaAsignacion
                ? `${horariosFiltrados.length} de ${horarios.length} ${horarios.length === 1 ? 'asignación' : 'asignaciones'}`
                : `${horarios.length} ${horarios.length === 1 ? 'asignación' : 'asignaciones'} en total`}
            </p>

            {horariosFiltrados.length === 0 ? (
              <p className="font-body text-body-sm text-on-surface-variant">
                No hay asignaciones que coincidan con el filtro seleccionado.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-outline-variant">
                {horariosFiltrados.map((horario, idx) => (
                  <div
                    key={horario.id}
                    className={`flex flex-col gap-4 ${idx > 0 ? 'pt-6' : ''} ${idx < horariosFiltrados.length - 1 ? 'pb-6' : ''}`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-label text-label-md text-on-surface-variant">Cargo</span>
                        <span
                          className={`w-fit inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium ${
                            horario.id === cargoPrincipal?.id ? 'bg-primary text-background' : 'bg-secondary-container text-on-secondary-container'
                          }`}
                        >
                          {horario.tipoCargo}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-label text-label-md text-on-surface-variant">
                          {horario.bloqueHorarioIds.length === 1 ? 'Bloque horario' : 'Bloques horarios'}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          {horario.bloqueHorarioIds.map(bloqueId => (
                            <span key={bloqueId} className="font-body text-body-sm text-on-surface font-medium">
                              {renderBloque(bloqueId, horario.tipoCargo === 'Profesor')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <CampoDetalle label="Situación de revista" value={horario.situacionRevista} />
                      <CampoDetalle label="Fecha de inicio" value={formatFecha(horario.fechaIni)} />
                      <CampoDetalle label="Fecha de fin" value={formatFecha(horario.fechaFin) || 'Vigente'} />
                    </div>

                    {/* Cursos a cargo — solo para Preceptor */}
                    {horario.tipoCargo === 'Preceptor' && horario.cursoIds && horario.cursoIds.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="font-label text-label-md text-on-surface-variant">
                          {horario.cursoIds.length === 1 ? 'Curso a cargo' : 'Cursos a cargo'}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          {horario.cursoIds.map(cursoId => {
                            const curso = cursosLista.find(c => c.id === cursoId);
                            return curso ? (
                              <span key={cursoId} className="font-body text-body-sm text-on-surface font-medium">
                                {nombreCurso(curso)}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </SeccionInfo>

      {/* Modal de edición */}
      {modalAbierto && (
        <PersonalModal
          modoEdicion={true}
          form={form}
          errores={errores}
          erroresHorarios={erroresHorarios}
          erroresBloquesLibres={erroresBloquesLibres}
          cursadaOpciones={cursadaOpciones}
          cursoOpciones={cursoOpciones}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
          onHorarioChange={handleHorarioChange}
          onAgregarHorario={agregarHorario}
          onEliminarHorario={eliminarHorario}
          onCursadaDeHorarioChange={handleCursadaDeHorarioChange}
          onToggleCursoHorario={handleToggleCursoHorario}
          onBloqueLibreChange={handleBloqueLibreChange}
          onDiasBloqueLibreChange={handleDiasBloqueLibreChange}
          onAgregarBloqueLibre={agregarBloqueLibre}
          onEliminarBloqueLibre={eliminarBloqueLibre}
        />
      )}

      {/* Confirmación de eliminación (baja lógica, en cascada sobre el usuario) */}
      {confirmEliminar && (
        <ConfirmEliminar
          titulo="Eliminar Personal"
          mensaje="¿Estás seguro de que querés eliminar a esta persona? Esta acción no se puede deshacer."
          onConfirmar={() => {
            setPersonalData(prev => (prev ?? []).map(p => p.id === personal.id ? { ...p, activo: false } : p));
            setUsuarios(prev => (prev ?? []).map(u => u.personalId === personal.id ? { ...u, activo: false } : u));
            mostrarToast(TOAST.PERSONAL_ELIMINADO);
            setConfirmEliminar(false);
            navigate(-1);
          }}
          onCancelar={() => setConfirmEliminar(false)}
        />
      )}

    </div>
  );
}

export default DetallePersonal;
