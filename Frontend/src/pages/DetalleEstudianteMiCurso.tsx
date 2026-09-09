import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import type { Estudiante } from '../types/Estudiante';
import type { AsistenciaInstitucional, TipoAsistencia } from '../types/AsistenciaInstitucional';
import { nombreCurso, type Curso } from '../types/Curso';
import EstadoBadge from '../components/elements/EstadoBadge';
import SeccionInfo from '../components/elements/SeccionInfo';
import CampoDetalle from '../components/elements/CampoDetalle';
import EstadoCarga from '../components/elements/EstadoCarga';
import { formatFecha } from '../constants/fechas';
import { TOAST } from '../constants/toastMessages';
import { TIPOS_ASISTENCIA_OPCIONES } from '../constants/asistenciaForm';
import { estadoClase } from '../constants/estadoClases';

// Detalle de un estudiante desde "Mis Cursos" (Seguimiento y Evaluación): una ficha
// acotada para docentes, sin datos de id, domicilio ni certificados/constancias
// (eso es propio de la gestión de Trayectorias Educativas). En su lugar, permite
// consultar la asistencia institucional registrada en una fecha puntual.
function DetalleEstudianteMiCurso() {
  const { cursoId, id } = useParams<{ cursoId: string; id: string }>();
  const navigate = useNavigate();

  const { data: cursosData, loading: loadingCursos, error: errorCursos } = useFetch<Curso[]>('/data/cursos.json');
  const { data: estudiantesData, loading: loadingEstudiantes, error: errorEstudiantes } = useFetch<Estudiante[]>('/data/estudiantes.json');
  const { data: asistenciasData, setData: setAsistencias, loading: loadingAsistencias, error: errorAsistencias } = useFetch<AsistenciaInstitucional[]>('/data/asistenciasInstitucionales.json');
  const { mostrarToast } = useToast();

  const curso = (cursosData ?? []).find(c => String(c.id) === cursoId);
  const estudiante = (estudiantesData ?? []).find(e => String(e.id) === id);
  const asistencias = asistenciasData ?? [];

  const [fechaBuscada, setFechaBuscada] = useState('');

  // A lo sumo una asistencia institucional por estudiante y por día.
  const asistenciaDelDia = estudiante && fechaBuscada
    ? asistencias.find(a => a.estudianteDni === estudiante.dni && a.fecha === fechaBuscada)
    : undefined;

  const esInasistencia = asistenciaDelDia !== undefined && asistenciaDelDia.tipo !== 'Asistencia Completa';

  const handleToggleJustificada = () => {
    if (!asistenciaDelDia) return;
    const justificada = !asistenciaDelDia.justificada;
    setAsistencias(prev => (prev ?? []).map(a => a.id === asistenciaDelDia.id ? { ...a, justificada } : a));
    if (justificada) mostrarToast(TOAST.ASISTENCIA_JUSTIFICADA);
  };

  // Dropdown para editar el tipo de asistencia registrado. Se renderiza en un portal a
  // document.body, posicionado en "fixed" según la posición real del botón: si fuera un
  // hijo normal quedaría recortado por el overflow-hidden que usa SeccionInfo para animar
  // el colapso de la sección (o directamente salir de la pantalla al abrirse cerca del borde).
  const [tipoDropdownAbierto, setTipoDropdownAbierto] = useState<{ left: number; width: number; top?: number; bottom?: number } | null>(null);
  const tipoTriggerRef = useRef<HTMLButtonElement>(null);
  const tipoListaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tipoDropdownAbierto) return;

    const cerrarSiEsAfuera = (e: MouseEvent) => {
      const target = e.target as Node;
      if (tipoTriggerRef.current?.contains(target) || tipoListaRef.current?.contains(target)) return;
      setTipoDropdownAbierto(null);
    };
    const cerrar = () => setTipoDropdownAbierto(null);

    document.addEventListener('mousedown', cerrarSiEsAfuera);
    window.addEventListener('scroll', cerrar, true);
    window.addEventListener('resize', cerrar);
    return () => {
      document.removeEventListener('mousedown', cerrarSiEsAfuera);
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('resize', cerrar);
    };
  }, [tipoDropdownAbierto]);

  // Altura aproximada de la lista (3 opciones); si no entra debajo del botón antes de
  // toparse con el borde inferior de la ventana, se abre hacia arriba.
  const ALTURA_LISTA_TIPO_ESTIMADA = 130;

  const toggleTipoDropdown = () => {
    if (tipoDropdownAbierto) {
      setTipoDropdownAbierto(null);
      return;
    }
    const boton = tipoTriggerRef.current;
    if (!boton) return;
    const rect = boton.getBoundingClientRect();
    const espacioAbajo = window.innerHeight - rect.bottom;

    setTipoDropdownAbierto(
      espacioAbajo >= ALTURA_LISTA_TIPO_ESTIMADA
        ? { left: rect.left, width: rect.width, top: rect.bottom + 4 }
        : { left: rect.left, width: rect.width, bottom: window.innerHeight - rect.top + 4 }
    );
  };

  const handleCambiarTipo = (tipo: TipoAsistencia) => {
    if (!asistenciaDelDia) return;
    setTipoDropdownAbierto(null);
    if (tipo === asistenciaDelDia.tipo) return;
    setAsistencias(prev => (prev ?? []).map(a =>
      a.id === asistenciaDelDia.id
        ? { ...a, tipo, justificada: tipo === 'Asistencia Completa' ? false : a.justificada }
        : a
    ));
    mostrarToast(TOAST.ASISTENCIA_MODIFICADA);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  const cargando = loadingCursos || loadingEstudiantes || loadingAsistencias;
  const conError = errorCursos || errorEstudiantes || errorAsistencias;
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

      {/* Asistencias */}
      <SeccionInfo icono="fact_check" titulo="Asistencias">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 w-full max-w-55">
            <label htmlFor="fechaAsistencia" className="font-label text-label-md text-on-surface-variant">
              Buscar por fecha
            </label>
            <input
              id="fechaAsistencia"
              type="date"
              value={fechaBuscada}
              onChange={e => setFechaBuscada(e.target.value)}
              style={{
                color: fechaBuscada ? 'var(--on-surface)' : 'color-mix(in srgb, var(--on-surface) 38%, transparent)',
                backgroundColor: 'var(--background)',
              }}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150"
            />
          </div>

          {fechaBuscada && (
            asistenciaDelDia ? (
              <div className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-xl border border-outline-variant bg-surface-container">
                <span className="font-body text-body-sm text-on-surface font-medium">{formatFecha(asistenciaDelDia.fecha)}</span>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    ref={tipoTriggerRef}
                    onClick={toggleTipoDropdown}
                    className={`flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full font-label text-sm font-medium capitalize cursor-pointer transition-colors duration-150 ${estadoClase(asistenciaDelDia.tipo)}`}
                  >
                    {asistenciaDelDia.tipo}
                    <span className={`material-symbols-outlined text-[1.1rem] leading-none transition-transform duration-200 ${tipoDropdownAbierto ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {tipoDropdownAbierto && createPortal(
                    <div
                      ref={tipoListaRef}
                      style={{
                        position: 'fixed',
                        left: tipoDropdownAbierto.left,
                        width: tipoDropdownAbierto.width,
                        top: tipoDropdownAbierto.top,
                        bottom: tipoDropdownAbierto.bottom,
                      }}
                      className="z-50 bg-background border border-outline-variant rounded-lg shadow-md"
                    >
                      <ul>
                        {TIPOS_ASISTENCIA_OPCIONES.map(t => (
                          <li key={t}>
                            <button
                              type="button"
                              onClick={() => handleCambiarTipo(t)}
                              className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                                asistenciaDelDia.tipo === t
                                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                                  : 'text-on-surface hover:bg-surface-container-high'
                              }`}
                            >
                              {t}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>,
                    document.body
                  )}
                  {esInasistencia && (
                    <label
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer select-none transition-colors duration-150 ${
                        asistenciaDelDia.justificada
                          ? 'bg-primary/10 text-primary'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={asistenciaDelDia.justificada}
                        onChange={handleToggleJustificada}
                        className="sr-only"
                      />
                      <span className="material-symbols-outlined text-[1.25rem]">
                        {asistenciaDelDia.justificada ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className="font-label text-label-md font-medium">
                        Justificada
                      </span>
                    </label>
                  )}
                </div>
              </div>
            ) : (
              <p className="font-body text-body-sm text-on-surface-variant">
                No hay un registro de asistencia institucional para el {formatFecha(fechaBuscada)}.
              </p>
            )
          )}
        </div>
      </SeccionInfo>

    </div>
  );
}

export default DetalleEstudianteMiCurso;
