import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useEstudianteModal } from '../hooks/useEstudianteModal';
import type { Estudiante } from '../types/Estudiante';
import type { ContactoEmergencia } from '../types/ContactoEmergencia';
import type { Domicilio } from '../types/Domicilio';
import { evaluarElegibilidadCursada, promedioCargaHorariaCiclo, TOPE_INTENSIFICACIONES_SIMULTANEAS, type Inscripcion, type EstadoInscripcion, type TipoInscripcion } from '../types/Inscripcion';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import type { CargaNumerica } from '../types/CargaNumerica';
import type { CargaValorativa } from '../types/CargaValorativa';
import type { BloqueHorario } from '../types/BloqueHorario';
import type { Matricula } from '../types/Matricula';
import type { Aula } from '../types/Aula';
import { nombreCurso, cursoEfectivoDe, type Curso } from '../types/Curso';
import { cicloLectivoActual, nombreCicloLectivo, type CicloLectivo } from '../types/CicloLectivo';
import EstadoBadge from '../components/elements/EstadoBadge';
import SeccionInfo from '../components/elements/SeccionInfo';
import CampoDetalle from '../components/elements/CampoDetalle';
import EstudianteModal from '../components/modals/EstudianteModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import CertificadoModal, { type TipoCertificado } from '../components/modals/CertificadoModal';
import SeleccionCursadaInscripcionModal, { type CursadaSugerida } from '../components/modals/SeleccionCursadaInscripcionModal';
import type { CursadaOpcion } from '../components/modals/CargaIntensificacionModal';
import EstadoCarga from '../components/elements/EstadoCarga';
import { useToast } from '../hooks/useToast';
import { TOAST } from '../constants/toastMessages';
import { formatFecha } from '../constants/fechas';

const ESTADOS_INSCRIPCION: Array<EstadoInscripcion | 'Todos'> = [
  'Todos', 'Regular', 'Aprobada', 'Libre', 'Desaprobado', 'Discontinuo',
];

function DetalleEstudiante() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch<Estudiante[]>('/data/estudiantes.json');
  const { data: contactosData, setData: setContactos, loading: loadingContactos, error: errorContactos } = useFetch<ContactoEmergencia[]>('/data/contactosEmergencia.json');
  const { data: domiciliosData, loading: loadingDomicilios, error: errorDomicilios } = useFetch<Domicilio[]>('/data/domicilios.json');
  const { data: inscripcionesData, setData: setInscripciones, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: periodosCargaData, loading: loadingPeriodos, error: errorPeriodos } = useFetch<PeriodoCarga[]>('/data/periodosCarga.json');
  const { data: cargasNumericasData, loading: loadingCargasNum, error: errorCargasNum } = useFetch<CargaNumerica[]>('/data/cargasNumericas.json');
  const { data: cargasValorativasData, loading: loadingCargasVal, error: errorCargasVal } = useFetch<CargaValorativa[]>('/data/cargasValorativas.json');
  const { data: bloquesData, loading: loadingBloques, error: errorBloques } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { setData: setMatriculas, loading: loadingMatriculas, error: errorMatriculas } = useFetch<Matricula[]>('/data/matriculas.json');
  const { data: aulasData, loading: loadingAulas, error: errorAulas } = useFetch<Aula[]>('/data/aulas.json');

  const [estudiante, setEstudiante]           = useState<Estudiante | null>(null);
  const [idSincronizado, setIdSincronizado] = useState<string | undefined>(undefined);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [certificadoAbierto, setCertificadoAbierto] = useState<TipoCertificado | null>(null);
  const [filtroEstado, setFiltroEstado]       = useState<EstadoInscripcion | 'Todos'>('Todos');
  const [seleccionCursadaAbierta, setSeleccionCursadaAbierta] = useState(false);

  const contactos  = contactosData  ?? [];
  const domicilios = domiciliosData ?? [];
  const cicloActual = cicloLectivoActual(ciclosData ?? []);

  const { mostrarToast } = useToast();

  const {
    modalAbierto, form, errores, erroresContactos,
    abrirModalEdicion, cerrarModal,
    handleChange, handleContactoChange,
    agregarContacto, eliminarContacto,
    validarForm,
  } = useEstudianteModal();

  // Ajuste de estado durante el render (no en un efecto): sincroniza `estudiante`
  // con el registro fetcheado solo cuando cambia el id de la URL, ya que
  // luego `estudiante` se edita localmente (handleGuardar) de forma independiente.
  if (data && id !== idSincronizado) {
    setIdSincronizado(id);
    const found = data.find(est => String(est.id) === id);
    setEstudiante(found ?? null);
  }

  const contactosDelEstudiante = estudiante ? contactos.filter(c => c.estudianteDni === estudiante.dni) : [];
  const domicilioDelEstudiante = estudiante ? domicilios.find(d => d.estudianteDni === estudiante.dni) : undefined;

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(data ?? []) || !estudiante) return;

    const dniActual = estudiante.dni;

    setEstudiante(prev =>
      prev
        ? {
            ...prev,
            apellido:        form.apellido,
            nombre:          form.nombre,
            dni:             Number(form.dni),
            cuil:            form.cuil,
            email:           form.email,
            telefono:        form.telefono,
            fechaNacimiento: form.fechaNacimiento,
            folio:           Number(form.folio),
            libro:           Number(form.libro),
            nacionalidad:    form.nacionalidad,
          }
        : prev
    );

    setContactos(prev => {
      const restantes = (prev ?? []).filter(c => c.estudianteDni !== dniActual);
      const proximoId = restantes.length > 0 ? Math.max(...restantes.map(c => c.id)) + 1 : 1;
      return [
        ...restantes,
        ...form.contactos.map((c, idx) => ({ id: proximoId + idx, estudianteDni: dniActual, activo: true, ...c, dni: Number(c.dni), telefono: c.telefono })),
      ];
    });

    cerrarModal();
    mostrarToast(TOAST.ESTUDIANTE_MODIFICADO);
  };

  // ── Inscripciones enriquecidas ────────────────────────────────────────────

  // Historial completo: incluye inscripciones de cualquier ciclo lectivo, no solo el vigente
  // (cada una lleva su propio ciclo, derivado de la cursada, para poder distinguirlas). Se
  // ordenan del ciclo lectivo más reciente al más antiguo, y dentro de cada uno por fecha.
  const inscripcionesEnriquecidas = useMemo(() => {
    if (!estudiante) return [];
    const periodos  = periodosCargaData     ?? [];
    const cargasNum = cargasNumericasData   ?? [];
    const cargasVal = cargasValorativasData ?? [];
    const cursadas  = cursadasData  ?? [];
    const materias  = materiasData  ?? [];
    const cursos    = cursosData    ?? [];
    const ciclos    = ciclosData    ?? [];

    return (inscripcionesData ?? [])
      .filter(i => i.estudianteDni === estudiante.dni)
      .map(inscripcion => {
        const cursada = cursadas.find(c => c.id === inscripcion.cursadaId);
        const materia = cursada ? materias.find(m => m.id === cursada.materiaId) : undefined;
        const curso   = cursada ? cursos.find(c => c.id === cursada.cursoId)    : undefined;
        const ciclo   = cursada ? ciclos.find(c => c.id === cursada.cicloLectivoId) : undefined;

        let porcentajeAsistencia: number | null = null;
        if (cursada && cursada.cantidadClases > 0) {
          const hoy = new Date().toISOString().slice(0, 10);
          const periodosDelCiclo = periodos.filter(
            p => p.cicloLectivoId === cursada.cicloLectivoId && p.fechaIni <= hoy
          );
          const ultimoPeriodo = periodosDelCiclo.length > 0
            ? periodosDelCiclo.reduce((max, p) => p.fechaFin > max.fechaFin ? p : max)
            : null;
          if (ultimoPeriodo) {
            const cargaNum = cargasNum.find(c => c.inscripcionId === inscripcion.id && c.periodoCargaId === ultimoPeriodo.id);
            const cargaVal = cargasVal.find(c => c.inscripcionId === inscripcion.id && c.periodoCargaId === ultimoPeriodo.id);
            const inasistencias = cargaNum?.inasistencias ?? cargaVal?.inasistencias ?? null;
            if (inasistencias !== null) {
              porcentajeAsistencia = Math.round((inasistencias / cursada.cantidadClases) * 100);
            }
          }
        }

        return { inscripcion, cursada, materia, curso, ciclo, porcentajeAsistencia };
      })
      .sort((a, b) => {
        const cicloDiff = (b.ciclo?.fechaIni ?? '').localeCompare(a.ciclo?.fechaIni ?? '');
        return cicloDiff !== 0 ? cicloDiff : b.inscripcion.fecha.localeCompare(a.inscripcion.fecha);
      });
  }, [inscripcionesData, cursadasData, materiasData, cursosData, periodosCargaData, cargasNumericasData, cargasValorativasData, ciclosData, estudiante]);

  // Inscripciones vigentes (del ciclo lectivo actual) vs. historial (de ciclos anteriores):
  // se muestran en dos secciones separadas para no mezclar lo activo con lo histórico.
  const inscripcionesActuales = cicloActual
    ? inscripcionesEnriquecidas.filter(item => item.ciclo?.id === cicloActual.id)
    : [];
  const inscripcionesHistoricas = cicloActual
    ? inscripcionesEnriquecidas.filter(item => item.ciclo?.id !== cicloActual.id)
    : inscripcionesEnriquecidas;

  const inscripcionesFiltradas = filtroEstado === 'Todos'
    ? inscripcionesActuales
    : inscripcionesActuales.filter(item => item.inscripcion.estado === filtroEstado);

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loading || loadingContactos || loadingDomicilios ||
                   loadingInscripciones || loadingCursadas || loadingMaterias ||
                   loadingCursos || loadingPeriodos || loadingCargasNum || loadingCargasVal ||
                   loadingBloques || loadingCiclos || loadingMatriculas || loadingAulas;
  const conError = error || errorContactos || errorDomicilios ||
                   errorInscripciones || errorCursadas || errorMaterias ||
                   errorCursos || errorPeriodos || errorCargasNum || errorCargasVal ||
                   errorBloques || errorCiclos || errorMatriculas || errorAulas;
  if (cargando || conError) return <EstadoCarga loading={cargando} error={conError} />;

  if (!estudiante) {
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
            No existe un estudiante con el id {id}.
          </p>
        </div>
      </div>
    );
  }

  // ── Inscribir a una cursada (misma elegibilidad que GestionInscripcionesCursada,
  // pero con el estudiante fijo y la cursada como variable) ──────────────────

  const bloques = bloquesData ?? [];
  const cursadasTodas = cursadasData ?? [];
  const cursos = cursosData ?? [];
  const aulas = aulasData ?? [];

  const inscripcionesDelEstudiante = (inscripcionesData ?? []).filter(i => i.estudianteDni === estudiante.dni);

  // Solo cursadas del ciclo lectivo vigente: no tiene sentido inscribirse a una histórica.
  const cursadasDelCicloActual = cicloActual ? cursadasTodas.filter(c => c.cicloLectivoId === cicloActual.id) : [];
  const promedioCargaHoraria = promedioCargaHorariaCiclo(cursadasDelCicloActual, bloques);

  const evaluacionesCursadas = cicloActual
    ? cursadasDelCicloActual.map(cursada => ({
        cursada,
        elegibilidad: evaluarElegibilidadCursada({
          estudianteDni: estudiante.dni,
          cursada,
          inscripciones: inscripcionesData ?? [],
          cursadas: cursadasTodas,
          bloques,
          aulas,
          cursos,
          cicloLectivoId: cicloActual.id,
          promedioCargaHoraria,
        }),
      }))
    : [];

  // El cupo de intensificación es una propiedad del estudiante, no de la cursada: es el mismo
  // para todas las filas de evaluacionesCursadas, así que alcanza con tomarlo de la primera.
  const intensificacionesRestantes = evaluacionesCursadas[0]?.elegibilidad.intensificacionesRestantes ?? TOPE_INTENSIFICACIONES_SIMULTANEAS;

  const cursadasSugeridas: { cursada: CursadaSugerida; motivo?: string; soloOyente?: string }[] = evaluacionesCursadas.map(({ cursada, elegibilidad }) => {
    const materia = (materiasData ?? []).find(m => m.id === cursada.materiaId);
    const curso = cursos.find(c => c.id === cursada.cursoId);
    return {
      cursada: {
        id: cursada.id,
        materiaNombre: materia?.nombre ?? '—',
        cursoNombre: curso ? nombreCurso(curso) : '—',
        tipo: cursada.tipo,
        cupoAulaRestante: elegibilidad.cupoAulaRestante,
        cargaHorariaAlta: elegibilidad.cargaHorariaAlta,
        turnoDistinto: elegibilidad.turnoDistinto,
      },
      motivo: elegibilidad.motivo,
      soloOyente: elegibilidad.soloOyente,
    };
  });

  // Cursadas donde se podría intensificar la materia de `cursadaId` (misma materia, mismo
  // ciclo lectivo, en cualquier curso): puede ser distinta de la cursada de la inscripción.
  const cursadaIntensificacionOpcionesDe = (cursadaId: number): CursadaOpcion[] => {
    const cursadaBase = cursadasTodas.find(c => c.id === cursadaId);
    if (!cursadaBase) return [];
    return cursadasTodas
      .filter(c => c.materiaId === cursadaBase.materiaId && c.cicloLectivoId === cursadaBase.cicloLectivoId)
      .map(c => {
        const materiaDeC = (materiasData ?? []).find(m => m.id === c.materiaId);
        const cursoDeC = cursos.find(cur => cur.id === c.cursoId);
        return { id: c.id, materiaNombre: materiaDeC?.nombre ?? '—', cursoNombre: cursoDeC ? nombreCurso(cursoDeC) : '—' };
      });
  };

  const handleInscribirCursada = ({ cursadaId, tipo, cursadaIntensificacionId }: { cursadaId: number; tipo: TipoInscripcion; cursadaIntensificacionId?: number }) => {
    const hoy = new Date().toISOString().slice(0, 10);
    const listaInscripciones = inscripcionesData ?? [];
    const proximoId = listaInscripciones.length > 0 ? Math.max(...listaInscripciones.map(i => i.id)) + 1 : 1;
    const nuevaInscripcion: Inscripcion = {
      id: proximoId,
      estudianteDni: estudiante.dni,
      cursadaId,
      tipo,
      cursadaIntensificacionId: cursadaIntensificacionId ?? null,
      estado: 'Regular',
      fecha: hoy,
      notaFinal: null,
    };
    setInscripciones(prev => [...(prev ?? []), nuevaInscripcion]);

    const cursoMasAlto = cursoEfectivoDe(estudiante.dni, [...inscripcionesDelEstudiante, nuevaInscripcion], cursadasTodas, cursos, cicloActual?.id);
    if (cursoMasAlto) {
      setMatriculas(prevMatriculas => {
        const resultado = prevMatriculas ?? [];
        const matriculaActual = resultado.find(m => m.estudianteDni === estudiante.dni);
        if (matriculaActual && matriculaActual.cursoId === cursoMasAlto.id) return resultado;
        const restantes = resultado.filter(m => m.estudianteDni !== estudiante.dni);
        const proximoIdMatricula = restantes.length > 0 ? Math.max(...restantes.map(m => m.id)) + 1 : 1;
        return [...restantes, { id: proximoIdMatricula, estudianteDni: estudiante.dni, cursoId: cursoMasAlto.id, fecha: hoy }];
      });
    }

    setSeleccionCursadaAbierta(false);
    mostrarToast(TOAST.INSCRIPCION_CREADA);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex flex-col gap-3">

        {/* Fila superior: Volver (izq) | Editar + Eliminar (der) */}
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
              onClick={() => abrirModalEdicion(estudiante, contactosDelEstudiante, domicilioDelEstudiante)}
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

        {/* Nombre y subtítulo */}
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            {estudiante.apellido}, {estudiante.nombre}
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            DNI #{estudiante.dni} · Ficha completa del estudiante
          </p>
        </div>

      </div>

      {/* Datos personales */}
      <SeccionInfo icono="person" titulo="Datos personales">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CampoDetalle label="Apellido"            value={estudiante.apellido} />
          <CampoDetalle label="Nombre"              value={estudiante.nombre} />
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

      {/* Datos de legajo y domicilio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <SeccionInfo icono="folder_open" titulo="Datos administrativos">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <CampoDetalle label="Folio" value={estudiante.folio} />
            <CampoDetalle label="DNI"   value={estudiante.dni} />
            <CampoDetalle label="Libro" value={estudiante.libro} />
          </div>
        </SeccionInfo>

        {domicilioDelEstudiante && (
          <SeccionInfo icono="home" titulo="Domicilio">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CampoDetalle label="Calle"  value={domicilioDelEstudiante.calle} />
              <CampoDetalle label="Número" value={domicilioDelEstudiante.numero} />
            </div>
          </SeccionInfo>
        )}
      </div>

      {/* Contactos de emergencia */}
      <SeccionInfo icono="emergency" titulo={`Contactos de emergencia (${contactosDelEstudiante.length})`}>
        <div className="flex flex-col divide-y divide-outline-variant">
          {contactosDelEstudiante.map((contacto, idx) => (
            <div
              key={contacto.id}
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${idx > 0 ? 'pt-6' : ''} ${idx < contactosDelEstudiante.length - 1 ? 'pb-6' : ''}`}
            >
              {contactosDelEstudiante.length > 1 && (
                <div className="col-span-full">
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-wide">
                    Contacto {idx + 1}
                  </span>
                </div>
              )}
              <CampoDetalle label="Nombre"   value={contacto.nombre} />
              <CampoDetalle label="Apellido" value={contacto.apellido} />
              <CampoDetalle label="DNI"      value={contacto.dni} />
              <CampoDetalle label="CUIL"     value={contacto.cuil} />
              <CampoDetalle label="Email"    value={contacto.email} />
              <CampoDetalle label="Teléfono" value={contacto.telefono} />
            </div>
          ))}
        </div>
      </SeccionInfo>

      {/* Inscripciones vigentes: solo las del ciclo lectivo actual */}
      <SeccionInfo
        icono="school"
        titulo={`Inscripciones (${inscripcionesActuales.length})`}
        accionesHeader={
          <div className="flex items-center justify-between gap-sm flex-wrap">
            <div className="flex items-center gap-xs flex-wrap">
              {ESTADOS_INSCRIPCION.map(estado => (
                <button
                  key={estado}
                  type="button"
                  onClick={() => setFiltroEstado(estado)}
                  className={`cursor-pointer px-3 py-1 rounded-full font-label text-xs font-medium transition-colors duration-150 ${
                    filtroEstado === estado
                      ? 'bg-primary text-background'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {estado}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSeleccionCursadaAbierta(true)}
              className="cursor-pointer flex items-center gap-xs px-3 py-1.5 bg-primary text-background font-label text-label-md rounded-lg hover:opacity-90 transition-all duration-200 shrink-0"
            >
              <span className="material-symbols-outlined text-[1.1rem]">person_add</span>
              Inscribir
            </button>
          </div>
        }
      >
        {inscripcionesFiltradas.length === 0 ? (
          <p className="font-body text-body-sm text-on-surface-variant">
            {filtroEstado === 'Todos'
              ? cicloActual
                ? 'Sin inscripciones registradas en el ciclo lectivo actual.'
                : 'No hay un ciclo lectivo activo configurado.'
              : `Sin inscripciones con estado "${filtroEstado}".`}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-outline-variant">
            {inscripcionesFiltradas.map(({ inscripcion, cursada, materia, curso, porcentajeAsistencia }) => (
              <div
                key={inscripcion.id}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 py-4 first:pt-0 last:pb-0 items-start"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Cursada</span>
                  <span className="font-body text-body-sm text-on-surface font-medium">
                    {materia?.nombre ?? '—'}{curso ? ` · ${nombreCurso(curso)}` : ''}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Tipo de cursada</span>
                  <span className={`w-fit px-2.5 py-1 rounded-full font-label text-xs font-medium ${
                    cursada?.tipo === 'Extracurricular'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface'
                  }`}>
                    {cursada?.tipo ?? '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Estado</span>
                  <EstadoBadge estado={inscripcion.estado} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Asistencia</span>
                  <span className="font-body text-body-sm text-on-surface font-medium">
                    {porcentajeAsistencia !== null ? `${porcentajeAsistencia}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SeccionInfo>

      {/* Historial: inscripciones de ciclos lectivos anteriores al actual */}
      <SeccionInfo
        icono="history"
        titulo={`Historial de Inscripciones (${inscripcionesHistoricas.length})`}
      >
        {inscripcionesHistoricas.length === 0 ? (
          <p className="font-body text-body-sm text-on-surface-variant">
            Sin inscripciones registradas en ciclos lectivos anteriores.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-outline-variant">
            {inscripcionesHistoricas.map(({ inscripcion, cursada, materia, curso, ciclo, porcentajeAsistencia }) => (
              <div
                key={inscripcion.id}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-4 py-4 first:pt-0 last:pb-0 items-start"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Cursada</span>
                  <span className="font-body text-body-sm text-on-surface font-medium">
                    {materia?.nombre ?? '—'}{curso ? ` · ${nombreCurso(curso)}` : ''}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Ciclo lectivo</span>
                  <span className="font-body text-body-sm text-on-surface font-medium">
                    {ciclo ? nombreCicloLectivo(ciclo) : '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Tipo de cursada</span>
                  <span className={`w-fit px-2.5 py-1 rounded-full font-label text-xs font-medium ${
                    cursada?.tipo === 'Extracurricular'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-high text-on-surface'
                  }`}>
                    {cursada?.tipo ?? '—'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Estado</span>
                  <EstadoBadge estado={inscripcion.estado} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-label text-label-md text-on-surface-variant">Asistencia</span>
                  <span className="font-body text-body-sm text-on-surface font-medium">
                    {porcentajeAsistencia !== null ? `${porcentajeAsistencia}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SeccionInfo>

      {/* Certificados y constancias */}
      <div className="flex flex-col gap-3 border-t border-outline-variant pt-6">
        <h2 className="font-label text-label-md font-bold text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[1.25rem]">description</span>
          Certificados y Constancias
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCertificadoAbierto('regular')}
            className="cursor-pointer flex items-center gap-xs px-4 py-2 border border-outline-variant text-on-surface-variant font-label text-label-md rounded-xl hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[1.25rem]">verified</span>
            Generar certificado de alumno regular
          </button>
          <button
            onClick={() => setCertificadoAbierto('analitico')}
            className="cursor-pointer flex items-center gap-xs px-4 py-2 border border-outline-variant text-on-surface-variant font-label text-label-md rounded-xl hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[1.25rem]">pending_actions</span>
            Generar constancia de analítico en trámite
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {modalAbierto && (
        <EstudianteModal
          modoEdicion={true}
          form={form}
          errores={errores}
          erroresContactos={erroresContactos}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
          onContactoChange={handleContactoChange}
          onAgregarContacto={agregarContacto}
          onEliminarContacto={eliminarContacto}
        />
      )}

      {/* Confirmación de eliminación (baja lógica) */}
      {confirmEliminar && (
        <ConfirmEliminar
          onConfirmar={() => {
            setEstudiante(prev => prev ? { ...prev, activo: false } : prev);
            mostrarToast(TOAST.ESTUDIANTE_ELIMINADO);
            setConfirmEliminar(false);
            navigate(-1);
          }}
          onCancelar={() => setConfirmEliminar(false)}
        />
      )}

      {/* Certificado / constancia a imprimir */}
      {certificadoAbierto && (
        <CertificadoModal
          tipo={certificadoAbierto}
          estudiante={estudiante}
          onClose={() => setCertificadoAbierto(null)}
        />
      )}

      {/* Inscribir a una cursada */}
      {seleccionCursadaAbierta && (
        <SeleccionCursadaInscripcionModal
          estudianteNombre={`${estudiante.apellido}, ${estudiante.nombre}`}
          cursadas={cursadasSugeridas}
          cursadaIntensificacionOpcionesDe={cursadaIntensificacionOpcionesDe}
          intensificacionesRestantes={intensificacionesRestantes}
          onClose={() => setSeleccionCursadaAbierta(false)}
          onInscribir={handleInscribirCursada}
        />
      )}

    </div>
  );
}

export default DetalleEstudiante;
