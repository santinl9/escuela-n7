import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { BloqueCursadaForm, ErroresBloqueCursada, ErroresCursada, FormCursada } from '../../types/formTypes/cursadaFormTypes';
import type { OpcionConLabel } from '../../types/OpcionConLabel';
import { TIPOS_CURSADA_OPCIONES } from '../../constants/cursadaForm';
import { DIAS_SEMANA_OPCIONES } from '../../constants/bloqueHorarioForm';

interface CursadaModalProps {
  modoEdicion: boolean;
  form: FormCursada;
  errores: ErroresCursada;
  erroresBloques: ErroresBloqueCursada[];
  errorBloques?: string;
  materiaOpciones: OpcionConLabel[];
  aulaOpciones: OpcionConLabel[];
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBloqueChange: (idx: number, campo: keyof BloqueCursadaForm, valor: string) => void;
  onAgregarBloque: () => void;
  onEliminarBloque: (idx: number) => void;
}

interface DropdownCampoOpcionesProps {
  label: string;
  valor: string;
  opciones: OpcionConLabel[];
  placeholder: string;
  sinOpcionesTexto: string;
  error?: string;
  onSelect: (valor: string) => void;
}

function DropdownCampoOpciones({ label, valor, opciones, placeholder, sinOpcionesTexto, error, onSelect }: DropdownCampoOpcionesProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actual = opciones.find(o => String(o.id) === valor);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-label-md text-on-surface-variant">{label}</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          style={{ backgroundColor: 'var(--background)' }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
            error ? 'border-error' : 'border-outline-variant'
          }`}
        >
          <span style={{ color: actual ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
            {actual ? actual.label : placeholder}
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <div
          className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
            open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <ul className="overflow-hidden max-h-48 overflow-y-auto scrollbar-custom">
            {opciones.length === 0 ? (
              <li className="px-3 py-2 font-body text-body-sm text-on-surface-variant">{sinOpcionesTexto}</li>
            ) : (
              opciones.map(o => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => { onSelect(String(o.id)); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                      valor === String(o.id) ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}

interface DropdownDiaProps {
  valor: string;
  error?: string;
  onSelect: (valor: string) => void;
}

function DropdownDia({ valor, error, onSelect }: DropdownDiaProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-label text-label-md text-on-surface-variant">Día</label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          style={{ backgroundColor: 'var(--background)' }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
            error ? 'border-error' : 'border-outline-variant'
          }`}
        >
          <span style={{ color: valor ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
            {valor || 'Seleccioná un día'}
          </span>
          <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <div
          className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
            open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          <ul className="overflow-hidden">
            {DIAS_SEMANA_OPCIONES.map(d => (
              <li key={d}>
                <button
                  type="button"
                  onClick={() => { onSelect(d); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                    valor === d ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {d}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {error && <p className="font-body text-xs text-error">{error}</p>}
    </div>
  );
}

function CursadaModal({
  modoEdicion,
  form,
  errores,
  erroresBloques,
  errorBloques,
  materiaOpciones,
  aulaOpciones,
  onClose,
  onGuardar,
  onChange,
  onBloqueChange,
  onAgregarBloque,
  onEliminarBloque,
}: CursadaModalProps) {
  const { mostrarToast } = useToast();
  const [tipoOpen, setTipoOpen] = useState(false);
  const [bloqueAConfirmar, setBloqueAConfirmar] = useState<number | null>(null);
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

  const seleccionarCampo = (name: string, valor: string) => {
    onChange({ target: { name, value: valor } } as React.ChangeEvent<HTMLInputElement>);
  };

  const seleccionarTipo = (valor: string) => {
    seleccionarCampo('tipo', valor);
    setTipoOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4 shrink-0">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar Cursada' : 'Nueva Cursada'}
          </h2>
          <button
            onClick={handleCancelar}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto scrollbar-custom flex flex-col gap-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">

            <DropdownCampoOpciones
              label="Materia"
              valor={form.materiaId}
              opciones={materiaOpciones}
              placeholder="Seleccioná una materia"
              sinOpcionesTexto="No hay materias disponibles para el nivel de este curso"
              error={errores.materiaId}
              onSelect={v => seleccionarCampo('materiaId', v)}
            />

            <DropdownCampoOpciones
              label="Aula"
              valor={form.aulaId}
              opciones={aulaOpciones}
              placeholder="Seleccioná un aula"
              sinOpcionesTexto="No hay aulas disponibles"
              error={errores.aulaId}
              onSelect={v => seleccionarCampo('aulaId', v)}
            />

            {/* Tipo — dropdown estilo MateriaModal */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-md text-on-surface-variant">Tipo</label>
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
                    {form.tipo || 'Seleccioná un tipo'}
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
                  <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                    {TIPOS_CURSADA_OPCIONES.map(t => (
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

          </div>

          {/* Bloques horarios — mismo patrón que los contactos de emergencia del estudiante:
              los que ya tienen id son bloques existentes que se reutilizan, y los que no
              tienen id se crean junto con la cursada al guardar. */}
          <div className="flex flex-col gap-4 border-t border-outline-variant pt-5">
            <h3 className="font-label text-label-md font-bold text-on-surface">
              Bloques horarios
            </h3>

            {errorBloques && (
              <p className="font-body text-xs text-error">{errorBloques}</p>
            )}

            {form.bloques.length === 0 ? (
              <p className="font-body text-body-sm text-on-surface-variant">
                Esta cursada todavía no tiene bloques horarios asignados.
              </p>
            ) : (
              form.bloques.map((bloque, idx) => (
                <div key={idx} className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xs text-on-surface-variant uppercase tracking-wide">
                      {`Bloque ${idx + 1}`}
                    </span>
                    <div className="flex items-center h-8">
                      {form.bloques.length > 1 && (
                        bloqueAConfirmar === idx ? (
                          <div className="flex items-center gap-2">
                            <span className="font-label text-xs text-on-surface-variant">¿Eliminar?</span>
                            <button
                              type="button"
                              onClick={() => { onEliminarBloque(idx); setBloqueAConfirmar(null); }}
                              className="cursor-pointer px-2.5 py-1 rounded-lg bg-error-container text-error font-label text-xs font-medium hover:opacity-80 transition-opacity"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setBloqueAConfirmar(null)}
                              className="cursor-pointer px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-label text-xs hover:bg-surface-container-high transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBloqueAConfirmar(idx)}
                            className="cursor-pointer p-1 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                            title="Eliminar bloque horario"
                          >
                            <span className="material-symbols-outlined text-[1.1rem] leading-none">delete</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
                    <DropdownDia
                      valor={bloque.dia}
                      error={erroresBloques[idx]?.dia}
                      onSelect={v => onBloqueChange(idx, 'dia', v)}
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label text-label-md text-on-surface-variant">Hora de inicio</label>
                      <input
                        type="time"
                        value={bloque.horaIni}
                        onChange={e => onBloqueChange(idx, 'horaIni', e.target.value)}
                        style={{
                          color: !bloque.horaIni
                            ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)'
                            : 'var(--on-surface)',
                          backgroundColor: 'var(--background)',
                        }}
                        className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                          erroresBloques[idx]?.horaIni ? 'border-error' : 'border-outline-variant'
                        }`}
                      />
                      {erroresBloques[idx]?.horaIni && (
                        <p className="font-body text-xs text-error">{erroresBloques[idx].horaIni}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label text-label-md text-on-surface-variant">Hora de fin</label>
                      <input
                        type="time"
                        value={bloque.horaFin}
                        onChange={e => onBloqueChange(idx, 'horaFin', e.target.value)}
                        style={{
                          color: !bloque.horaFin
                            ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)'
                            : 'var(--on-surface)',
                          backgroundColor: 'var(--background)',
                        }}
                        className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                          erroresBloques[idx]?.horaFin ? 'border-error' : 'border-outline-variant'
                        }`}
                      />
                      {erroresBloques[idx]?.horaFin && (
                        <p className="font-body text-xs text-error">{erroresBloques[idx].horaFin}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              type="button"
              onClick={onAgregarBloque}
              className="cursor-pointer self-start flex items-center gap-xs px-3 py-1.5 rounded-lg font-label text-label-md text-primary hover:bg-surface-container-high transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[1.1rem]">add</span>
              Agregar bloque horario
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl shrink-0">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar cambios' : 'Agregar Cursada'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CursadaModal;
