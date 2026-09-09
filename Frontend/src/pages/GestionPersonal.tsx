import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { usePersonalModal } from '../hooks/usePersonalModal';
import { useBusqueda } from '../hooks/useBusqueda';
import { useToast } from '../hooks/useToast';
import type { Personal } from '../types/Personal';
import type { Usuario } from '../types/Usuario';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import { nombreCurso, type Curso } from '../types/Curso';
import { cicloLectivoActual, type CicloLectivo } from '../types/CicloLectivo';
import type { BloqueHorario } from '../types/BloqueHorario';
import type { HorarioForm } from '../types/formTypes/personalFormTypes';
import { cargoDeMayorJerarquia, rolesDeCargos } from '../constants/cargoJerarquia';
import { resolverBloquesDeHorario } from '../constants/resolverBloquesAsignacion';
import { cursadasDisponiblesParaHorario } from '../constants/cursadasCobertura';
import PersonalModal from '../components/modals/PersonalModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoBadge from '../components/elements/EstadoBadge';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';
import { formatFecha } from '../constants/fechas';
import { normalizarBusqueda as norm } from '../constants/normalizarTexto';

function GestionPersonal() {
  const navigate = useNavigate();
  const { data: personalData, setData: setPersonal, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');
  const { setData: setUsuarios, loading: loadingUsuarios, error: errorUsuarios } = useFetch<Usuario[]>('/data/usuarios.json');
  const { data: horariosData, setData: setHorarios, loading: loadingHorarios, error: errorHorarios } = useFetch<AsignacionHoraria[]>('/data/asignacionesHorarias.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: cursosData,   loading: loadingCursos,   error: errorCursos   } = useFetch<Curso[]>('/data/cursos.json');
  const { data: ciclosData,   loading: loadingCiclos,   error: errorCiclos   } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { data: bloquesData, setData: setBloques, loading: loadingBloques,  error: errorBloques  } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');

  const personal = personalData ?? [];
  const horarios = horariosData ?? [];
  const cursadas = cursadasData ?? [];
  const materias = materiasData ?? [];
  const cursosLista = cursosData ?? [];
  const ciclos = ciclosData ?? [];
  const bloques = bloquesData ?? [];
  const cicloActualId = cicloLectivoActual(ciclos)?.id;

  const horariosDe = (personalId: string) => horarios.filter(h => h.personalId === personalId);
  const esDocente = (personalId: string) => horariosDe(personalId).some(h => h.tipoCargo === 'Profesor');
  // Fecha en que cesó su último cargo: la más reciente entre las fechas de fin de sus asignaciones.
  const fechaCese = (personalId: string): string | null => {
    const fechasFin = horariosDe(personalId).map(h => h.fechaFin).filter(f => f !== '');
    if (fechasFin.length === 0) return null;
    return fechasFin.reduce((max, f) => (f > max ? f : max));
  };

  const labelCursada = (cursadaId: number): string => {
    const cursada = cursadas.find(c => c.id === cursadaId);
    if (!cursada) return '—';
    const materia = materias.find(m => m.id === cursada.materiaId)?.nombre ?? '—';
    const curso = cursosLista.find(c => c.id === cursada.cursoId);
    return `${materia} — ${curso ? nombreCurso(curso) : '—'}`;
  };

  const [personalAEliminar, setPersonalAEliminar] = useState<string | null>(null);
  const {
    busquedaPersonal, setBusquedaPersonal,
    filtroDocencia, setFiltroDocencia,
    filtroEstadoPersonal, setFiltroEstadoPersonal,
  } = useBusqueda();
  const { mostrarToast } = useToast();

  const personalFiltrado = personal.filter(p => {
    const coincideTexto = norm(`${p.apellido} ${p.nombre}`).includes(norm(busquedaPersonal));
    const coincideDocencia =
      filtroDocencia === '' || (filtroDocencia === 'docente' ? esDocente(p.id) : !esDocente(p.id));
    const coincideEstado =
      filtroEstadoPersonal === '' || (filtroEstadoPersonal === 'activo' ? p.activo : !p.activo);
    return coincideTexto && coincideDocencia && coincideEstado;
  });

  const hayFiltrosActivos = Boolean(busquedaPersonal) || filtroDocencia !== '' || filtroEstadoPersonal !== 'activo';

  const {
    modalAbierto, modoEdicion, personalIdEditando,
    form, errores, erroresHorarios, erroresBloquesLibres,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, handleHorarioChange, agregarHorario, eliminarHorario,
    handleCursadaDeHorarioChange, handleToggleCursoHorario,
    handleBloqueLibreChange, handleDiasBloqueLibreChange, agregarBloqueLibre, eliminarBloqueLibre,
    validarForm,
  } = usePersonalModal();

  // Preceptor: cursos disponibles para asignar a cargo (independiente del ciclo lectivo).
  const cursoOpciones = cursosLista.filter(c => c.activo).map(c => ({ id: c.id, label: nombreCurso(c) }));

  // Profesor: elige una cursada (ocupa todos sus bloques) del ciclo lectivo actual que no esté
  // cubierta por otro profesor vigente.
  const cursadaOpciones = (horario: HorarioForm) => {
    const disponibles = cursadasDisponiblesParaHorario(
      cursadas, cicloActualId, horarios, bloques, personalIdEditando ?? undefined
    );
    // La cursada ya asignada a este horario debe seguir apareciendo aunque esté temporalmente cubierta.
    const actual = horario.cursadaId ? cursadas.find(c => c.id === Number(horario.cursadaId)) : undefined;
    const opciones = actual && !disponibles.some(c => c.id === actual.id) ? [...disponibles, actual] : disponibles;
    return opciones.map(c => ({ id: c.id, label: labelCursada(c.id) }));
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(personalData ?? [])) return;

    const datosPersonal = {
      apellido: form.apellido,
      nombre:   form.nombre,
      email:    form.email,
      dni:      Number(form.dni),
      cuil:     form.cuil,
      telefono: form.telefono,
    };

    const rolesAsignados = rolesDeCargos(form.horarios.map(h => h.tipoCargo as AsignacionHoraria['tipoCargo']));

    const bloquesNuevos: BloqueHorario[] = [];
    const proximoId = { valor: (bloquesData ?? []).length > 0 ? Math.max(...(bloquesData ?? []).map(b => b.id)) + 1 : 1 };
    const resolverBloques = (h: (typeof form.horarios)[number]) => resolverBloquesDeHorario(h, bloques, bloquesNuevos, proximoId);

    if (modoEdicion && personalIdEditando) {
      setPersonal(prev => (prev ?? []).map(p => p.id === personalIdEditando ? { ...p, ...datosPersonal } : p));

      const baseIdHorarioEdicion = (horariosData ?? []).length > 0 ? Math.max(...(horariosData ?? []).map(h => h.id)) + 1 : 1;
      setHorarios(prev => [
        ...(prev ?? []).filter(h => h.personalId !== personalIdEditando),
        ...form.horarios.map((h, idx) => ({
          id: baseIdHorarioEdicion + idx,
          personalId: personalIdEditando,
          bloqueHorarioIds: resolverBloques(h),
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
        if (rolesAsignados.length === 0) return lista.filter(u => u.personalId !== personalIdEditando);
        if (lista.some(u => u.personalId === personalIdEditando)) {
          return lista.map(u => u.personalId === personalIdEditando ? { ...u, roles: rolesAsignados } : u);
        }
        // Antes solo tenía cargos sin rol (ej. Auxiliar) y los nuevos cargos sí requieren uno.
        return [...lista, {
          id: `u-${lista.length + 1}`,
          personalId: personalIdEditando,
          roles: rolesAsignados,
          activo: true,
          contrasenia: `hash_placeholder_${personalIdEditando}`,
        }];
      });

      cerrarModal();
      mostrarToast(TOAST.PERSONAL_MODIFICADO);
    } else {
      const nuevoPersonalId = `per-${personal.length + 1}`;

      setPersonal(prev => [...(prev ?? []), {
        id: nuevoPersonalId,
        ...datosPersonal,
        activo: true,
        fechaIngreso: new Date().toISOString().slice(0, 10),
      }]);

      const baseIdHorarioNuevo = (horariosData ?? []).length > 0 ? Math.max(...(horariosData ?? []).map(h => h.id)) + 1 : 1;
      setHorarios(prev => [
        ...(prev ?? []),
        ...form.horarios.map((h, idx) => ({
          id: baseIdHorarioNuevo + idx,
          personalId: nuevoPersonalId,
          bloqueHorarioIds: resolverBloques(h),
          tipoCargo: h.tipoCargo as AsignacionHoraria['tipoCargo'],
          situacionRevista: h.situacionRevista as AsignacionHoraria['situacionRevista'],
          fechaIni: h.fechaIni,
          fechaFin: h.fechaFin,
          ...(h.tipoCargo === 'Preceptor' ? { cursoIds: h.cursoIds } : {}),
        })),
      ]);

      if (bloquesNuevos.length > 0) setBloques(prev => [...(prev ?? []), ...bloquesNuevos]);

      if (rolesAsignados.length > 0) {
        setUsuarios(prev => [...(prev ?? []), {
          id: `u-${(prev ?? []).length + 1}`,
          personalId: nuevoPersonalId,
          roles: rolesAsignados,
          activo: true,
          contrasenia: `hash_placeholder_${nuevoPersonalId}`,
        }]);
      }

      cerrarModal();
      mostrarToast(TOAST.PERSONAL_CREADO);
    }
  };

  // ── Eliminar (baja lógica, en cascada sobre el usuario asociado) ───────────

  const handleEliminar = () => {
    if (!personalAEliminar) return;
    setPersonal(prev => (prev ?? []).map(p => p.id === personalAEliminar ? { ...p, activo: false } : p));
    setUsuarios(prev => (prev ?? []).map(u => u.personalId === personalAEliminar ? { ...u, activo: false } : u));
    setPersonalAEliminar(null);
    mostrarToast(TOAST.PERSONAL_ELIMINADO);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const loading = loadingPersonal || loadingUsuarios || loadingHorarios
    || loadingCursadas || loadingMaterias || loadingCursos || loadingCiclos || loadingBloques;
  const error   = errorPersonal   || errorUsuarios   || errorHorarios
    || errorCursadas   || errorMaterias   || errorCursos   || errorCiclos   || errorBloques;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Gestión de Personal
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administra al personal institucional y los cargos que tiene asignados.
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nuevo Personal
        </button>
      </div>

      {/* Buscador */}
      <div className="flex flex-wrap items-center gap-4">
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
            value={busquedaPersonal}
            onChange={(e) => setBusquedaPersonal(e.target.value)}
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

        {/* Filtro Docentes / No Docentes */}
        <div className="flex items-center flex-wrap gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant">
          {([
            { valor: '',         label: 'Todos' },
            { valor: 'docente',  label: 'Docentes' },
            { valor: 'no-docente', label: 'No Docentes' },
          ] as const).map(opcion => (
            <button
              key={opcion.valor}
              onClick={() => setFiltroDocencia(opcion.valor)}
              className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-lg font-label text-label-md transition-colors duration-150 whitespace-nowrap ${
                filtroDocencia === opcion.valor
                  ? 'bg-secondary-container/80 text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        {/* Filtro Activos / Inactivos */}
        <div className="flex items-center flex-wrap gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant">
          {([
            { valor: 'activo',   label: 'Activos' },
            { valor: 'inactivo', label: 'Inactivos' },
            { valor: '',         label: 'Todos' },
          ] as const).map(opcion => (
            <button
              key={opcion.valor}
              onClick={() => setFiltroEstadoPersonal(opcion.valor)}
              className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-lg font-label text-label-md transition-colors duration-150 whitespace-nowrap ${
                filtroEstadoPersonal === opcion.valor
                  ? 'bg-secondary-container/80 text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contador */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {hayFiltrosActivos
          ? `${personalFiltrado.length} de ${personal.length} ${personal.length === 1 ? 'persona' : 'personas'} encontrada${personalFiltrado.length !== 1 ? 's' : ''}`
          : `${personal.length} ${personal.length === 1 ? 'persona' : 'personas'} en total`}
      </p>

      {/* Listado */}
      {personalFiltrado.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          {hayFiltrosActivos
            ? 'No se encontró personal que coincida con la búsqueda.'
            : 'No hay personal registrado.'}
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Personal</th>
                    <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Email</th>
                    <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Cargos</th>
                    <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estado</th>
                    <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Ingreso</th>
                    <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {personalFiltrado.map(p => {
                    const horariosDePersonal = horariosDe(p.id);
                    const tiposDePersonal = Array.from(new Set(horariosDePersonal.map(h => h.tipoCargo)));
                    const tipoPrincipal = cargoDeMayorJerarquia(tiposDePersonal.map(tipo => ({ tipo })))?.tipo;
                    return (
                      <tr key={p.id} className="hover:bg-surface-container-high transition-colors duration-150">
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{p.apellido}, {p.nombre}</td>
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{p.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {tiposDePersonal.length === 0 ? (
                              <span className="font-body text-body-sm text-on-surface-variant">—</span>
                            ) : (
                              tiposDePersonal.map(tipo => (
                                <span
                                  key={tipo}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium ${
                                    tipo === tipoPrincipal
                                      ? 'bg-primary text-background'
                                      : 'bg-secondary-container/50 text-on-secondary-container'
                                  }`}
                                  title={tipo === tipoPrincipal ? 'Cargo de mayor jerarquía' : undefined}
                                >
                                  {tipo}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <EstadoBadge estado={p.activo ? 'Activo' : 'Inactivo'} />
                            {!p.activo && (
                              <span className="font-body text-xs text-on-surface-variant whitespace-nowrap">
                                {fechaCese(p.id) ? `Cesó el ${formatFecha(fechaCese(p.id)!)}` : 'Cese sin fecha registrada'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface whitespace-nowrap">{formatFecha(p.fechaIngreso)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-xs">
                            <button
                              onClick={() => navigate(`/recursos-humanos/personal/${p.id}`)}
                              className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                              title="Ver detalle"
                            >
                              <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                            </button>
                            <button
                              onClick={() => abrirModalEdicion(p, horariosDePersonal, bloques)}
                              className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                            </button>
                            <button
                              onClick={() => setPersonalAEliminar(p.id)}
                              className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                              title="Eliminar"
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
                {personalFiltrado.length} {personalFiltrado.length === 1 ? 'persona' : 'personas'}
                {hayFiltrosActivos && ` encontrada${personalFiltrado.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {personalFiltrado.map(p => {
              const horariosDePersonal = horariosDe(p.id);
              const tiposDePersonal = Array.from(new Set(horariosDePersonal.map(h => h.tipoCargo)));
              const tipoPrincipal = cargoDeMayorJerarquia(tiposDePersonal.map(tipo => ({ tipo })))?.tipo;
              return (
                <div
                  key={p.id}
                  className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3"
                >
                  {/* Nombre + acciones: se apilan si no entran una al lado de la otra */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-body text-body-sm text-on-surface font-medium">{p.apellido}, {p.nombre}</p>
                        {!p.activo && <EstadoBadge estado="Inactivo" />}
                      </div>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">{p.email}</p>
                    </div>
                    <div className="flex items-center gap-xs flex-wrap shrink-0">
                      <button
                        onClick={() => navigate(`/recursos-humanos/personal/${p.id}`)}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        title="Ver detalle"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                      </button>
                      <button
                        onClick={() => abrirModalEdicion(p, horariosDePersonal, bloques)}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                      </button>
                      <button
                        onClick={() => setPersonalAEliminar(p.id)}
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Cargos + fecha de ingreso: siempre visibles, se acomodan solas */}
                  <div className="flex items-center justify-between gap-3 flex-wrap border-t border-outline-variant pt-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tiposDePersonal.length === 0 ? (
                        <span className="font-body text-body-sm text-on-surface-variant">Sin cargos asignados</span>
                      ) : (
                        tiposDePersonal.map(tipo => (
                          <span
                            key={tipo}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium ${
                              tipo === tipoPrincipal
                                ? 'bg-primary text-background'
                                : 'bg-secondary-container/50 text-on-secondary-container'
                            }`}
                            title={tipo === tipoPrincipal ? 'Cargo de mayor jerarquía' : undefined}
                          >
                            {tipo}
                          </span>
                        ))
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <p className="font-body text-xs text-on-surface-variant whitespace-nowrap">
                        Ingreso: {formatFecha(p.fechaIngreso)}
                      </p>
                      {!p.activo && (
                        <p className="font-body text-xs text-on-surface-variant whitespace-nowrap">
                          {fechaCese(p.id) ? `Cesó el ${formatFecha(fechaCese(p.id)!)}` : 'Cese sin fecha registrada'}
                        </p>
                      )}
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
        <PersonalModal
          modoEdicion={modoEdicion}
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

      {/* Modal confirmación de eliminación */}
      {personalAEliminar !== null && (
        <ConfirmEliminar
          titulo="Eliminar Personal"
          mensaje="¿Estás seguro de que querés eliminar a esta persona? Esta acción no se puede deshacer."
          onConfirmar={handleEliminar}
          onCancelar={() => setPersonalAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionPersonal;
