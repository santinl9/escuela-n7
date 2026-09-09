import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormCurso, ErroresCurso } from '../../types/formTypes/cursoFormTypes';
import { NIVELES_OPCIONES, NIVELES_CON_ORIENTACION, TURNOS_OPCIONES } from '../../constants/cursoForm';

interface CursoModalProps {
  modoEdicion: boolean;
  form: FormCurso;
  errores: ErroresCurso;
  orientacionOpciones: { id: number; nombre: string }[];
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function CursoModal({
  modoEdicion,
  form,
  errores,
  orientacionOpciones,
  onClose,
  onGuardar,
  onChange,
}: CursoModalProps) {
  const { mostrarToast } = useToast();
  const [nivelOpen, setNivelOpen] = useState(false);
  const [turnoOpen, setTurnoOpen] = useState(false);
  const [orientacionOpen, setOrientacionOpen] = useState(false);
  const nivelRef = useRef<HTMLDivElement>(null);
  const turnoRef = useRef<HTMLDivElement>(null);
  const orientacionRef = useRef<HTMLDivElement>(null);

  const requiereOrientacion = NIVELES_CON_ORIENTACION.includes(Number(form.nivel));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (nivelRef.current && !nivelRef.current.contains(e.target as Node)) setNivelOpen(false);
      if (turnoRef.current && !turnoRef.current.contains(e.target as Node)) setTurnoOpen(false);
      if (orientacionRef.current && !orientacionRef.current.contains(e.target as Node)) setOrientacionOpen(false);
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

  const handleDivisionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
    onChange({ target: { name: 'nombre', value: valor } } as React.ChangeEvent<HTMLInputElement>);
  };

  const seleccionarTurno = (valor: string) => {
    onChange({ target: { name: 'turno', value: valor } } as React.ChangeEvent<HTMLInputElement>);
    setTurnoOpen(false);
  };

  const seleccionarOrientacion = (valor: string) => {
    onChange({ target: { name: 'orientacionId', value: valor } } as React.ChangeEvent<HTMLInputElement>);
    setOrientacionOpen(false);
  };

  const turnoLabelActual = TURNOS_OPCIONES.find(t => t.value === form.turno)?.label;
  const orientacionLabelActual = orientacionOpciones.find(e => String(e.id) === form.orientacionId)?.nombre;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar Curso' : 'Nuevo Curso'}
          </h2>
          <button
            onClick={handleCancelar}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-custom px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">

          {/* Nivel — dropdown estilo MateriaModal */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-label-md text-on-surface-variant">Nivel</label>
            <div ref={nivelRef} className="relative">
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

          {/* División — una única letra, siempre en mayúscula */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="font-label text-label-md text-on-surface-variant">División</label>
            <input
              id="nombre"
              type="text"
              maxLength={1}
              value={form.nombre}
              onChange={handleDivisionChange}
              placeholder="Ej: L"
              style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.nombre ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.nombre && (
              <p className="font-body text-xs text-error">{errores.nombre}</p>
            )}
          </div>

          {/* Turno — dropdown estilo MateriaModal */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-label-md text-on-surface-variant">Turno</label>
            <div ref={turnoRef} className="relative">
              <button
                type="button"
                onClick={() => setTurnoOpen(prev => !prev)}
                style={{ backgroundColor: 'var(--background)' }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
                  errores.turno ? 'border-error' : 'border-outline-variant'
                }`}
              >
                <span style={{ color: form.turno ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                  {turnoLabelActual ?? 'Seleccioná un turno'}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${turnoOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div
                className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                  turnoOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                  {TURNOS_OPCIONES.map(t => (
                    <li key={t.value}>
                      <button
                        type="button"
                        onClick={() => seleccionarTurno(t.value)}
                        className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                          form.turno === t.value
                            ? 'bg-secondary-container text-on-secondary-container font-semibold'
                            : 'text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {t.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {errores.turno && (
              <p className="font-body text-xs text-error">{errores.turno}</p>
            )}
          </div>

          {/* Orientación — solo aplica a cursos de 4to, 5to y 6to año */}
          {requiereOrientacion && (
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-md text-on-surface-variant">Orientación</label>
              <div ref={orientacionRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOrientacionOpen(prev => !prev)}
                  style={{ backgroundColor: 'var(--background)' }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
                    errores.orientacionId ? 'border-error' : 'border-outline-variant'
                  }`}
                >
                  <span style={{ color: form.orientacionId ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                    {orientacionLabelActual ?? 'Seleccioná una orientación'}
                  </span>
                  <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${orientacionOpen ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                <div
                  className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                    orientacionOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                  }`}
                >
                  <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                    {orientacionOpciones.map(esp => (
                      <li key={esp.id}>
                        <button
                          type="button"
                          onClick={() => seleccionarOrientacion(String(esp.id))}
                          className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                            form.orientacionId === String(esp.id)
                              ? 'bg-secondary-container text-on-secondary-container font-semibold'
                              : 'text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          {esp.nombre}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {errores.orientacionId && (
                <p className="font-body text-xs text-error">{errores.orientacionId}</p>
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
            {modoEdicion ? 'Guardar cambios' : 'Agregar Curso'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CursoModal;
