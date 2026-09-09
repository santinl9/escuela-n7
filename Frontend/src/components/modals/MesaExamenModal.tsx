import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormMesaExamen, ErroresMesaExamen } from '../../types/formTypes/mesaExamenFormTypes';
import type { Materia } from '../../types/Materia';
import type { Personal } from '../../types/Personal';
import { normalizarBusqueda as norm } from '../../constants/normalizarTexto';

interface MesaExamenModalProps {
  modoEdicion: boolean;
  form: FormMesaExamen;
  errores: ErroresMesaExamen;
  materias: Materia[];
  personal: Personal[];
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function MesaExamenModal({
  modoEdicion,
  form,
  errores,
  materias,
  personal,
  onClose,
  onGuardar,
  onChange,
}: MesaExamenModalProps) {
  const { mostrarToast } = useToast();
  const [materiaOpen, setMateriaOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);
  const materiaRef = useRef<HTMLDivElement>(null);
  const personalRef = useRef<HTMLDivElement>(null);

  const nombrePersonal = (p: Personal) => `${p.apellido}, ${p.nombre}`;
  const labelMateria = (m: Materia) => `${m.nombre} ${m.nivel}°`;

  const [materiaQuery, setMateriaQuery] = useState(() => {
    const actual = materias.find(m => String(m.id) === form.materiaId);
    return actual ? labelMateria(actual) : '';
  });

  const [personalQuery, setPersonalQuery] = useState(() => {
    const actual = personal.find(p => p.id === form.personalId);
    return actual ? nombrePersonal(actual) : '';
  });

  const cerrarMateriaDropdown = () => {
    setMateriaOpen(false);
    const actual = materias.find(m => String(m.id) === form.materiaId);
    setMateriaQuery(actual ? labelMateria(actual) : '');
  };

  const cerrarPersonalDropdown = () => {
    setPersonalOpen(false);
    const actual = personal.find(p => p.id === form.personalId);
    setPersonalQuery(actual ? nombrePersonal(actual) : '');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (materiaRef.current && !materiaRef.current.contains(e.target as Node)) cerrarMateriaDropdown();
      if (personalRef.current && !personalRef.current.contains(e.target as Node)) cerrarPersonalDropdown();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materias, form.materiaId, personal, form.personalId]);

  const handleCancelar = () => {
    mostrarToast(modoEdicion ? TOAST.CANCELANDO_EDICION : TOAST.CANCELANDO_CARGA);
    onClose();
  };

  const seleccionarMateria = (m: Materia) => {
    onChange({ target: { name: 'materiaId', value: String(m.id) } } as React.ChangeEvent<HTMLInputElement>);
    setMateriaQuery(labelMateria(m));
    setMateriaOpen(false);
  };

  const seleccionarPersonal = (p: Personal) => {
    onChange({ target: { name: 'personalId', value: p.id } } as React.ChangeEvent<HTMLInputElement>);
    setPersonalQuery(nombrePersonal(p));
    setPersonalOpen(false);
  };

  const materiaFiltrada = materias.filter(m => norm(labelMateria(m)).includes(norm(materiaQuery)));
  const personalFiltrado = personal.filter(p => norm(nombrePersonal(p)).includes(norm(personalQuery)));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar Mesa de Examen' : 'Nueva Mesa de Examen'}
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

          {/* Materia — combobox con búsqueda en tiempo real, muestra el nivel de cada materia */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="materiaId" className="font-label text-label-md text-on-surface-variant">Materia</label>
            <div ref={materiaRef} className="relative">
              <input
                id="materiaId"
                type="text"
                value={materiaQuery}
                onChange={e => { setMateriaQuery(e.target.value); setMateriaOpen(true); }}
                onFocus={() => setMateriaOpen(true)}
                placeholder="Buscá por nombre de la materia"
                autoComplete="off"
                style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                className={`w-full pl-3 pr-9 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                  errores.materiaId ? 'border-error' : 'border-outline-variant'
                }`}
              />
              <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${materiaOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>

              <div
                className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                  materiaOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                  {materiaFiltrada.length === 0 ? (
                    <li className="px-3 py-2 font-body text-body-sm text-on-surface-variant">No se encontraron materias</li>
                  ) : (
                    materiaFiltrada.map(m => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => seleccionarMateria(m)}
                          className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                            form.materiaId === String(m.id)
                              ? 'bg-secondary-container text-on-secondary-container font-semibold'
                              : 'text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          {labelMateria(m)}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
            {errores.materiaId && (
              <p className="font-body text-xs text-error">{errores.materiaId}</p>
            )}
          </div>

          {/* Docente a cargo — combobox con búsqueda en tiempo real */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="personalId" className="font-label text-label-md text-on-surface-variant">Docente a cargo</label>
            <div ref={personalRef} className="relative">
              <input
                id="personalId"
                type="text"
                value={personalQuery}
                onChange={e => { setPersonalQuery(e.target.value); setPersonalOpen(true); }}
                onFocus={() => setPersonalOpen(true)}
                placeholder="Buscá por apellido o nombre"
                autoComplete="off"
                style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                className={`w-full pl-3 pr-9 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                  errores.personalId ? 'border-error' : 'border-outline-variant'
                }`}
              />
              <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${personalOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>

              <div
                className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                  personalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
              >
                <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                  {personalFiltrado.length === 0 ? (
                    <li className="px-3 py-2 font-body text-body-sm text-on-surface-variant">No se encontraron docentes</li>
                  ) : (
                    personalFiltrado.map(p => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => seleccionarPersonal(p)}
                          className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                            form.personalId === p.id
                              ? 'bg-secondary-container text-on-secondary-container font-semibold'
                              : 'text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          {nombrePersonal(p)}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
            {errores.personalId && (
              <p className="font-body text-xs text-error">{errores.personalId}</p>
            )}
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fecha" className="font-label text-label-md text-on-surface-variant">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={onChange}
              style={{
                color: !form.fecha
                  ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)'
                  : 'var(--on-surface)',
                backgroundColor: 'var(--background)',
              }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.fecha ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.fecha && (
              <p className="font-body text-xs text-error">{errores.fecha}</p>
            )}
          </div>

          {/* Hora */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hora" className="font-label text-label-md text-on-surface-variant">
              Hora
            </label>
            <input
              id="hora"
              type="time"
              name="hora"
              value={form.hora}
              onChange={onChange}
              style={{
                color: !form.hora
                  ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)'
                  : 'var(--on-surface)',
                backgroundColor: 'var(--background)',
              }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.hora ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.hora && (
              <p className="font-body text-xs text-error">{errores.hora}</p>
            )}
          </div>

          {/* Cupo */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="cupo" className="font-label text-label-md text-on-surface-variant">
              Cupo
            </label>
            <input
              id="cupo"
              type="text"
              name="cupo"
              value={form.cupo}
              onChange={onChange}
              placeholder="Ej: 15"
              inputMode="numeric"
              style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.cupo ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.cupo && (
              <p className="font-body text-xs text-error">{errores.cupo}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar cambios' : 'Agregar Mesa de Examen'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default MesaExamenModal;
