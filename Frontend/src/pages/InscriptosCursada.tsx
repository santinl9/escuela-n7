import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { nombreCurso, type Curso } from '../types/Curso';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import type { Estudiante } from '../types/Estudiante';
import { estadoPorNotaFinal, type Inscripcion } from '../types/Inscripcion';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import type { CargaValorativa, NotaValorativa } from '../types/CargaValorativa';
import type { CargaNumerica } from '../types/CargaNumerica';
import type { CargaIntensificacion } from '../types/CargaIntensificacion';
import type { BloqueHorario } from '../types/BloqueHorario';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import type { Personal } from '../types/Personal';
import type { ErroresCarga } from '../types/formTypes/cargaFormTypes';
import { crearCargaSchema } from '../types/schemas/cargaSchema';
import { NOTAS_VALORATIVAS_OPCIONES } from '../constants/cargaForm';
import { estaVigente, diasHasta } from '../constants/fechas';
import { SOLO_NUMEROS } from '../constants/regexPatterns';
import { asignacionQueCubreCursada, asignacionPreceptorDeCurso } from '../constants/cursadasCobertura';
import EstadoBadge from '../components/elements/EstadoBadge';
import EstadoCarga from '../components/elements/EstadoCarga';
import PorcentajeAsistencia from '../components/elements/PorcentajeAsistencia';
import DetalleInscripcionModal, { type PeriodoCargaResumen } from '../components/modals/DetalleInscripcionModal';
import { TOAST } from '../constants/toastMessages';

// Vista de solo lectura respecto de las inscripciones: no permite agregarlas, editarlas
// ni eliminarlas. Lo único editable acá es la carga de calificaciones/inasistencias del
// período de carga vigente (si lo hay, en línea, con un guardado global) y la cantidad
// de clases dictadas de la cursada.
function InscriptosCursada() {
  const { cursadaId } = useParams<{ cursadaId: string }>();
  const navigate = useNavigate();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: cursadasData, setData: setCursadas, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<Estudiante[]>('/data/estudiantes.json');
  const { data: inscripcionesData, setData: setInscripciones, loading: loadingInscripciones, error: errorInscripciones } = useFetch<Inscripcion[]>('/data/inscripciones.json');
  const { data: periodosData, loading: loadingPeriodos, error: errorPeriodos } = useFetch<PeriodoCarga[]>('/data/periodosCarga.json');
  const { data: cargasValorativasData, setData: setCargasValorativas, loading: loadingCV, error: errorCV } = useFetch<CargaValorativa[]>('/data/cargasValorativas.json');
  const { data: cargasNumericasData, setData: setCargasNumericas, loading: loadingCN, error: errorCN } = useFetch<CargaNumerica[]>('/data/cargasNumericas.json');
  const { data: cargasIntensificacionData, setData: setCargasIntensificacion, loading: loadingCI, error: errorCI } = useFetch<CargaIntensificacion[]>('/data/cargasIntensificacion.json');
  const { data: bloquesData, loading: loadingBloques, error: errorBloques } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');
  const { data: horariosData, loading: loadingHorarios, error: errorHorarios } = useFetch<AsignacionHoraria[]>('/data/asignacionesHorarias.json');
  const { data: personalData, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');

  const cursos = cursosData ?? [];
  const cursadas = cursadasData ?? [];
  const materias = materiasData ?? [];
  const estudiantes = estudiantesData ?? [];
  const inscripciones = inscripcionesData ?? [];
  const periodos = periodosData ?? [];
  const cargasValorativas = cargasValorativasData ?? [];
  const cargasNumericas = cargasNumericasData ?? [];
  const cargasIntensificacion = cargasIntensificacionData ?? [];
  const bloques = bloquesData ?? [];
  const horarios = horariosData ?? [];
  const personal = personalData ?? [];

  const cursada = cursadas.find(c => String(c.id) === cursadaId);
  const curso = cursada ? cursos.find(c => c.id === cursada.cursoId) : undefined;

  // Profesor a cargo: la asignación horaria de tipo Profesor, vigente, cuyos bloques cubren
  // esta cursada (mismo criterio que se usa para no permitir cursadas duplicadas al asignar).
  const asignacionProfesor = cursada ? asignacionQueCubreCursada(cursada.id, horarios, bloques) : undefined;
  const profesorACargo = asignacionProfesor ? personal.find(p => p.id === asignacionProfesor.personalId) : undefined;

  // Preceptor a cargo del curso de esta cursada (a diferencia del profesor, está a cargo de
  // uno o más cursos enteros, no de una cursada puntual).
  const asignacionPreceptor = curso ? asignacionPreceptorDeCurso(curso.id, horarios) : undefined;
  const preceptorACargo = asignacionPreceptor ? personal.find(p => p.id === asignacionPreceptor.personalId) : undefined;

  // El período de carga vigente es el que, para el ciclo lectivo de esta cursada,
  // tiene hoy dentro de su rango de fechas. Solo puede haber uno a la vez.
  const periodoActivo = cursada
    ? periodos.find(p => p.cicloLectivoId === cursada.cicloLectivoId && estaVigente(p.fechaIni, p.fechaFin))
    : undefined;

  // La carga de intensificación solo habilita cargar nota a los inscriptos para intensificar
  // (a diferencia de la numérica/valorativa, que habilita a cualquier inscripto de la cursada).
  const esIntensificacion = periodoActivo?.tipo === 'Intensificacion';

  // Con un período de Intensificación vigente, solo los inscriptos tipo "Intensifica" pueden
  // cargar nota; con Numérica/Valorativa, cualquier inscripto de la cursada puede hacerlo.
  const puedeCargarEnPeriodoActivo = (inscripcion: Inscripcion): boolean =>
    !esIntensificacion || inscripcion.tipo === 'Intensifica';

  const nombreMateria = (materiaId: number) => materias.find(m => m.id === materiaId)?.nombre ?? '—';
  const estudianteDe = (dni: number) => estudiantes.find(e => e.dni === dni);

  const inscripcionesDeCursada = cursada ? inscripciones.filter(i => i.cursadaId === cursada.id) : [];

  // Todos los períodos de carga del ciclo lectivo de esta cursada, del más reciente al más antiguo.
  const periodosDeCiclo = cursada
    ? [...periodos].filter(p => p.cicloLectivoId === cursada.cicloLectivoId).sort((a, b) => b.fechaIni.localeCompare(a.fechaIni))
    : [];

  // Columnas de notas del listado (igual que en Gestión de Inscripciones de Cursada): solo
  // períodos ya concluidos, del más antiguo al más reciente para que las columnas se agreguen
  // hacia la derecha. El período vigente no entra acá: se sigue cargando en línea, aparte.
  const periodosTabla = [...periodosDeCiclo]
    .filter(periodo => diasHasta(periodo.fechaFin) < 0)
    .sort((a, b) => a.fechaIni.localeCompare(b.fechaIni));

  const cargaDeEnPeriodo = (inscripcionId: number, periodo?: PeriodoCarga): CargaValorativa | CargaNumerica | CargaIntensificacion | undefined => {
    if (!periodo) return undefined;
    if (periodo.tipo === 'Numerica') return cargasNumericas.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id);
    if (periodo.tipo === 'Intensificacion') return cargasIntensificacion.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id);
    return cargasValorativas.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodo.id);
  };

  // La calificación vive en `calificacion` (Numérica/Valorativa) o en `calificacionFinal`
  // (Intensificación): este helper la expone de forma uniforme para mostrarla en columnas.
  const calificacionDe = (carga?: CargaValorativa | CargaNumerica | CargaIntensificacion): NotaValorativa | number | null => {
    if (!carga) return null;
    return 'calificacionFinal' in carga ? carga.calificacionFinal : carga.calificacion;
  };

  const cargaDe = (inscripcionId: number): CargaValorativa | CargaNumerica | CargaIntensificacion | undefined =>
    cargaDeEnPeriodo(inscripcionId, periodoActivo);

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

  // ── Cantidad de clases dictadas ─────────────────────────────────────────────

  const handleCambiarCantidadClases = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!cursada) return;
    const digitos = e.target.value.replace(/\D/g, '');
    const cantidad = digitos === '' ? 0 : Number(digitos);
    setCursadas(prev => (prev ?? []).map(c => (c.id === cursada.id ? { ...c, cantidadClases: cantidad } : c)));
  };

  // ── Carga en línea de calificación e inasistencias ──────────────────────────
  // Ni la calificación ni las inasistencias son obligatorias: se puede guardar con
  // alguno de los dos (o ambos) en null. El guardado es global: un único botón
  // persiste los cambios pendientes de todos los estudiantes a la vez.

  const { mostrarToast } = useToast();
  const [inputsCarga, setInputsCarga] = useState<Record<number, { calificacion: string; inasistencias: string }>>({});
  const [erroresCarga, setErroresCarga] = useState<Record<number, ErroresCarga>>({});

  const valoresDe = (inscripcionId: number) => {
    const carga = cargaDe(inscripcionId);
    const calificacion = calificacionDe(carga);
    return inputsCarga[inscripcionId] ?? {
      calificacion: calificacion != null ? String(calificacion) : '',
      inasistencias: carga?.inasistencias != null ? String(carga.inasistencias) : '',
    };
  };

  const handleChangeCarga = (inscripcionId: number, campo: 'calificacion' | 'inasistencias', valor: string) => {
    setInputsCarga(prev => ({ ...prev, [inscripcionId]: { ...valoresDe(inscripcionId), [campo]: valor } }));
    setErroresCarga(prev => ({ ...prev, [inscripcionId]: { ...prev[inscripcionId], [campo]: undefined } }));
  };

  // Dropdown de calificación conceptual (TEA/TEP/TED), con el mismo estilo que el
  // resto de los selectores del sistema (botón + lista, en vez de un <select> nativo).
  // La lista de opciones se renderiza en un portal a document.body, posicionada en
  // "fixed" según la posición real del botón: al estar dentro de una tabla con
  // overflow-hidden (necesario para las esquinas redondeadas), si la lista fuera un
  // hijo normal quedaría recortada por ese contenedor.
  const [calificacionAbierta, setCalificacionAbierta] = useState<{ clave: string; left: number; width: number; top?: number; bottom?: number } | null>(null);
  const calificacionTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const calificacionListaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calificacionAbierta) return;

    const cerrarSiEsAfuera = (e: MouseEvent) => {
      const target = e.target as Node;
      const trigger = calificacionTriggerRefs.current.get(calificacionAbierta.clave);
      if (trigger?.contains(target) || calificacionListaRef.current?.contains(target)) return;
      setCalificacionAbierta(null);
    };
    const cerrar = () => setCalificacionAbierta(null);

    document.addEventListener('mousedown', cerrarSiEsAfuera);
    window.addEventListener('scroll', cerrar, true);
    window.addEventListener('resize', cerrar);
    return () => {
      document.removeEventListener('mousedown', cerrarSiEsAfuera);
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('resize', cerrar);
    };
  }, [calificacionAbierta]);

  // Altura aproximada de la lista ("Sin calificar" + TEA/TEP/TED). Si no entra debajo
  // del botón antes de toparse con el borde inferior de la ventana, se abre hacia arriba
  // (anclada por "bottom" en vez de "top", para no necesitar la altura real de antemano).
  const ALTURA_LISTA_ESTIMADA = 170;

  const toggleCalificacionAbierta = (clave: string) => {
    if (calificacionAbierta?.clave === clave) {
      setCalificacionAbierta(null);
      return;
    }
    const boton = calificacionTriggerRefs.current.get(clave);
    if (!boton) return;
    const rect = boton.getBoundingClientRect();
    const espacioAbajo = window.innerHeight - rect.bottom;

    setCalificacionAbierta(
      espacioAbajo >= ALTURA_LISTA_ESTIMADA
        ? { clave, left: rect.left, width: rect.width, top: rect.bottom + 4 }
        : { clave, left: rect.left, width: rect.width, bottom: window.innerHeight - rect.top + 4 }
    );
  };

  const handleGuardarTodo = () => {
    if (!periodoActivo) return;

    let listaValorativa = cargasValorativas;
    let listaNumerica = cargasNumericas;
    let listaIntensificacion = cargasIntensificacion;
    const nuevosErrores: Record<number, ErroresCarga> = {};
    let huboErrores = false;

    Object.keys(inputsCarga).forEach(idStr => {
      const inscripcionId = Number(idStr);
      const inscripcion = inscripcionesDeCursada.find(i => i.id === inscripcionId);
      // Con Intensificación vigente, solo se persiste la carga de quienes están habilitados
      // a intensificar: los inputs de las demás filas ni siquiera se renderizan.
      if (!inscripcion || !puedeCargarEnPeriodoActivo(inscripcion)) return;

      const valores = inputsCarga[inscripcionId];

      const resultado = crearCargaSchema(periodoActivo.tipo, cursada?.cantidadClases ?? 0).safeParse(valores);
      if (!resultado.success) {
        huboErrores = true;
        const errs: ErroresCarga = {};
        resultado.error.issues.forEach(issue => {
          const f = String(issue.path[0]) as keyof ErroresCarga;
          if (!errs[f]) errs[f] = issue.message;
        });
        nuevosErrores[inscripcionId] = errs;
        return;
      }
      nuevosErrores[inscripcionId] = {};

      const inasistencias = valores.inasistencias === '' ? null : Number(valores.inasistencias);

      if (periodoActivo.tipo === 'Numerica') {
        const calificacion = valores.calificacion === '' ? null : Number(valores.calificacion);
        const existente = listaNumerica.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodoActivo.id);
        listaNumerica = existente
          ? listaNumerica.map(c => (c.id === existente.id ? { ...c, calificacion, inasistencias } : c))
          : [...listaNumerica, {
              id: listaNumerica.length > 0 ? Math.max(...listaNumerica.map(c => c.id)) + 1 : 1,
              inscripcionId, periodoCargaId: periodoActivo.id, calificacion, inasistencias,
            }];
      } else if (periodoActivo.tipo === 'Intensificacion') {
        const calificacionFinal = valores.calificacion === '' ? null : Number(valores.calificacion);
        const existente = listaIntensificacion.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodoActivo.id);
        listaIntensificacion = existente
          ? listaIntensificacion.map(c => (c.id === existente.id ? { ...c, calificacionFinal, inasistencias } : c))
          : [...listaIntensificacion, {
              id: listaIntensificacion.length > 0 ? Math.max(...listaIntensificacion.map(c => c.id)) + 1 : 1,
              inscripcionId, periodoCargaId: periodoActivo.id, calificacionFinal, inasistencias,
            }];
      } else {
        const calificacion = valores.calificacion === '' ? null : (valores.calificacion as NotaValorativa);
        const existente = listaValorativa.find(c => c.inscripcionId === inscripcionId && c.periodoCargaId === periodoActivo.id);
        listaValorativa = existente
          ? listaValorativa.map(c => (c.id === existente.id ? { ...c, calificacion, inasistencias } : c))
          : [...listaValorativa, {
              id: listaValorativa.length > 0 ? Math.max(...listaValorativa.map(c => c.id)) + 1 : 1,
              inscripcionId, periodoCargaId: periodoActivo.id, calificacion, inasistencias,
            }];
      }
    });

    setErroresCarga(prev => ({ ...prev, ...nuevosErrores }));
    if (huboErrores) return;

    setCargasValorativas(listaValorativa);
    setCargasNumericas(listaNumerica);
    setCargasIntensificacion(listaIntensificacion);
    setInputsCarga({});
    mostrarToast(TOAST.CARGA_GUARDADA);
  };

  // Cursada en la que efectivamente intensifica el inscripto: se definió una única vez al
  // inscribirlo (ver SeleccionCursadaIntensificacionModal), no se elige acá.
  const cursadaIntensificacionNombreDe = (inscripcion?: Inscripcion): string => {
    if (!inscripcion?.cursadaIntensificacionId) return '—';
    const c = cursadas.find(cur => cur.id === inscripcion.cursadaIntensificacionId);
    if (!c) return '—';
    const materiaDeC = materias.find(m => m.id === c.materiaId);
    const cursoDeC = cursos.find(cur => cur.id === c.cursoId);
    return `${materiaDeC?.nombre ?? '—'} · ${cursoDeC ? nombreCurso(cursoDeC) : '—'}`;
  };

  // ── Detalle de inscripto: historial de períodos de carga concluidos + carga de la nota
  // final (no está atada a ningún período puntual, es la nota de la cursada en su conjunto) ──

  const [detalleAbierto, setDetalleAbierto] = useState<number | null>(null);
  const [notaFinalInput, setNotaFinalInput] = useState('');
  const [errorNotaFinal, setErrorNotaFinal] = useState<string | undefined>(undefined);

  const inscripcionEnDetalle = inscripcionesDeCursada.find(i => i.id === detalleAbierto);
  const estudianteEnDetalle = inscripcionEnDetalle ? estudianteDe(inscripcionEnDetalle.estudianteDni) : undefined;

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
    // La nota final se carga una única vez: si ya tiene valor, esta pantalla la bloquea
    // (ver soloLecturaNotaFinal en el modal); esto es un resguardo extra por si igual se llega
    // a llamar. Corregirla, si hiciera falta, se hace desde Gestión de Inscripciones.
    if (!inscripcionEnDetalle || inscripcionEnDetalle.notaFinal != null) return;

    if (notaFinalInput !== '') {
      if (!SOLO_NUMEROS.test(notaFinalInput) || Number(notaFinalInput) < 1 || Number(notaFinalInput) > 10) {
        setErrorNotaFinal('La nota debe ser entre 1 y 10');
        return;
      }
    }

    const notaFinal = notaFinalInput === '' ? null : Number(notaFinalInput);
    setInscripciones(prev => (prev ?? []).map(i => {
      if (i.id !== inscripcionEnDetalle.id) return i;
      // El umbral de aprobación se evalúa con la fecha de hoy (cuándo se carga la nota), no
      // con la fecha de inscripción: diciembre/enero/febrero aprueba con 4, el resto con 7.
      const estado = notaFinal !== null ? estadoPorNotaFinal(notaFinal) : i.estado;
      return { ...i, notaFinal, estado };
    }));
    mostrarToast(TOAST.NOTA_FINAL_GUARDADA);
    cerrarDetalle();
  };

  // Historial de períodos de carga ya concluidos de esta cursada, con la carga (calificación
  // e inasistencias) que le corresponde a esta inscripción en cada uno.
  const periodosResumenDe = (inscripcionId: number): PeriodoCargaResumen[] =>
    periodosTabla.map(periodo => {
      const carga = cargaDeEnPeriodo(inscripcionId, periodo);
      return {
        id: periodo.id,
        descripcion: periodo.descripcion,
        tipo: periodo.tipo,
        calificacion: calificacionDe(carga),
        inasistencias: carga?.inasistencias ?? null,
      };
    });

  // ── Estados de carga ──────────────────────────────────────────────────────

  const loading = loadingCursos || loadingCursadas || loadingMaterias || loadingEstudiantes || loadingInscripciones
    || loadingPeriodos || loadingCV || loadingCN || loadingCI || loadingBloques || loadingHorarios || loadingPersonal;
  const error   = errorCursos   || errorCursadas   || errorMaterias   || errorEstudiantes   || errorInscripciones
    || errorPeriodos   || errorCV   || errorCN   || errorCI   || errorBloques   || errorHorarios   || errorPersonal;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  if (!cursada) {
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
            No existe una cursada con el id {cursadaId}.
          </p>
        </div>
      </div>
    );
  }

  // Selector de calificación valorativa (TEA/TEP/TED) con el estilo estándar del sistema.
  const renderSelectorValorativa = (inscripcionId: number, vista: 'd' | 'm') => {
    const clave = `${vista}-${inscripcionId}`;
    const valores = valoresDe(inscripcionId);
    const erroresFila = erroresCarga[inscripcionId] ?? {};
    const abierta = calificacionAbierta?.clave === clave;

    const seleccionar = (valor: string) => {
      handleChangeCarga(inscripcionId, 'calificacion', valor);
      setCalificacionAbierta(null);
    };

    return (
      <div className="relative w-24">
        <button
          type="button"
          ref={el => { if (el) calificacionTriggerRefs.current.set(clave, el); }}
          onClick={() => toggleCalificacionAbierta(clave)}
          style={{ backgroundColor: 'var(--background)' }}
          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
            erroresFila.calificacion ? 'border-error' : 'border-outline-variant'
          }`}
        >
          <span style={{ color: valores.calificacion ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
            {valores.calificacion || 'Nota'}
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${abierta ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        {abierta && calificacionAbierta && createPortal(
          <div
            ref={calificacionListaRef}
            style={{
              position: 'fixed',
              left: calificacionAbierta.left,
              width: calificacionAbierta.width,
              top: calificacionAbierta.top,
              bottom: calificacionAbierta.bottom,
            }}
            className="z-50 bg-background border border-outline-variant rounded-lg shadow-md"
          >
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => seleccionar('')}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                    valores.calificacion === ''
                      ? 'bg-secondary-container text-on-secondary-container font-semibold'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  Sin calificar
                </button>
              </li>
              {NOTAS_VALORATIVAS_OPCIONES.map(nota => (
                <li key={nota}>
                  <button
                    type="button"
                    onClick={() => seleccionar(nota)}
                    className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                      valores.calificacion === nota
                        ? 'bg-secondary-container text-on-secondary-container font-semibold'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {nota}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
      </div>
    );
  };

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
            {curso ? `${nombreMateria(cursada.materiaId)} ${curso.nivel}°${curso.nombre}` : nombreMateria(cursada.materiaId)}
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Estudiantes inscriptos en esta cursada
          </p>
          <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
            Profesor a cargo: {profesorACargo ? `${profesorACargo.apellido}, ${profesorACargo.nombre}` : 'Sin asignar'}
          </p>
          <p className="font-body text-body-sm text-on-surface-variant mt-0.5">
            Preceptor a cargo: {preceptorACargo ? `${preceptorACargo.apellido}, ${preceptorACargo.nombre}` : 'Sin asignar'}
          </p>
        </div>
      </div>

      {/* Aviso de período de carga vigente */}
      {periodoActivo && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-outline-variant bg-surface-container font-body text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[1.25rem] shrink-0">edit_calendar</span>
          {esIntensificacion
            ? `Hay un período de carga vigente (${periodoActivo.descripcion}): podés cargar la calificación final e inasistencias de los estudiantes inscriptos para intensificar esta materia.`
            : `Hay un período de carga vigente (${periodoActivo.descripcion}): podés cargar la calificación e inasistencias de cada estudiante.`}
        </div>
      )}

      {/* Cantidad de clases dictadas */}
      <div className="flex flex-col gap-1.5 w-full max-w-55">
        <label htmlFor="cantidadClases" className="font-label text-label-md text-on-surface-variant">
          Cantidad de clases dictadas
        </label>
        <input
          id="cantidadClases"
          type="text"
          inputMode="numeric"
          value={String(cursada.cantidadClases)}
          onChange={handleCambiarCantidadClases}
          style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
          className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150"
        />
      </div>

      {/* Contador y guardado global */}
      <div className="flex items-center justify-between gap-4 -mt-4 flex-wrap">
        <p className="font-body text-body-sm text-on-surface-variant">
          {inscripcionesDeCursada.length} {inscripcionesDeCursada.length === 1 ? 'inscripto' : 'inscriptos'} en total
        </p>
        {periodoActivo && (
          <button
            onClick={handleGuardarTodo}
            className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
          >
            <span className="material-symbols-outlined text-[1.25rem]">save</span>
            Guardar cambios
          </button>
        )}
      </div>

      {/* Listado */}
      {inscripcionesDeCursada.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          Todavía no hay estudiantes inscriptos en esta cursada.
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estudiante</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Tipo</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estado</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">% Asistencia</th>
                  {periodoActivo && (
                    <>
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Calificación</th>
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Inasistencias Totales</th>
                    </>
                  )}
                  <th className="w-16 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {inscripcionesDeCursada.map(inscripcion => {
                  const estudiante = estudianteDe(inscripcion.estudianteDni);
                  const valores = valoresDe(inscripcion.id);
                  const erroresFila = erroresCarga[inscripcion.id] ?? {};
                  const elegible = puedeCargarEnPeriodoActivo(inscripcion);
                  return (
                    <tr key={inscripcion.id} className="hover:bg-surface-container-high transition-colors duration-150">
                      <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">
                        {estudiante ? `${estudiante.apellido}, ${estudiante.nombre}` : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                          {inscripcion.tipo}
                        </span>
                        {inscripcion.tipo === 'Intensifica' && (
                          <p className="font-body text-xs text-on-surface-variant mt-1">
                            Intensifica: {cursadaIntensificacionNombreDe(inscripcion)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={inscripcion.estado} />
                      </td>
                      <td className="px-4 py-3">
                        <PorcentajeAsistencia porcentaje={calcularPorcentajeAsistencia(inscripcion.id)} />
                      </td>
                      {periodoActivo && (
                        <>
                            <td className="px-4 py-3">
                              {elegible ? (
                                <div className="flex flex-col gap-1">
                                  {periodoActivo.tipo === 'Valorativa' ? renderSelectorValorativa(inscripcion.id, 'd') : (
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={valores.calificacion}
                                      onChange={e => handleChangeCarga(inscripcion.id, 'calificacion', e.target.value)}
                                      placeholder="Nota"
                                      style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                                      className={`w-20 px-2 py-1.5 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                                        erroresFila.calificacion ? 'border-error' : 'border-outline-variant'
                                      }`}
                                    />
                                  )}
                                  {erroresFila.calificacion && (
                                    <span className="font-body text-xs text-error">{erroresFila.calificacion}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="font-body text-body-sm text-on-surface-variant">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {elegible ? (
                                <div className="flex flex-col gap-1">
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={valores.inasistencias}
                                    onChange={e => handleChangeCarga(inscripcion.id, 'inasistencias', e.target.value)}
                                    placeholder="Inasist."
                                    style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                                    className={`w-20 px-2 py-1.5 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                                      erroresFila.inasistencias ? 'border-error' : 'border-outline-variant'
                                    }`}
                                  />
                                  {erroresFila.inasistencias && (
                                    <span className="font-body text-xs text-error">{erroresFila.inasistencias}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="font-body text-body-sm text-on-surface-variant">—</span>
                              )}
                            </td>
                          </>
                      )}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => abrirDetalle(inscripcion)}
                          title="Cargar nota final"
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">note_alt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-md py-sm bg-surface-container border-t border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {inscripcionesDeCursada.length} {inscripcionesDeCursada.length === 1 ? 'inscripto' : 'inscriptos'}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {inscripcionesDeCursada.map(inscripcion => {
              const estudiante = estudianteDe(inscripcion.estudianteDni);
              const valores = valoresDe(inscripcion.id);
              const erroresFila = erroresCarga[inscripcion.id] ?? {};
              const elegible = puedeCargarEnPeriodoActivo(inscripcion);
              return (
                <div
                  key={inscripcion.id}
                  className="bg-background rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="font-body text-body-sm text-on-surface font-medium">
                      {estudiante ? `${estudiante.apellido}, ${estudiante.nombre}` : '—'}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                        {inscripcion.tipo}
                      </span>
                      <button
                        onClick={() => abrirDetalle(inscripcion)}
                        title="Cargar nota final"
                        className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-[1.25rem]">note_alt</span>
                      </button>
                    </div>
                  </div>
                  {inscripcion.tipo === 'Intensifica' && (
                    <p className="font-body text-xs text-on-surface-variant -mt-2">
                      Intensifica: {cursadaIntensificacionNombreDe(inscripcion)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 flex-wrap border-t border-outline-variant pt-3 font-body text-xs text-on-surface-variant">
                    <EstadoBadge estado={inscripcion.estado} />
                    <PorcentajeAsistencia porcentaje={calcularPorcentajeAsistencia(inscripcion.id)} />
                  </div>
                  {periodoActivo && (
                    elegible ? (
                      <div className="flex flex-col gap-3 border-t border-outline-variant pt-3">
                        <div className="flex flex-col gap-1">
                          <label className="font-label text-label-md text-on-surface-variant">Calificación</label>
                          {periodoActivo.tipo === 'Valorativa' ? renderSelectorValorativa(inscripcion.id, 'm') : (
                            <input
                              type="text"
                              inputMode="numeric"
                              value={valores.calificacion}
                              onChange={e => handleChangeCarga(inscripcion.id, 'calificacion', e.target.value)}
                              placeholder="Nota"
                              style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                              className={`w-20 px-2 py-1.5 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                                erroresFila.calificacion ? 'border-error' : 'border-outline-variant'
                              }`}
                            />
                          )}
                          {erroresFila.calificacion && (
                            <span className="font-body text-xs text-error">{erroresFila.calificacion}</span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-label text-label-md text-on-surface-variant">Inasistencias Totales</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={valores.inasistencias}
                            onChange={e => handleChangeCarga(inscripcion.id, 'inasistencias', e.target.value)}
                            placeholder="Inasist."
                            style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                            className={`w-20 px-2 py-1.5 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                              erroresFila.inasistencias ? 'border-error' : 'border-outline-variant'
                            }`}
                          />
                          {erroresFila.inasistencias && (
                            <span className="font-body text-xs text-error">{erroresFila.inasistencias}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="font-body text-xs text-on-surface-variant border-t border-outline-variant pt-3">
                        No está inscripto para intensificar en este período.
                      </p>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal de detalle: historial de períodos de carga concluidos + carga de la nota final */}
      {inscripcionEnDetalle && estudianteEnDetalle && (
        <DetalleInscripcionModal
          estudiante={estudianteEnDetalle}
          notaFinal={notaFinalInput}
          errorNotaFinal={errorNotaFinal}
          porcentajeAsistencia={calcularPorcentajeAsistencia(inscripcionEnDetalle.id)}
          periodos={periodosResumenDe(inscripcionEnDetalle.id)}
          soloLecturaNotaFinal={inscripcionEnDetalle.notaFinal != null}
          onClose={cerrarDetalle}
          onChangeNotaFinal={valor => { setNotaFinalInput(valor); setErrorNotaFinal(undefined); }}
          onGuardarNotaFinal={handleGuardarNotaFinal}
        />
      )}

    </div>
  );
}

export default InscriptosCursada;
