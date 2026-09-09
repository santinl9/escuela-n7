import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormCicloLectivo, ErroresCicloLectivo } from '../../types/formTypes/cicloLectivoFormTypes';

interface CicloLectivoModalProps {
  modoEdicion: boolean;
  form: FormCicloLectivo;
  errores: ErroresCicloLectivo;
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function CicloLectivoModal({
  modoEdicion,
  form,
  errores,
  onClose,
  onGuardar,
  onChange,
}: CicloLectivoModalProps) {
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
            {modoEdicion ? 'Editar Ciclo Lectivo' : 'Nuevo Ciclo Lectivo'}
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
            {modoEdicion ? 'Guardar cambios' : 'Agregar Ciclo Lectivo'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default CicloLectivoModal;
