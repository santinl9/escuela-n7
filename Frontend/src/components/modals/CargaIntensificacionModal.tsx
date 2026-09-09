import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';
import type { FormCargaIntensificacion, ErroresCargaIntensificacion } from '../../types/formTypes/cargaIntensificacionFormTypes';

export interface CursadaOpcion {
  id: number;
  materiaNombre: string;
  cursoNombre: string;
}

interface CargaIntensificacionModalProps {
  estudianteNombre: string;
  // Cursada en la que efectivamente intensifica: se define una única vez al inscribir
  // (ver SeleccionCursadaIntensificacionModal), no acá.
  cursadaIntensificacionNombre: string;
  form: FormCargaIntensificacion;
  errores: ErroresCargaIntensificacion;
  onClose: () => void;
  onGuardar: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function CargaIntensificacionModal({
  estudianteNombre,
  cursadaIntensificacionNombre,
  form,
  errores,
  onClose,
  onGuardar,
  onChange,
}: CargaIntensificacionModalProps) {
  const { mostrarToast } = useToast();

  const handleCancelar = () => {
    mostrarToast(TOAST.CANCELANDO_CARGA);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-2xl max-h-[90vh] flex flex-col cursor-auto">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <h2 className="font-headline text-headline-md font-bold text-on-surface">
            Cargar Calificación de Intensificación
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

          <div className="flex flex-col gap-1.5">
            <label className="font-label text-label-md text-on-surface-variant">Estudiante</label>
            <p className="font-body text-body-sm text-on-surface px-3 py-2 rounded-lg bg-surface-container-high">
              {estudianteNombre}
            </p>
          </div>

          {/* Cursada en la que intensifica — se definió al inscribir, no se puede cambiar acá */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label text-label-md text-on-surface-variant">
              Cursada en la que intensifica
            </label>
            <p className="font-body text-body-sm text-on-surface px-3 py-2 rounded-lg bg-surface-container-high">
              {cursadaIntensificacionNombre}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="calificacionFinal" className="font-label text-label-md text-on-surface-variant">
              Calificación Final
            </label>
            <input
              id="calificacionFinal"
              type="text"
              name="calificacionFinal"
              value={form.calificacionFinal}
              onChange={onChange}
              placeholder="Ej: 8"
              inputMode="numeric"
              style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
              className={`w-full px-3 py-2 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
                errores.calificacionFinal ? 'border-error' : 'border-outline-variant'
              }`}
            />
            {errores.calificacionFinal && (
              <p className="font-body text-xs text-error">{errores.calificacionFinal}</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onGuardar}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}

export default CargaIntensificacionModal;
