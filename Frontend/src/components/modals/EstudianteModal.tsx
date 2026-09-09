import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type {
  FormEstudiante,
  ErroresPrincipales,
  ErroresContacto,
  ContactoForm,
} from '../../types/formTypes/estudianteFormTypes';
import { CAMPOS_FORM, CAMPOS_CONTACTO } from '../../constants/estudianteForm';

interface EstudianteModalProps {
  modoEdicion: boolean;
  form: FormEstudiante;
  errores: ErroresPrincipales;
  erroresContactos: ErroresContacto[];
  onClose: () => void; 

  onGuardar: () => void; 

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactoChange: (idx: number, campo: keyof ContactoForm, valor: string) => void;
  onAgregarContacto: () => void;
  onEliminarContacto: (idx: number) => void;

}

function EstudianteModal({
  modoEdicion,
  form,
  errores,
  erroresContactos,
  onClose,
  onGuardar,
  onChange,
  onContactoChange,
  onAgregarContacto,
  onEliminarContacto,
}: EstudianteModalProps) {
  const [contactoAConfirmar, setContactoAConfirmar] = useState<number | null>(null);
  const { mostrarToast } = useToast();

  const handleCancelar = () => {
    mostrarToast(modoEdicion ? TOAST.CANCELANDO_EDICION : TOAST.CANCELANDO_CARGA);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar Estudiante' : 'Nuevo Estudiante'}
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

          {/* Datos del estudiante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {CAMPOS_FORM.map(campo => ( 
              <div key={campo.name} className="flex flex-col gap-1.5">
                <label htmlFor={campo.name} className="font-label text-label-md text-on-surface-variant">
                  {campo.label}
                </label>
                <input
                  id={campo.name}
                  type={campo.type}
                  name={campo.name}
                  value={form[campo.name]}
                  onChange={onChange}
                  placeholder={campo.placeholder}
                  maxLength={campo.name === 'dni' ? 8 : campo.name === 'cuil' ? 13 : undefined}
                  inputMode={campo.name === 'dni' || campo.name === 'telefono' || campo.name === 'cuil' || campo.name === 'numero' ? 'numeric' : undefined}
                  style={{
                    color: campo.type === 'date' && !form[campo.name]
                      ? 'color-mix(in srgb, var(--on-surface) 38%, transparent)'
                      : 'var(--on-surface)',
                    backgroundColor: 'var(--background)',
                  }}
                  className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                    errores[campo.name] ? 'border-error' : 'border-outline-variant'
                  }`}
                />
                {errores[campo.name] && (
                  <p className="font-body text-xs text-error">{errores[campo.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Contactos de emergencia */}
          <div className="flex flex-col gap-4 border-t border-outline-variant pt-5">
            <h3 className="font-label text-label-md font-bold text-on-surface">
              Contactos de emergencia
            </h3>

            {form.contactos.map((contacto, idx) => (
              <div key={idx} className="bg-surface-container rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-label text-xs text-on-surface-variant uppercase tracking-wide">
                    Contacto {idx + 1}
                  </span>
                  <div className="flex items-center h-8">
                    {form.contactos.length > 1 && (
                      contactoAConfirmar === idx ? (
                        <div className="flex items-center gap-2">
                          <span className="font-label text-xs text-on-surface-variant">¿Eliminar?</span>
                          <button
                            type="button"
                            onClick={() => { onEliminarContacto(idx); setContactoAConfirmar(null); }}
                            className="cursor-pointer px-2.5 py-1 rounded-lg bg-error-container text-error font-label text-xs font-medium hover:opacity-80 transition-opacity"
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setContactoAConfirmar(null)}
                            className="cursor-pointer px-2.5 py-1 rounded-lg border border-outline-variant text-on-surface-variant font-label text-xs hover:bg-surface-container-high transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setContactoAConfirmar(idx)}
                          className="cursor-pointer p-1 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                          title="Eliminar contacto"
                        >
                          <span className="material-symbols-outlined text-[1.1rem] leading-none">delete</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {CAMPOS_CONTACTO.map(campo => (
                    <div key={campo.name} className="flex flex-col gap-1.5">
                      <label className="font-label text-label-md text-on-surface-variant">
                        {campo.label}
                      </label>
                      <input
                        type={campo.type}
                        value={contacto[campo.name]}
                        onChange={e => onContactoChange(idx, campo.name, e.target.value)}
                        placeholder={campo.placeholder}
                        maxLength={campo.name === 'cuil' ? 13 : undefined}
                        inputMode={campo.name === 'cuil' ? 'numeric' : undefined}
                        style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
                        className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                          erroresContactos[idx]?.[campo.name] ? 'border-error' : 'border-outline-variant'
                        }`}
                      />
                      {erroresContactos[idx]?.[campo.name] && (
                        <p className="font-body text-xs text-error">{erroresContactos[idx][campo.name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={onAgregarContacto}
              className="cursor-pointer self-start flex items-center gap-xs px-3 py-1.5 rounded-lg font-label text-label-md text-primary hover:bg-surface-container-high transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[1.1rem]">add</span>
              Agregar contacto
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar cambios' : 'Agregar Estudiante'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default EstudianteModal;
