import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { useBusqueda } from '../hooks/useBusqueda';
import { normalizarBusqueda as norm } from '../constants/normalizarTexto';
import { nombreCurso, cursoEfectivoDe, type Curso } from '../types/Curso';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { EstudianteListado } from '../types/EstudianteListado';
import type { Estudiante } from '../types/Estudiante';
import type { Matricula } from '../types/Matricula';
import { evaluarElegibilidadCursada, promedioCargaHorariaCiclo, estadoPorNotaFinal, type Inscripcion, type TipoInscripcion } from '../types/Inscripcion';
import type { BloqueHorario } from '../types/BloqueHorario';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import type { CargaValorativa } from '../types/CargaValorativa';
import type { CargaNumerica } from '../types/CargaNumerica';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import type { Personal } from '../types/Personal';
import type { Aula } from '../types/Aula';
import { cicloLectivoActual, type CicloLectivo } from '../types/CicloLectivo';
import EstadoBadge from '../components/elements/EstadoBadge';
import SeleccionEstudianteInscripcionModal from '../components/modals/SeleccionEstudianteInscripcionModal';
import type { CursadaOpcion } from '../components/modals/CargaIntensificacionModal';
import DetalleInscripcionModal from '../components/modals/DetalleInscripcionModal';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';
import { diasHasta } from '../constants/fechas';
import { SOLO_NUMEROS } from '../constants/regexPatterns';
import { abreviarPeriodo } from '../constants/periodoCargaForm';
import { asignacionQueCubreCursada, asignacionPreceptorDeCurso } from '../constants/cursadasCobertura';

function GestionInscripcionesCursada() {
  const { cursoId, cursadaId } = useParams<{ cursoId: string; cursadaId: string }>();
  const navigate = useNavigate();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
  const { data: estudiantesCompletosData, loading: loadingEstudiantesCompletos, error: errorEstudiantesCompletos } = useFetch<Estudiante[]>('/data/estudiantes.json');
  const { setData: setMatriculas, loading: loadingMatriculas, error: errorMatriculas } = useFetch<Matricula[]>('/data/matriculas.json');
  const { data: inscripcionesData, setData: setInscripciones, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { data: bloquesData, loading: loadingBloques, error: errorBloques } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');
  const { data: ciclosData, loading: loadingCiclos, error: errorCiclos } = useFetch<CicloLectivo[]>('/data/ciclosLectivos.json');
  const { data: periodosData, loading: loadingPeriodos, error: errorPeriodos } = useFetch<PeriodoCarga[]>('/data/periodosCarga.json');
  const { data: cargasValorativasData, loading: loadingCV, error: errorCV } = useFetch<CargaValorativa[]>('/data/cargasValorativas.json');
  const { data: cargasNumericasData, loading: loadingCN, error: errorCN } = useFetch<CargaNumerica[]>('/data/cargasNumericas.json');
  const { data: aulasData, loading: loadingAulas, error: errorAulas } = useFetch<Aula[]>('/data/aulas.json');
  const { data: horariosData, loading: loadingHorarios, error: errorHorarios } = useFetch<AsignacionHoraria[]>('/data/asignacionesHorarias.json');
  const { data: personalData, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');

  const cursos = cursosData ?? [];
  const cursadas = cursadasData ?? [];
  const materias = materiasData ?? [];
  const estudiantes = estudiantesData ?? [];
  const estudiantesCompletos = estudiantesCompletosData ?? [];
  const inscripciones = inscripcionesData ?? [];
  const bloques = bloquesData ?? [];
  const ciclos = ciclosData ?? [];
  const periodos = periodosData ?? [];
  const cargasValorativas = cargasValorativasData ?? [];
  const cargasNumericas = cargasNumericasData ?? [];
  const aulas = aulasData ?? [];
  const horarios = horariosData ?? [];
  const personal = personalData ?? [];

  const curso = cursos.find(c => String(c.id) === cursoId);
  const cursada = cursadas.find(c => String(c.id) === cursadaId && String(c.cursoId) === cursoId);

  // Profesor a cargo: la asignación horaria de tipo Profesor, vigente, cuyos bloques cubren
  // esta cursada (mismo criterio que se usa para no permitir cursadas duplicadas al asignar).
  const asignacionProfesor = cursada ? asignacionQueCubreCursada(cursada.id, horarios, bloques) : undefined;
  const profesorACargo = asignacionProfesor ? personal.find(p => p.id === asignacionProfesor.personalId) : undefined;

  // Preceptor a cargo del curso de esta cursada (a diferencia del profesor, está a cargo de
  // uno o más cursos enteros, no de una cursada puntual).
  const asignacionPreceptor = curso ? asignacionPreceptorDeCurso(curso.id, horarios) : undefined;
  const preceptorACargo = asignacionPreceptor ? personal.find(p => p.id === asignacionPreceptor.personalId) : undefined;

  const esCicloActualEfectivo = cursada !== undefined && cursada.cicloLectivoId === cicloLectivoActual(ciclos)?.id;

  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';
  const estudianteDe = (dni: number) => estudiantes.find(e => e.dni === dni);
  const estudianteCompletoDe = (dni: number) => estudiantesCompletos.find(e => e.dni === dni);

  const inscripcionesDeCursada = cursada ? inscripciones.filter(i => i.cursadaId === cursada.id) : [];

  // Todos los períodos de carga del ciclo lectivo de esta cursada, del más reciente al más antiguo.
  const periodosDeCiclo = cursada
    ? [...periodos].filter(p => p.cicloLectivoId === cursada.cicloLectivoId).sort((a, b) => b.fechaIni.localeCompare(a.fechaIni))
    : [];

  // Columnas de notas del listado: solo períodos ya concluidos (los mismos que se ven en el
  // detalle), del más antiguo al más reciente para que las columnas se agreguen hacia la derecha.
  const periodosTabla = [...periodosDeCiclo]
    .filter(periodo => diasHasta(periodo.fechaFin) < 0)
    .sort((a, b) => a.fechaIni.localeCompare(b.fechaIni));

  const cargaDeEnPeriodo = (inscripcionId: number, periodo?: PeriodoCarga): CargaValorativa | CargaNumerica | undefined => {
    if (!periodo) return undefined;
    return periodo.tipo === 'Numerica'
      ? cargasNumericas.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id)
      : cargasValorativas.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id);
  };

  // El % de asistencia se calcula con las inasistencias del período de carga más reciente
  // que tenga datos cargados, sobre el total de clases dictadas en la cursada.
  const calcularPorcentajeAsistencia = (inscripcionId: number): number | null => {
    if (!cursada || cursada.cantidadClases <= 0) return null;
    const ultimaCarga = periodosDeCiclo
      .map(periodo => cargaDeEnPeriodo(inscripcionId, periodo))
      .find(carga => carga?.inasistencias != null);
    if (!ultimaCarga || ultimaCarga.inasistencias == null) return null;
    const asistencias = cursada.cantidadClases - ultimaCarga.inasistencias;
    return Math.round((asistencias / cursada.cantidadClases) * 100);
  };

  const { busquedaInscripciones, setBusquedaInscripciones } = useBusqueda();
  const inscripcionesFiltradas = inscripcionesDeCursada.filter(i => {
    const estudiante = estudianteDe(i.estudianteDni);
    return estudiante !== undefined && norm(`${estudiante.apellido} ${estudiante.nombre}`).includes(norm(busquedaInscripciones));
  });

  // ── Elegibilidad para inscribirse a esta cursada ────────────────────────────
  // La matriculación ya no es un requisito previo: se deriva automáticamente
  // de las inscripciones del estudiante (ver handleInscribirSeleccionados). Toda la lógica de
  // elegibilidad (cupo de aula, topes de inscripciones/intensificación, horario, avisos de
  // carga horaria y turno) vive en evaluarElegibilidadCursada para no duplicarla con
  // DetalleEstudiante.tsx, que resuelve el mismo problema con la cursada como variable.
  const cursadasDelCicloDeLaCursada = cursada ? cursadas.filter(c => c.cicloLectivoId === cursada.cicloLectivoId) : [];
  const promedioCargaHoraria = promedioCargaHorariaCiclo(cursadasDelCicloDeLaCursada, bloques);
  const aulaDeCursada = cursada ? aulas.find(a => a.id === cursada.aulaId) : undefined;
  const cupoAulaRestante = aulaDeCursada ? aulaDeCursada.capacidad - inscripcionesDeCursada.length : Infinity;

  const estudiantesConDisponibilidad = !cursada ? [] : estudiantes.map(est => {
    const elegibilidad = evaluarElegibilidadCursada({
      estudianteDni: est.dni,
      cursada,
      inscripciones,
      cursadas,
      bloques,
      aulas,
      cursos,
      cicloLectivoId: cursada.cicloLectivoId,
      promedioCargaHoraria,
    });
    return { estudiante: est, ...elegibilidad };
  });

  const [seleccionAbierta, setSeleccionAbierta] = useState(false);
  const { mostrarToast } = useToast();

  // ── Inscribir seleccionados ─────────────────────────────────────────────────

  // Cursadas donde se podría intensificar la materia de esta cursada (misma materia, mismo
  // ciclo lectivo, en cualquier curso): la cursada de destino es la misma para todo el lote.
  const cursadaIntensificacionOpciones: CursadaOpcion[] = cursada
    ? cursadas
        .filter(c => c.materiaId === cursada.materiaId && c.cicloLectivoId === cursada.cicloLectivoId)
        .map(c => {
          const materiaDeC = materias.find(m => m.id === c.materiaId);
          const cursoDeC = cursos.find(cur => cur.id === c.cursoId);
          return { id: c.id, materiaNombre: materiaDeC?.nombre ?? '—', cursoNombre: cursoDeC ? nombreCurso(cursoDeC) : '—' };
        })
    : [];

  const handleInscribirSeleccionados = (seleccion: { id: number; tipo: TipoInscripcion; cursadaIntensificacionId?: number }[]) => {
    if (!cursada || seleccion.length === 0 || !esCicloActualEfectivo) return;

    const hoy = new Date().toISOString().slice(0, 10);
    let proximoId = (inscripcionesData ?? []).length > 0 ? Math.max(...(inscripcionesData ?? []).map(i => i.id)) + 1 : 1;
    const nuevasInscripciones: Inscripcion[] = seleccion
      .map(({ id, tipo, cursadaIntensificacionId }) => {
        const dni = estudiantes.find(e => e.id === id)?.dni;
        return dni === undefined ? null : { dni, tipo, cursadaIntensificacionId };
      })
      .filter((s): s is { dni: number; tipo: TipoInscripcion; cursadaIntensificacionId: number | undefined } => s !== null)
      .map(({ dni, tipo, cursadaIntensificacionId }) => ({
        id: proximoId++,
        estudianteDni: dni,
        cursadaId: cursada.id,
        tipo,
        cursadaIntensificacionId: cursadaIntensificacionId ?? null,
        estado: 'Regular',
        fecha: hoy,
        notaFinal: null,
      }));
    setInscripciones(prev => [...(prev ?? []), ...nuevasInscripciones]);

    // La matriculación de cada estudiante se deriva del curso más alto entre las cursadas del
    // ciclo lectivo actual a las que quede inscripto (incluyendo esta nueva inscripción). Solo
    // se actualiza la fecha de matriculación si ese curso más alto cambia.
    setMatriculas(prevMatriculas => {
      let resultado = prevMatriculas ?? [];
      for (const nuevaInscripcion of nuevasInscripciones) {
        const inscripcionesDelEstudiante = [
          ...inscripciones.filter(i => i.estudianteDni === nuevaInscripcion.estudianteDni),
          nuevaInscripcion,
        ];
        const cursoMasAlto = cursoEfectivoDe(nuevaInscripcion.estudianteDni, inscripcionesDelEstudiante, cursadas, cursos, cicloLectivoActual(ciclos)?.id);
        if (!cursoMasAlto) continue;

        const matriculaActual = resultado.find(m => m.estudianteDni === nuevaInscripcion.estudianteDni);
        if (!matriculaActual || matriculaActual.cursoId !== cursoMasAlto.id) {
          const restantes = resultado.filter(m => m.estudianteDni !== nuevaInscripcion.estudianteDni);
          const proximoIdMatricula = restantes.length > 0 ? Math.max(...restantes.map(m => m.id)) + 1 : 1;
          resultado = [...restantes, { id: proximoIdMatricula, estudianteDni: nuevaInscripcion.estudianteDni, cursoId: cursoMasAlto.id, fecha: hoy }];
        }
      }
      return resultado;
    });

    setSeleccionAbierta(false);
    mostrarToast(TOAST.INSCRIPCION_CREADA);
  };

  // ── Detalle de inscripto (notas por período, no solo la final) ──────────────

  const [detalleAbierto, setDetalleAbierto] = useState<number | null>(null);
  const [notaFinalInput, setNotaFinalInput] = useState('');
  const [errorNotaFinal, setErrorNotaFinal] = useState<string | undefined>(undefined);

  const inscripcionEnDetalle = inscripcionesDeCursada.find(i => i.id === detalleAbierto);
  const estudianteEnDetalle = inscripcionEnDetalle ? estudianteCompletoDe(inscripcionEnDetalle.estudianteDni) : undefined;

  const abrirDetalle = (inscripcion: Inscripcion) => {
    setDetalleAbierto(inscripcion.id);
    setNotaFinalInput(inscripcion.notaFinal != null ? String(inscripcion.notaFinal) : '');
    setErrorNotaFinal(undefined);
  };

  const cerrarDetalle = () => {
    setDetalleAbierto(null);
    setNotaFinalInput('');
    setErrorNotaFinal(undefined);
  };

  const handleGuardarNotaFinal = () => {
    if (!inscripcionEnDetalle) return;

    if (notaFinalInput !== '') {
      if (!SOLO_NUMEROS.test(notaFinalInput) || Number(notaFinalInput) < 1 || Number(notaFinalInput) > 10) {
        setErrorNotaFinal('La nota debe ser entre 1 y 10');
        return;
      }
    }

    const notaFinal = notaFinalInput === '' ? null : Number(notaFinalInput);
    setInscripciones(prev => (prev ?? []).map(i => {
      if (i.id !== inscripcionEnDetalle.id) return i;
      // Esta pantalla es la única que permite corregir una nota final ya cargada (ver
      // soloLecturaNotaFinal en Inscriptos de Cursada); si se corrige, el estado se recalcula
      // con el umbral vigente al momento de guardar (diciembre/enero/febrero: 4, resto: 7).
      const estado = notaFinal !== null ? estadoPorNotaFinal(notaFinal) : i.estado;
      return { ...i, notaFinal, estado };
    }));
    mostrarToast(TOAST.NOTA_FINAL_GUARDADA);
    cerrarDetalle();
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingCursadas || loadingMaterias || loadingEstudiantes || loadingEstudiantesCompletos
    || loadingMatriculas || loadingInscripciones || loadingBloques || loadingCiclos || loadingPeriodos || loadingCV || loadingCN || loadingAulas
    || loadingHorarios || loadingPersonal;
  const conError = errorCursos || errorCursadas || errorMaterias || errorEstudiantes || errorEstudiantesCompletos
    || errorMatriculas || errorInscripciones || errorBloques || errorCiclos || errorPeriodos || errorCV || errorCN || errorAulas
    || errorHorarios || errorPersonal;
  if (cargando || conError) return <EstadoCarga loading={cargando} error={conError} />;

  if (!curso || !cursada) {
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
          <h1 className="font-headline text-headline-md font-bold text-on-surface">Cursada no encontrada</h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            No existe la cursada solicitada para este curso.
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
              Inscripciones — {nombreMateria(cursada.materiaId)}
            </h1>
            <p className="font-body text-body-sm text-on-surface-variant mt-1">
              Cursada de {nombreCurso(curso)}
            </p>
            <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
              Profesor a cargo: {profesorACargo ? `${profesorACargo.apellido}, ${profesorACargo.nombre}` : 'Sin asignar'}
            </p>
            <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
              Preceptor a cargo: {preceptorACargo ? `${preceptorACargo.apellido}, ${preceptorACargo.nombre}` : 'Sin asignar'}
            </p>
          </div>
          <button
            onClick={() => setSeleccionAbierta(true)}
            disabled={!esCicloActualEfectivo}
            title={esCicloActualEfectivo ? undefined : 'No se pueden agregar inscripciones: ciclo lectivo histórico'}
            className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
            Agregar Inscripción
          </button>
        </div>
      </div>

      {/* Aviso de ciclo histórico */}
      {!esCicloActualEfectivo && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container font-body text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[1.25rem] shrink-0">lock</span>
          Estás viendo un ciclo lectivo histórico. No se pueden agregar inscripciones para preservar el historial.
        </div>
      )}

      {/* Buscador */}
      {inscripcionesDeCursada.length > 0 && (
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
            value={busquedaInscripciones}
            onChange={(e) => setBusquedaInscripciones(e.target.value)}
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
        {busquedaInscripciones
          ? `${inscripcionesFiltradas.length} de ${inscripcionesDeCursada.length} ${inscripcionesDeCursada.length === 1 ? 'inscripto' : 'inscriptos'} encontrado${inscripcionesFiltradas.length !== 1 ? 's' : ''}`
          : `${inscripcionesDeCursada.length} ${inscripcionesDeCursada.length === 1 ? 'inscripto' : 'inscriptos'} en total`}
      </p>

      {/* Listado */}
      {inscripcionesDeCursada.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Todavía no hay estudiantes inscriptos en esta cursada.
        </div>
      ) : inscripcionesFiltradas.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          No se encontraron inscriptos que coincidan con la búsqueda.
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
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Tipo</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estado</th>
                  {periodosTabla.length === 0 ? (
                    <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Notas</th>
                  ) : (
                    periodosTabla.map(periodo => (
                      <th key={periodo.id} className="text-left px-2 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">
                        {abreviarPeriodo(periodo.descripcion)}
                      </th>
                    ))
                  )}
                  <th className="w-16 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {inscripcionesFiltradas.map(inscripcion => {
                  const estudiante = estudianteDe(inscripcion.estudianteDni);
                  return (
                    <tr key={inscripcion.id} className="hover:bg-surface-container-high transition-colors duration-150">
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">
                        {estudiante ? `${estudiante.apellido}, ${estudiante.nombre}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{estudiante ? estudiante.dni : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                          {inscripcion.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={inscripcion.estado} />
                      </td>
                      {periodosTabla.length === 0 ? (
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">—</td>
                      ) : (
                        periodosTabla.map(periodo => (
                          <td key={periodo.id} className="px-2 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap text-left">
                            {cargaDeEnPeriodo(inscripcion.id, periodo)?.calificacion ?? '—'}
                          </td>
                        ))
                      )}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => abrirDetalle(inscripcion)}
                          title="Ver detalle"
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="px-md py-sm bg-surface-container border-t border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {inscripcionesFiltradas.length} {inscripcionesFiltradas.length === 1 ? 'inscripto' : 'inscriptos'}
                {busquedaInscripciones && ` encontrado${inscripcionesFiltradas.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {inscripcionesFiltradas.map(inscripcion => {
              const estudiante = estudianteDe(inscripcion.estudianteDni);
              return (
                <div
                  key={inscripcion.id}
                  className="bg-background rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-body text-body-sm text-on-surface font-medium">
                        {estudiante ? `${estudiante.apellido}, ${estudiante.nombre}` : '—'}
                      </p>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {estudiante ? estudiante.dni : '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                        {inscripcion.tipo}
                      </span>
                      <button
                        onClick={() => abrirDetalle(inscripcion)}
                        title="Ver detalle"
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap border-t border-outline-variant pt-3 font-body text-xs text-on-surface-variant">
                    <EstadoBadge estado={inscripcion.estado} />
                    {periodosTabla.length === 0 ? (
                      <span>Sin notas cargadas</span>
                    ) : (
                      <div className="flex items-center gap-3 flex-wrap">
                        {periodosTabla.map(periodo => (
                          <span key={periodo.id} className="flex flex-col items-start leading-tight">
                            <span className="text-[10px] uppercase tracking-wide text-on-surface-variant/70">
                              {abreviarPeriodo(periodo.descripcion)}
                            </span>
                            <span className="font-medium text-on-surface">
                              {cargaDeEnPeriodo(inscripcion.id, periodo)?.calificacion ?? '—'}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de selección de estudiantes */}
      {seleccionAbierta && (
        <SeleccionEstudianteInscripcionModal
          estudiantes={estudiantesConDisponibilidad}
          cursadaIntensificacionOpciones={cursadaIntensificacionOpciones}
          cupoAulaRestante={cupoAulaRestante}
          onClose={() => setSeleccionAbierta(false)}
          onInscribirSeleccionados={handleInscribirSeleccionados}
        />
      )}

      {/* Modal de detalle del inscripto: notas de todos los períodos, no solo la final */}
      {inscripcionEnDetalle && estudianteEnDetalle && (
        <DetalleInscripcionModal
          estudiante={estudianteEnDetalle}
          notaFinal={notaFinalInput}
          errorNotaFinal={errorNotaFinal}
          porcentajeAsistencia={calcularPorcentajeAsistencia(inscripcionEnDetalle.id)}
          fecha={inscripcionEnDetalle.fecha}
          onClose={cerrarDetalle}
          onChangeNotaFinal={valor => { setNotaFinalInput(valor); setErrorNotaFinal(undefined); }}
          onGuardarNotaFinal={handleGuardarNotaFinal}
        />
      )}

    </div>
  );
}

export default GestionInscripcionesCursada;
