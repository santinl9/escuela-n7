import { useState } from 'react';
import type { EstudianteListado } from '../../types/EstudianteListado';
import type { TipoInscripcion } from '../../types/Inscripcion';
import { normalizarBusqueda as norm } from '../../constants/normalizarTexto';
import EstadoBadge from '../elements/EstadoBadge';
import SelectTipoInscripcion from '../elements/SelectTipoInscripcion';
import ComboboxCursadaIntensificacion from '../elements/ComboboxCursadaIntensificacion';
import type { CursadaOpcion } from './CargaIntensificacionModal';

interface EstudianteConDisponibilidad {
  estudiante: EstudianteListado;
  // Motivo por el que no puede inscribirse a esta cursada; undefined si puede.
  motivo?: string;
  // Motivo por el que solo puede anotarse como oyente (no bloquea, a diferencia de `motivo`).
  soloOyente?: string;
  // Cupo de intensificación restante de este estudiante.
  intensificacionesRestantes: number;
  // Avisos informativos sobre esta cursada, relevantes solo si a este estudiante le quedan
  // pocas inscripciones disponibles / si esta cursada es de otro turno al de sus demás cursadas.
  cargaHorariaAlta?: boolean;
  turnoDistinto?: boolean;
}

interface SeleccionActiva {
  tipo: TipoInscripcion;
  // Solo aplica cuando tipo es 'Intensifica': cursada en la que efectivamente intensificará.
  cursadaIntensificacionId?: number;
}

interface SeleccionEstudianteInscripcionModalProps {
  estudiantes: EstudianteConDisponibilidad[];
  // Cursadas donde se podría intensificar la materia de esta cursada (misma materia, mismo
  // ciclo lectivo, en cualquier curso): la cursada de destino es la misma para todo el lote.
  cursadaIntensificacionOpciones: CursadaOpcion[];
  // Cupo del aula antes de las selecciones de este lote (todavía sin confirmar).
  cupoAulaRestante: number;
  onClose: () => void;
  onInscribirSeleccionados: (seleccion: { id: number; tipo: TipoInscripcion; cursadaIntensificacionId?: number }[]) => void;
}

function SeleccionEstudianteInscripcionModal({
  estudiantes,
  cursadaIntensificacionOpciones,
  cupoAulaRestante,
  onClose,
  onInscribirSeleccionados,
}: SeleccionEstudianteInscripcionModalProps) {
  const [busqueda, setBusqueda] = useState('');
  // Un estudiante solo queda "seleccionado" para la inscripción masiva cuando se
  // toca su ícono de inscribir (lo que muestra el select acá abajo); mientras no
  // se toque, no forma parte del lote y no se inscribe.
  const [activos, setActivos] = useState<Record<number, SeleccionActiva>>({});

  const busquedaActiva = busqueda.trim() !== '';
  const coincideBusqueda = ({ estudiante }: EstudianteConDisponibilidad) =>
    norm(`${estudiante.apellido} ${estudiante.nombre}`).includes(norm(busqueda));

  // Sin una búsqueda activa se listan solo los que pueden inscribirse (comportamiento por
  // defecto). Al buscar a alguien puntualmente, también aparece si no cumple los requisitos
  // para esta cursada, pero atenuado y con el motivo, en vez de parecer que no existe.
  const visibles = estudiantes.filter(e => coincideBusqueda(e) && (busquedaActiva || e.motivo === undefined));
  const elegibles = estudiantes.filter(e => e.motivo === undefined);
  const cantidadSeleccionados = Object.keys(activos).length;
  const hayIntensificacionIncompleta = Object.values(activos).some(
    a => a.tipo === 'Intensifica' && a.cursadaIntensificacionId === undefined
  );
  // El cupo se va consumiendo con cada estudiante agregado al lote, incluso antes de confirmar.
  const cupoLive = cupoAulaRestante - cantidadSeleccionados;
  const sinCupoParaNuevos = cupoLive <= 0;

  const activarInscripcion = (id: number, soloOyente?: string) => {
    setActivos(prev => ({ ...prev, [id]: { tipo: soloOyente ? 'Oyente' : 'Normal' } }));
  };

  const cancelarInscripcion = (id: number) => {
    setActivos(prev => {
      const resto = { ...prev };
      delete resto[id];
      return resto;
    });
  };

  const cambiarTipo = (id: number, tipo: TipoInscripcion) => {
    setActivos(prev => ({
      ...prev,
      [id]: { tipo, cursadaIntensificacionId: tipo === 'Intensifica' ? prev[id]?.cursadaIntensificacionId : undefined },
    }));
  };

  const seleccionarCursadaIntensificacion = (id: number, cursadaIntensificacionId: number) => {
    setActivos(prev => (prev[id] ? { ...prev, [id]: { ...prev[id], cursadaIntensificacionId } } : prev));
  };

  const handleInscribirSeleccionados = () => {
    if (cantidadSeleccionados === 0 || hayIntensificacionIncompleta) return;
    onInscribirSeleccionados(
      Object.entries(activos).map(([id, { tipo, cursadaIntensificacionId }]) => ({ id: Number(id), tipo, cursadaIntensificacionId }))
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-4xl h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4 shrink-0">
          <div>
            <h2 className="font-headline text-headline-md font-bold text-on-surface">
              Seleccionar Estudiantes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Cupo del aula */}
        <div className="px-6 pt-4 shrink-0">
          <span className={`w-fit px-2.5 py-1 rounded-full font-label text-xs font-medium ${
            cupoLive <= 0 ? 'bg-error-container text-error' : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            {cupoLive <= 0 ? 'Sin cupo disponible en el aula' : `${cupoLive} ${cupoLive === 1 ? 'cupo' : 'cupos'} disponibles en el aula`}
          </span>
        </div>

        {/* Buscador + acción masiva */}
        <div className="px-6 pt-5 flex items-center justify-between gap-4 flex-wrap shrink-0">
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
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
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
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
          <button
            onClick={handleInscribirSeleccionados}
            disabled={cantidadSeleccionados === 0 || hayIntensificacionIncompleta}
            className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[1.25rem]">how_to_reg</span>
            Inscribir Seleccionados
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto scrollbar-custom flex-1">
          {elegibles.length === 0 && !busquedaActiva ? (
            <div className="bg-surface-container rounded-xl border border-outline-variant px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
              No hay estudiantes disponibles para inscribir a esta cursada.
            </div>
          ) : visibles.length === 0 ? (
            <div className="bg-surface-container rounded-xl border border-outline-variant px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
              No se encontraron estudiantes que coincidan con la búsqueda.
            </div>
          ) : (
            <>
              {/* Vista escritorio: tabla */}
              <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant">
                      <th className="w-[35%] text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estudiante</th>
                      <th className="w-[12%] text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">DNI</th>
                      <th className="w-[23%] text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estado</th>
                      {/* Ancho fijo (no auto, dado table-fixed) que ya contempla el estado activo de la
                          fila (select + botón cerrar): así ninguna fila reacomoda la columna al activarse. */}
                      <th className="w-[30%] text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {visibles.map(({ estudiante: est, motivo, soloOyente, intensificacionesRestantes, cargaHorariaAlta, turnoDistinto }) => {
                      const activo = activos[est.id];
                      const notas = [
                        ...(soloOyente ? [`Solo puede anotarse como oyente: ${soloOyente}`] : []),
                        ...(cargaHorariaAlta ? ['Esta cursada tiene más carga horaria que el promedio'] : []),
                        ...(turnoDistinto ? ['Turno distinto al resto de sus cursadas'] : []),
                      ];
                      return (
                        <tr
                          key={est.id}
                          className={`transition-colors duration-150 ${motivo ? 'opacity-50' : 'hover:bg-surface-container-high'}`}
                        >
                          <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium">
                            <span className="whitespace-nowrap">{est.apellido}, {est.nombre}</span>
                            {motivo && (
                              <span className="block font-normal text-xs text-on-surface-variant mt-0.5">{motivo}</span>
                            )}
                            {!motivo && notas.map(nota => (
                              <span key={nota} className="block font-normal text-xs text-on-surface-variant mt-0.5">{nota}</span>
                            ))}
                          </td>
                          <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{est.dni}</td>
                          <td className="px-4 py-3">
                            <EstadoBadge estado={est.estado} />
                          </td>
                          <td className="px-4 py-3">
                            {motivo ? (
                              <div className="flex justify-end">
                                <span className="p-1.5 rounded-lg text-on-surface-variant/50 cursor-not-allowed" title={motivo}>
                                  <span className="material-symbols-outlined text-[1.25rem] block leading-none">block</span>
                                </span>
                              </div>
                            ) : activo === undefined ? (
                              <div className="flex justify-end">
                                <button
                                  onClick={() => activarInscripcion(est.id, soloOyente)}
                                  disabled={sinCupoParaNuevos}
                                  title={sinCupoParaNuevos ? 'No hay más cupo disponible en el aula' : 'Inscribir'}
                                  className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                                >
                                  <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center justify-end gap-1.5">
                                  <SelectTipoInscripcion
                                    valor={activo.tipo}
                                    onSelect={(tipo) => cambiarTipo(est.id, tipo)}
                                    soloOyente={soloOyente}
                                    intensificacionesRestantes={intensificacionesRestantes}
                                  />
                                  <button
                                    onClick={() => cancelarInscripcion(est.id)}
                                    className="cursor-pointer p-0.5 rounded text-on-surface-variant hover:text-error transition-colors duration-150"
                                    title="Cancelar inscripción"
                                  >
                                    <span className="material-symbols-outlined text-[0.9rem] leading-none">close</span>
                                  </button>
                                </div>
                                {activo.tipo === 'Intensifica' && (
                                  <ComboboxCursadaIntensificacion
                                    opciones={cursadaIntensificacionOpciones}
                                    valor={activo.cursadaIntensificacionId}
                                    onSeleccionar={(cursadaId) => seleccionarCursadaIntensificacion(est.id, cursadaId)}
                                    error={activo.cursadaIntensificacionId === undefined}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>

              {/* Vista mobile/tablet: cards */}
              <div className="lg:hidden flex flex-col gap-3">
                {visibles.map(({ estudiante: est, motivo, soloOyente, intensificacionesRestantes, cargaHorariaAlta, turnoDistinto }) => {
                  const activo = activos[est.id];
                  const notas = [
                    ...(soloOyente ? [`Solo puede anotarse como oyente: ${soloOyente}`] : []),
                    ...(cargaHorariaAlta ? ['Esta cursada tiene más carga horaria que el promedio'] : []),
                    ...(turnoDistinto ? ['Turno distinto al resto de sus cursadas'] : []),
                  ];
                  return (
                    <div
                      key={est.id}
                      className={`bg-background rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3 ${motivo ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-body text-body-sm text-on-surface font-medium">{est.apellido}, {est.nombre}</p>
                          <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {est.dni}</p>
                          <div className="mt-1.5">
                            <EstadoBadge estado={est.estado} />
                          </div>
                          {motivo && (
                            <p className="font-body text-xs text-on-surface-variant mt-1.5">{motivo}</p>
                          )}
                          {!motivo && notas.map(nota => (
                            <p key={nota} className="font-body text-xs text-on-surface-variant mt-1.5">{nota}</p>
                          ))}
                        </div>
                        {!motivo && activo === undefined && (
                          <button
                            onClick={() => activarInscripcion(est.id, soloOyente)}
                            disabled={sinCupoParaNuevos}
                            title={sinCupoParaNuevos ? 'No hay más cupo disponible en el aula' : 'Inscribir'}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
                          </button>
                        )}
                      </div>
                      {!motivo && activo !== undefined && (
                        <div className="border-t border-outline-variant pt-3 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <SelectTipoInscripcion
                              valor={activo.tipo}
                              onSelect={(tipo) => cambiarTipo(est.id, tipo)}
                              soloOyente={soloOyente}
                              intensificacionesRestantes={intensificacionesRestantes}
                            />
                            <button
                              onClick={() => cancelarInscripcion(est.id)}
                              className="cursor-pointer p-0.5 rounded text-on-surface-variant hover:text-error transition-colors duration-150"
                              title="Cancelar inscripción"
                            >
                              <span className="material-symbols-outlined text-[0.9rem] leading-none">close</span>
                            </button>
                          </div>
                          {activo.tipo === 'Intensifica' && (
                            <ComboboxCursadaIntensificacion
                              opciones={cursadaIntensificacionOpciones}
                              valor={activo.cursadaIntensificacionId}
                              onSeleccionar={(cursadaId) => seleccionarCursadaIntensificacion(est.id, cursadaId)}
                              error={activo.cursadaIntensificacionId === undefined}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default SeleccionEstudianteInscripcionModal;
