import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormInscripcionMesa, ErroresInscripcionMesa } from '../../types/formTypes/inscripcionMesaFormTypes';
import type { EstudianteListado } from '../../types/EstudianteListado';
import { normalizarBusqueda as norm } from '../../constants/normalizarTexto';

interface InscripcionMesaModalProps {
  modoEdicion: boolean;
  form: FormInscripcionMesa;
  errores: ErroresInscripcionMesa;
  egresadosDisponibles: EstudianteListado[];
  estudianteActual?: EstudianteListado;
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onToggleAsistio: () => void;
}

function InscripcionMesaModal({
  modoEdicion,
  form,
  errores,
  egresadosDisponibles,
  estudianteActual,
  onClose,
  onGuardar,
  onChange,
  onToggleAsistio,
}: InscripcionMesaModalProps) {
  const { mostrarToast } = useToast();
  const nombreEgresado = (e: EstudianteListado) => `${e.apellido}, ${e.nombre}`;

  const [egresadoOpen, setEgresadoOpen] = useState(false);
  const egresadoRef = useRef<HTMLDivElement>(null);

  const [egresadoQuery, setEgresadoQuery] = useState(() => {
    const actual = egresadosDisponibles.find(e => String(e.dni) === form.estudianteDni);
    return actual ? nombreEgresado(actual) : '';
  });

  const cerrarEgresadoDropdown = () => {
    setEgresadoOpen(false);
    const actual = egresadosDisponibles.find(e => String(e.dni) === form.estudianteDni);
    setEgresadoQuery(actual ? nombreEgresado(actual) : '');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (egresadoRef.current && !egresadoRef.current.contains(e.target as Node)) cerrarEgresadoDropdown();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [egresadosDisponibles, form.estudianteDni]);

  const handleCancelar = () => {
    mostrarToast(modoEdicion ? TOAST.CANCELANDO_EDICION : TOAST.CANCELANDO_CARGA);
    onClose();
  };

  const seleccionarEgresado = (e: EstudianteListado) => {
    onChange({ target: { name: 'estudianteDni', value: String(e.dni) } } as React.ChangeEvent<HTMLInputElement>);
    setEgresadoQuery(nombreEgresado(e));
    setEgresadoOpen(false);
  };

  const egresadosFiltrados = egresadosDisponibles.filter(e => norm(nombreEgresado(e)).includes(norm(egresadoQuery)));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Cargar Nota' : 'Inscribir Egresado'}
          </h2>
          <button
            onClick={handleCancelar}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-custom px-6 py-5 flex flex-col gap-4">

          {modoEdicion ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-label-md text-on-surface-variant">Egresado</label>
                <p className="font-body text-body-sm text-on-surface px-3 py-2 rounded-lg bg-surface-container-high">
                  {estudianteActual ? `${estudianteActual.apellido}, ${estudianteActual.nombre}` : '—'}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nota" className="font-label text-label-md text-on-surface-variant">
                  Nota
                </label>
                <input
                  id="nota"
                  type="text"
                  name="nota"
                  value={form.nota}
                  onChange={onChange}
                  placeholder="Ej: 8"
                  inputMode="numeric"
                  style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                    errores.nota ? 'border-error' : 'border-outline-variant'
                  }`}
                />
                {errores.nota && (
                  <p className="font-body text-xs text-error">{errores.nota}</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-label text-label-md text-on-surface-variant">Asistió</span>
                <label className="switch-lg">
                  <input
                    type="checkbox"
                    checked={form.asistio}
                    onChange={onToggleAsistio}
                  />
                  <span className="switch-lg-track" />
                </label>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="estudianteDni" className="font-label text-label-md text-on-surface-variant">Egresado</label>
              <div ref={egresadoRef} className="relative">
                <input
                  id="estudianteDni"
                  type="text"
                  value={egresadoQuery}
                  onChange={e => { setEgresadoQuery(e.target.value); setEgresadoOpen(true); }}
                  onFocus={() => setEgresadoOpen(true)}
                  placeholder="Buscá por apellido o nombre"
                  autoComplete="off"
                  style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                  className={`w-full pl-3 pr-9 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                    errores.estudianteDni ? 'border-error' : 'border-outline-variant'
                  }`}
                />
                <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${egresadoOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>

                <div
                  className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                    egresadoOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                  }`}
                >
                  <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                    {egresadosFiltrados.length === 0 ? (
                      <li className="px-3 py-2 font-body text-body-sm text-on-surface-variant">No se encontraron egresados</li>
                    ) : (
                      egresadosFiltrados.map(e => (
                        <li key={e.id}>
                          <button
                            type="button"
                            onClick={() => seleccionarEgresado(e)}
                            className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                              form.estudianteDni === String(e.dni)
                                ? 'bg-secondary-container text-on-secondary-container font-semibold'
                                : 'text-on-surface hover:bg-surface-container-high'
                            }`}
                          >
                            {e.apellido}, {e.nombre} — DNI {e.dni}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              {errores.estudianteDni && (
                <p className="font-body text-xs text-error">{errores.estudianteDni}</p>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar nota' : 'Inscribir'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default InscripcionMesaModal;
