import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormPeriodoCarga, ErroresPeriodoCarga } from '../../types/formTypes/periodoCargaFormTypes';
import { TIPOS_PERIODO_CARGA_OPCIONES } from '../../constants/periodoCargaForm';

interface PeriodoCargaModalProps {
  modoEdicion: boolean;
  form: FormPeriodoCarga;
  errores: ErroresPeriodoCarga;
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function PeriodoCargaModal({
  modoEdicion,
  form,
  errores,
  onClose,
  onGuardar,
  onChange,
}: PeriodoCargaModalProps) {
  const { mostrarToast } = useToast();
  const [tipoOpen, setTipoOpen] = useState(false);
  const tipoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tipoRef.current && !tipoRef.current.contains(e.target as Node)) setTipoOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCancelar = () => {
    mostrarToast(modoEdicion ? TOAST.CANCELANDO_EDICION : TOAST.CANCELANDO_CARGA);
    onClose();
  };

  const seleccionarTipo = (valor: string) => {
    onChange({ target: { name: 'tipo', value: valor } } as React.ChangeEvent<HTMLInputElement>);
    setTipoOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar Período de Carga' : 'Nuevo Período de Carga'}
          </h2>
          <button
            onClick={handleCancelar}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-custom px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

          {/* Descripción */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="descripcion" className="font-label text-label-md text-on-surface-variant">
              Descripción
            </label>
            <input
              id="descripcion"
              type="text"
              name="descripcion"
              value={form.descripcion}
              onChange={onChange}
              placeholder="Ej: 1er Cuatrimestre"
              style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.descripcion ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.descripcion && (
              <p className="font-body text-xs text-error">{errores.descripcion}</p>
            )}
          </div>

          {/* Tipo de calificación — dropdown estilo MateriaModal */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="font-label text-label-md text-on-surface-variant">Tipo de calificación</label>
            <div ref={tipoRef} className="relative">
              <button
                type="button"
                onClick={() => setTipoOpen(prev => !prev)}
                style={{ backgroundColor: 'var(--background)' }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
                  errores.tipo ? 'border-error' : 'border-outline-variant'
                }`}
              >
                <span style={{ color: form.tipo ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                  {form.tipo || 'Seleccioná un tipo de calificación'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${tipoOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div
                className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                  tipoOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <ul className="overflow-hidden">
                  {TIPOS_PERIODO_CARGA_OPCIONES.map(t => (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() => seleccionarTipo(t)}
                        className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                          form.tipo === t
                            ? 'bg-secondary-container text-on-secondary-container font-semibold'
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {t}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {errores.tipo && (
              <p className="font-body text-xs text-error">{errores.tipo}</p>
            )}
          </div>

          {/* Fecha de inicio */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fechaIni" className="font-label text-label-md text-on-surface-variant">
              Fecha de inicio
            </label>
            <input
              id="fechaIni"
              type="date"
              name="fechaIni"
              value={form.fechaIni}
              onChange={onChange}
              style={{
                color: !form.fechaIni
                  ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)'
                  : 'var(--on-surface)',
                backgroundColor: 'var(--background)',
              }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.fechaIni ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.fechaIni && (
              <p className="font-body text-xs text-error">{errores.fechaIni}</p>
            )}
          </div>

          {/* Fecha de fin */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fechaFin" className="font-label text-label-md text-on-surface-variant">
              Fecha de fin
            </label>
            <input
              id="fechaFin"
              type="date"
              name="fechaFin"
              value={form.fechaFin}
              onChange={onChange}
              style={{
                color: !form.fechaFin
                  ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)'
                  : 'var(--on-surface)',
                backgroundColor: 'var(--background)',
              }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.fechaFin ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.fechaFin && (
              <p className="font-body text-xs text-error">{errores.fechaFin}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar cambios' : 'Agregar Período de Carga'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PeriodoCargaModal;
