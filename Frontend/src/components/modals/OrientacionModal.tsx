import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormOrientacion, ErroresOrientacion } from '../../types/formTypes/orientacionFormTypes';
import { CAMPOS_ORIENTACION } from '../../constants/orientacionForm';

interface OrientacionModalProps {
  modoEdicion: boolean;
  form: FormOrientacion;
  errores: ErroresOrientacion;
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function OrientacionModal({
  modoEdicion,
  form,
  errores,
  onClose,
  onGuardar,
  onChange,
}: OrientacionModalProps) {
  const { mostrarToast } = useToast();

  const handleCancelar = () => {
    mostrarToast(modoEdicion ? TOAST.CANCELANDO_EDICION : TOAST.CANCELANDO_CARGA);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            {modoEdicion ? 'Editar Orientación' : 'Nueva Orientación'}
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
          {CAMPOS_ORIENTACION.map(campo => (
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
                style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
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

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            {modoEdicion ? 'Guardar cambios' : 'Agregar Orientación'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrientacionModal;
