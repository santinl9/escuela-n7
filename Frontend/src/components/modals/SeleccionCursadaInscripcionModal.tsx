import { Fragment, useState } from 'react';
import type { TipoCursada } from '../../types/Cursada';
import type { TipoInscripcion } from '../../types/Inscripcion';
import { normalizarBusqueda as norm } from '../../constants/normalizarTexto';
import SelectTipoInscripcion from '../elements/SelectTipoInscripcion';
import SeleccionCursadaIntensificacionModal from './SeleccionCursadaIntensificacionModal';
import type { CursadaOpcion } from './CargaIntensificacionModal';

export interface CursadaSugerida {
  id: number;
  materiaNombre: string;
  cursoNombre: string;
  tipo: TipoCursada;
  cupoAulaRestante: number;
  cargaHorariaAlta?: boolean;
  turnoDistinto?: boolean;
}

interface CursadaConDisponibilidad {
  cursada: CursadaSugerida;
  // Motivo por el que el estudiante no puede inscribirse a esta cursada; undefined si puede.
  motivo?: string;
  // Motivo por el que solo puede anotarse como oyente (no bloquea, a diferencia de `motivo`).
  soloOyente?: string;
}

interface SeleccionActiva {
  cursadaId: number;
  tipo: TipoInscripcion;
  // Solo aplica cuando tipo es 'Intensifica': cursada en la que efectivamente intensificará.
  cursadaIntensificacionId?: number;
}

interface SeleccionCursadaInscripcionModalProps {
  estudianteNombre: string;
  cursadas: CursadaConDisponibilidad[];
  // Cursadas donde podría intensificar la materia de la cursada indicada (misma materia,
  // mismo ciclo lectivo, en cualquier curso).
  cursadaIntensificacionOpcionesDe: (cursadaId: number) => CursadaOpcion[];
  // Cupo de intensificación restante del estudiante (constante: el estudiante está fijo en este modal).
  intensificacionesRestantes: number;
  onClose: () => void;
  onInscribir: (seleccion: { cursadaId: number; tipo: TipoInscripcion; cursadaIntensificacionId?: number }) => void;
}

// A diferencia de SeleccionEstudianteInscripcionModal (que inscribe varios estudiantes a
// una misma cursada), acá el estudiante ya está fijo y se elige una única cursada por vez:
// no hay selección múltiple ni un botón de acción masiva, cada fila se confirma en el momento.
function SeleccionCursadaInscripcionModal({
  estudianteNombre,
  cursadas,
  cursadaIntensificacionOpcionesDe,
  intensificacionesRestantes,
  onClose,
  onInscribir,
}: SeleccionCursadaInscripcionModalProps) {
  const [busqueda, setBusqueda] = useState('');
  const [activa, setActiva] = useState<SeleccionActiva | null>(null);
  const [intensificacionAbierta, setIntensificacionAbierta] = useState(false);

  const busquedaActiva = busqueda.trim() !== '';
  const coincideBusqueda = ({ cursada }: CursadaConDisponibilidad) =>
    norm(`${cursada.materiaNombre} ${cursada.cursoNombre}`).includes(norm(busqueda));

  // Sin una búsqueda activa se listan solo las cursadas a las que puede inscribirse
  // (comportamiento por defecto). Al buscar una en particular, también aparece si no
  // cumple los requisitos, pero atenuada y con el motivo, en vez de parecer que no existe.
  const visibles = cursadas.filter(c => coincideBusqueda(c) && (busquedaActiva || c.motivo === undefined));
  const elegibles = cursadas.filter(c => c.motivo === undefined);

  const activarInscripcion = (cursadaId: number) => {
    const soloOyente = cursadas.find(c => c.cursada.id === cursadaId)?.soloOyente;
    setActiva({ cursadaId, tipo: soloOyente ? 'Oyente' : 'Normal' });
  };
  const cancelarInscripcion = () => setActiva(null);
  const cambiarTipo = (tipo: TipoInscripcion) => {
    setActiva(prev => (prev ? { ...prev, tipo, cursadaIntensificacionId: tipo === 'Intensifica' ? prev.cursadaIntensificacionId : undefined } : prev));
    if (tipo === 'Intensifica') setIntensificacionAbierta(true);
  };

  // Avisos informativos que se muestran debajo de los datos de la cursada, no bloquean nada.
  const notasDe = (cursada: CursadaSugerida, soloOyente?: string): string[] => {
    const notas: string[] = [];
    if (soloOyente) notas.push(`Solo puede anotarse como oyente: ${soloOyente}`);
    if (cursada.cargaHorariaAlta) notas.push('Esta cursada tiene más carga horaria que el promedio');
    if (cursada.turnoDistinto) notas.push('Turno distinto al resto de sus cursadas');
    return notas;
  };

  const badgeCupo = (cupo: number) => (
    <span className={`w-fit px-2 py-0.5 rounded-full font-label text-xs font-medium ${
      cupo <= 0 ? 'bg-error-container text-error' : 'bg-surface-container-high text-on-surface-variant'
    }`}>
      {cupo <= 0 ? 'Sin cupo' : `${cupo} ${cupo === 1 ? 'cupo' : 'cupos'}`}
    </span>
  );

  const handleConfirmar = () => {
    if (!activa) return;
    if (activa.tipo === 'Intensifica' && activa.cursadaIntensificacionId === undefined) return;
    onInscribir(activa);
  };

  const filaConfirmacion = (cursada: CursadaSugerida, soloOyente?: string) => {
    const opcionesIntensificacion = activa?.tipo === 'Intensifica' ? cursadaIntensificacionOpcionesDe(cursada.id) : [];
    const cursadaIntensifElegida = activa?.cursadaIntensificacionId !== undefined
      ? opcionesIntensificacion.find(c => c.id === activa.cursadaIntensificacionId)
      : undefined;
    const faltaCursadaIntensificacion = activa?.tipo === 'Intensifica' && activa.cursadaIntensificacionId === undefined;

    return (
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="font-body text-body-sm text-on-surface">
          ¿Confirmás inscribir a <strong>{estudianteNombre}</strong> a {cursada.materiaNombre} · {cursada.cursoNombre}?
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {activa && (
            <SelectTipoInscripcion
              valor={activa.tipo}
              onSelect={cambiarTipo}
              soloOyente={soloOyente}
              intensificacionesRestantes={intensificacionesRestantes}
            />
          )}
          {activa?.tipo === 'Intensifica' && (
            <button
              type="button"
              onClick={() => setIntensificacionAbierta(true)}
              className={`cursor-pointer px-2.5 py-2 rounded-lg border font-body text-body-sm transition-colors duration-150 ${
                faltaCursadaIntensificacion ? 'border-error text-error' : 'border-outline-variant text-on-surface hover:bg-surface-container-high'
              }`}
              title="Elegir la cursada en la que intensificará"
            >
              {cursadaIntensifElegida ? `Intensifica en ${cursadaIntensifElegida.materiaNombre} · ${cursadaIntensifElegida.cursoNombre}` : 'Elegir cursada de intensificación'}
            </button>
          )}
          <button
            onClick={handleConfirmar}
            disabled={faltaCursadaIntensificacion}
            className="cursor-pointer flex items-center gap-xs px-3 py-2 bg-primary text-background font-label text-label-md rounded-lg hover:opacity-90 transition-all duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
          <button
            onClick={cancelarInscripcion}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:text-error transition-colors duration-150"
            title="Cancelar"
          >
            <span className="material-symbols-outlined text-[1.1rem] leading-none">close</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-4xl h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4 shrink-0">
          <div>
            <h2 className="font-headline text-headline-md font-bold text-on-surface">
              Inscribir a una Cursada
            </h2>
            <p className="font-body text-body-sm text-on-surface-variant mt-0.5">{estudianteNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="px-6 pt-5 shrink-0">
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
              placeholder="Buscar por materia o curso..."
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
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto scrollbar-custom flex-1">
          {elegibles.length === 0 && !busquedaActiva ? (
            <div className="bg-surface-container rounded-xl border border-outline-variant px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
              No hay cursadas disponibles para inscribir a este estudiante.
            </div>
          ) : visibles.length === 0 ? (
            <div className="bg-surface-container rounded-xl border border-outline-variant px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
              No se encontraron cursadas que coincidan con la búsqueda.
            </div>
          ) : (
            <>
              {/* Vista escritorio: tabla */}
              <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant">
                      <th className="w-[45%] text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Cursada</th>
                      <th className="w-[25%] text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Tipo de cursada</th>
                      <th className="w-[30%] text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {visibles.map(({ cursada, motivo, soloOyente }) => {
                      const esActiva = activa?.cursadaId === cursada.id;
                      const otraActiva = activa !== null && !esActiva;
                      const notas = notasDe(cursada, soloOyente);
                      return (
                        <Fragment key={cursada.id}>
                          <tr
                            className={`transition-colors duration-150 ${motivo ? 'opacity-50' : otraActiva ? 'opacity-50' : 'hover:bg-surface-container-high'}`}
                          >
                            <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium">
                              <span className="whitespace-nowrap">{cursada.materiaNombre} · {cursada.cursoNombre}</span>
                              {motivo && (
                                <span className="block font-normal text-xs text-on-surface-variant mt-0.5">{motivo}</span>
                              )}
                              {!motivo && notas.map(nota => (
                                <span key={nota} className="block font-normal text-xs text-on-surface-variant mt-0.5">{nota}</span>
                              ))}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`w-fit px-2.5 py-1 rounded-full font-label text-xs font-medium ${
                                  cursada.tipo === 'Extracurricular'
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : 'bg-surface-container-high text-on-surface'
                                }`}>
                                  {cursada.tipo}
                                </span>
                                {badgeCupo(cursada.cupoAulaRestante)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {motivo ? (
                                <div className="flex justify-end">
                                  <span className="p-1.5 rounded-lg text-on-surface-variant/50 cursor-not-allowed" title={motivo}>
                                    <span className="material-symbols-outlined text-[1.25rem] block leading-none">block</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => activarInscripcion(cursada.id)}
                                    disabled={otraActiva}
                                    className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant"
                                    title="Inscribir"
                                  >
                                    <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          {esActiva && (
                            <tr className="bg-secondary-container/20">
                              <td colSpan={3} className="px-4 py-3">
                                {filaConfirmacion(cursada, soloOyente)}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>

              {/* Vista mobile/tablet: cards */}
              <div className="lg:hidden flex flex-col gap-3">
                {visibles.map(({ cursada, motivo, soloOyente }) => {
                  const esActiva = activa?.cursadaId === cursada.id;
                  const otraActiva = activa !== null && !esActiva;
                  const notas = notasDe(cursada, soloOyente);
                  return (
                    <div
                      key={cursada.id}
                      className={`bg-background rounded-xl border border-outline-variant shadow-sm p-4 flex flex-col gap-3 ${motivo ? 'opacity-50' : otraActiva ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-body text-body-sm text-on-surface font-medium">{cursada.materiaNombre} · {cursada.cursoNombre}</p>
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className={`w-fit px-2.5 py-1 rounded-full font-label text-xs font-medium ${
                              cursada.tipo === 'Extracurricular'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : 'bg-surface-container-high text-on-surface'
                            }`}>
                              {cursada.tipo}
                            </span>
                            {badgeCupo(cursada.cupoAulaRestante)}
                          </div>
                          {motivo && (
                            <p className="font-body text-xs text-on-surface-variant mt-1.5">{motivo}</p>
                          )}
                          {!motivo && notas.map(nota => (
                            <p key={nota} className="font-body text-xs text-on-surface-variant mt-1.5">{nota}</p>
                          ))}
                        </div>
                        {!motivo && !esActiva && (
                          <button
                            onClick={() => activarInscripcion(cursada.id)}
                            disabled={otraActiva}
                            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150 shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Inscribir"
                          >
                            <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
                          </button>
                        )}
                      </div>
                      {esActiva && (
                        <div className="border-t border-outline-variant pt-3 flex flex-col gap-2">
                          {filaConfirmacion(cursada, soloOyente)}
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

    {intensificacionAbierta && activa && (
      <SeleccionCursadaIntensificacionModal
        estudianteNombre={estudianteNombre}
        cursadaOpciones={cursadaIntensificacionOpcionesDe(activa.cursadaId)}
        valorInicial={activa.cursadaIntensificacionId}
        onConfirmar={cursadaIntensificacionId => {
          setActiva(prev => (prev ? { ...prev, cursadaIntensificacionId } : prev));
          setIntensificacionAbierta(false);
        }}
        onClose={() => setIntensificacionAbierta(false)}
      />
    )}
    </Fragment>
  );
}

export default SeleccionCursadaInscripcionModal;
