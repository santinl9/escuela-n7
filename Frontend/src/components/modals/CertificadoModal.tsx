import type { Estudiante } from '../../types/Estudiante';

export type TipoCertificado = 'regular' | 'analitico';

interface CertificadoModalProps {
  tipo: TipoCertificado;
  estudiante: Estudiante;
  onClose: () => void;
}

const TITULOS: Record<TipoCertificado, string> = {
  regular: 'Certificado de Alumno Regular',
  analitico: 'Constancia de Analítico en Trámite',
};

// Texto de relleno: el contenido legal definitivo todavía no está definido.
const LOREM_IPSUM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
];

function CertificadoModal({ tipo, estudiante, onClose }: CertificadoModalProps) {
  const hoy = new Date().toLocaleDateString('es-AR');
  const nombreCompleto = `${estudiante.apellido}, ${estudiante.nombre}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background border border-outline-variant w-full max-w-2xl rounded-xl shadow-md cursor-auto max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4 shrink-0">
          <h3 className="font-headline text-headline-md font-bold text-on-surface">
            {TITULOS[tipo]}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto scrollbar-custom">
          <div className="flex flex-col gap-6 font-body text-body-sm text-on-surface">
            <div className="text-center">
              <p className="font-headline font-bold text-headline-md">Esc. de Educ. Secundaria N°7</p>
              <p className="font-headline font-bold">"Ernesto Che Guevara"</p>
            </div>

            <p className="text-right">{hoy}</p>

            <p>
              Alumno/a: <strong>{nombreCompleto}</strong> — DNI <strong>{estudiante.dni}</strong>
            </p>

            {LOREM_IPSUM.map((parrafo, idx) => (
              <p key={idx}>{parrafo}</p>
            ))}

            <div className="mt-12 flex justify-center">
              <div className="text-center border-t border-outline-variant pt-2 px-8">
                <p className="text-xs text-on-surface-variant">Firma y sello</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl shrink-0">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

export default CertificadoModal;
