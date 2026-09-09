import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormMateria, ErroresMateria } from '../../types/formTypes/materiaFormTypes';
import { NIVELES_OPCIONES, TIPOS_MATERIA_OPCIONES } from '../../constants/materiaForm';

interface MateriaModalProps {
  modoEdicion: boolean;
  form: FormMateria;
  errores: ErroresMateria;
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function MateriaModal({
  modoEdicion,
  form,
  errores,
  onClose,
  onGuardar,
  onChange,
}: MateriaModalProps) {
  const { mostrarToast } = useToast();
  const [nivelOpen, setNivelOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [curricularOpen, setCurricularOpen] = useState(false);
  const curricularRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNivelOpen(false);
      }
      if (curricularRef.current && !curricularRef.current.contains(e.target as Node)) {
        setCurricularOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCancelar = () => {
    mostrarToast(modoEdicion ? TOAST.CANCELANDO_EDICION : TOAST.CANCELANDO_CARGA);
    onClose();
  };

  const seleccionarNivel = (valor: string) => {
    onChange({ target: { name: 'nivel', value: valor } } as React.ChangeEvent<HTMLInputElement>);
    setNivelOpen(false);
  };

  const seleccionarCurricular = (valor: string) => {
    onChange({ target: { name: 'curricular', value: valor } } as React.ChangeEvent<HTMLInputElement>);
    setCurricularOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar Materia' : 'Nueva Materia'}
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

          {/* Nombre */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="nombre" className="font-label text-label-md text-on-surface-variant">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              placeholder="Ej: Matemática"
              style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.nombre ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.nombre && (
              <p className="font-body text-xs text-error">{errores.nombre}</p>
            )}
          </div>

          {/* Nivel — dropdown estilo UsuarioModal */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-label-md text-on-surface-variant">Nivel</label>
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setNivelOpen(prev => !prev)}
                style={{ backgroundColor: 'var(--background)' }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
                  errores.nivel ? 'border-error' : 'border-outline-variant'
                }`}
              >
                <span style={{ color: form.nivel ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                  {form.nivel ? `${form.nivel}° nivel` : 'Seleccioná un nivel'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${nivelOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div
                className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                  nivelOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                  {NIVELES_OPCIONES.map(n => (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => seleccionarNivel(String(n))}
                        className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                          form.nivel === String(n)
                            ? 'bg-secondary-container text-on-secondary-container font-semibold'
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {n}° nivel
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {errores.nivel && (
              <p className="font-body text-xs text-error">{errores.nivel}</p>
            )}
          </div>

          {/* Curricular / Extracurricular — mismo estilo de dropdown que Nivel */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-label-md text-on-surface-variant">Tipo</label>
            <div ref={curricularRef} className="relative">
              <button
                type="button"
                onClick={() => setCurricularOpen(prev => !prev)}
                style={{ backgroundColor: 'var(--background)' }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
                  errores.curricular ? 'border-error' : 'border-outline-variant'
                }`}
              >
                <span style={{ color: form.curricular ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                  {form.curricular || 'Seleccioná un tipo'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${curricularOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div
                className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                  curricularOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <ul>
                  {TIPOS_MATERIA_OPCIONES.map(t => (
                    <li key={t}>
                      <button
                        type="button"
                        onClick={() => seleccionarCurricular(t)}
                        className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                          form.curricular === t
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
            {errores.curricular && (
              <p className="font-body text-xs text-error">{errores.curricular}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar cambios' : 'Agregar Materia'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default MateriaModal;
