import { useToast } from '../../hooks/useToast';
import { TOAST } from '../../constants/toastMessages';

interface ConfirmEliminarProps {
  onConfirmar: () => void;
  onCancelar: () => void;
  titulo?: string;
  mensaje?: React.ReactNode;
  mensajeCancelacion?: string;
}

function ConfirmEliminar({
  onConfirmar,
  onCancelar,
  titulo = 'Eliminar Estudiante',
  mensaje = '¿Estás seguro de que querés eliminar este estudiante? Esta acción no se puede deshacer.',
  mensajeCancelacion = TOAST.CANCELANDO_ELIMINACION,
}: ConfirmEliminarProps) {
  const { mostrarToast } = useToast();

  const handleCancelar = () => {
    mostrarToast(mensajeCancelacion);
    onCancelar();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 cursor-not-allowed" />
      <div className="relative bg-background border border-outline-variant w-full max-w-[460px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col font-body">
        <div className="shrink-0 p-5 flex justify-between items-center border-b border-outline-variant/30 rounded-t-2xl">
          <h3 className="text-lg font-bold text-primary">{titulo}</h3>
          <button
            onClick={handleCancelar}
            className="cursor-pointer text-on-surface-variant hover:text-on-surface w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-custom p-5 text-body-sm text-on-surface-variant leading-relaxed">
          {mensaje}
        </div>
        <div className="shrink-0 px-5 pb-5 pt-2 flex justify-end rounded-b-2xl">
          <button
            onClick={onConfirmar}
            className="cursor-pointer bg-[#800000] dark:bg-[#a8372b] hover:opacity-90 text-white font-label text-label-md px-5 py-2.5 rounded-xl transition-all font-bold shadow-md"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmEliminar;
