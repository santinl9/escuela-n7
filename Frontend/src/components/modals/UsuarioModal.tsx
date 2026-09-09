import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { Rol } from '../../types/Rol';
import type { FormUsuario, ErroresUsuario } from '../../types/formTypes/usuarioFormTypes';

interface UsuarioModalProps {
  form: FormUsuario;
  errores: ErroresUsuario;
  roles: Rol[];
  onClose: () => void;
  onGuardar: () => void;
  onRolChange: (idx: number, nombreRol: string) => void;
  onAgregarRol: () => void;
  onEliminarRol: (idx: number) => void;
}

function UsuarioModal({ form, errores, roles, onClose, onGuardar, onRolChange, onAgregarRol, onEliminarRol }: UsuarioModalProps) {
  const { mostrarToast } = useToast();
  const [rolAConfirmar, setRolAConfirmar] = useState<number | null>(null);
  const [rolAbierto, setRolAbierto] = useState<number | null>(null);
  const dropdownRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rolAbierto === null) return;
      const el = dropdownRefs.current.get(rolAbierto);
      if (el && !el.contains(e.target as Node)) setRolAbierto(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [rolAbierto]);

  const handleCancelar = () => {
    mostrarToast(TOAST.CANCELANDO_EDICION);
    onClose();
  };

  // Puede seguir agregando filas mientras haya roles del catálogo sin usar.
  const puedeAgregarRol = form.roles.length < roles.length;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 cursor-not-allowed">

      <div className="bg-background border border-outline-variant w-full max-w-2xl rounded-xl shadow-md cursor-auto h-[32rem] max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4 shrink-0">
          <h3 className="font-headline text-headline-md font-bold text-on-surface">
            Editar usuario
          </h3>
          <button
            onClick={handleCancelar}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto scrollbar-custom flex-1">

          {/* Personal — solo lectura, se gestiona desde Recursos Humanos > Personal */}
          <div className="flex flex-col gap-1.5">
            <div className="font-bold">
              {form.apellido}, {form.nombre} <strong className="text-primary">—</strong> DNI {form.dni}
            </div>
          </div>

          {/* Roles */}
          <div className="flex flex-col gap-4">
            <h4 className="font-label text-label-md font-bold text-on-surface">
              Roles
            </h4>

            {form.roles.map((rolSeleccionado, idx) => {
              // Cada fila solo ofrece los roles todavía no elegidos en otra fila (más el propio, para no perderlo de la lista).
              const opcionesDisponibles = roles.filter(r => r.nombre === rolSeleccionado || !form.roles.includes(r.nombre));
              const abierto = rolAbierto === idx;

              return (
                <div key={idx} className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xs text-on-surface-variant uppercase tracking-wide">
                      Rol {idx + 1}
                    </span>
                    <div className="flex items-center h-8">
                      {form.roles.length > 1 && (
                        rolAConfirmar === idx ? (
                          <div className="flex items-center gap-2">
                            <span className="font-label text-xs text-on-surface-variant">¿Eliminar?</span>
                            <button
                              type="button"
                              onClick={() => { onEliminarRol(idx); setRolAConfirmar(null); }}
                              className="cursor-pointer px-2.5 py-1 rounded-lg bg-error-container text-error font-label text-xs font-medium hover:opacity-80 transition-opacity"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setRolAConfirmar(null)}
                              className="cursor-pointer px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-label text-xs hover:bg-surface-container-high transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRolAConfirmar(idx)}
                            className="cursor-pointer p-1 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                            title="Eliminar rol"
                          >
                            <span className="material-symbols-outlined text-[1.1rem] leading-none">delete</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div ref={el => { if (el) dropdownRefs.current.set(idx, el); }} className="relative">
                    <button
                      type="button"
                      onClick={() => setRolAbierto(prev => (prev === idx ? null : idx))}
                      style={{ backgroundColor: 'var(--background)' }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer ${
                        errores.roles && !rolSeleccionado ? 'border-error' : 'border-outline-variant'
                      }`}
                    >
                      <span style={{ color: rolSeleccionado ? 'var(--on-surface)' : 'var(--on-surface-variant)' }}>
                        {rolSeleccionado || 'Seleccioná un rol'}
                      </span>
                      <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>

                    <div
                      className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
                        abierto ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                      }`}
                    >
                      <ul className="max-h-48 overflow-y-auto scrollbar-custom">
                        {opcionesDisponibles.map(r => (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => { onRolChange(idx, r.nombre); setRolAbierto(null); }}
                              className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                                rolSeleccionado === r.nombre
                                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                                  : 'text-on-surface hover:bg-surface-container-high'
                              }`}
                            >
                              {r.nombre}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}

            {errores.roles && (
              <p className="font-body text-xs text-error">{errores.roles}</p>
            )}

            <button
              type="button"
              onClick={onAgregarRol}
              disabled={!puedeAgregarRol}
              className="cursor-pointer self-start flex items-center gap-xs px-3 py-1.5 rounded-lg font-label text-label-md text-primary hover:bg-surface-container-high transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <span className="material-symbols-outlined text-[1.1rem]">add</span>
              Agregar rol
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl shrink-0">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  );
}

export default UsuarioModal;
