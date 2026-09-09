import { useState } from 'react';
import { normalizarBusqueda as norm } from '../../constants/normalizarTexto';
import type { CursadaOpcion } from './CargaIntensificacionModal';

interface SeleccionCursadaIntensificacionModalProps {
  estudianteNombre: string;
  cursadaOpciones: CursadaOpcion[];
  valorInicial?: number;
  onConfirmar: (cursadaId: number) => void;
  onClose: () => void;
}

// Modal chico para elegir, una única vez al inscribir a alguien como "Intensifica", en qué
// cursada intensificará efectivamente (puede ser distinta de la cursada de la inscripción
// original: se intensifica la misma materia en otro curso/comisión). Esa cursada queda fija
// para todos los períodos de intensificación de esta inscripción, ver CargaIntensificacionModal.
function SeleccionCursadaIntensificacionModal({
  estudianteNombre,
  cursadaOpciones,
  valorInicial,
  onConfirmar,
  onClose,
}: SeleccionCursadaIntensificacionModalProps) {
  const nombreOpcion = (c: CursadaOpcion) => `${c.materiaNombre} · ${c.cursoNombre}`;

  const [seleccionId, setSeleccionId] = useState<number | undefined>(valorInicial);
  const [busqueda, setBusqueda] = useState('');

  const opcionesFiltradas = cursadaOpciones.filter(c => norm(nombreOpcion(c)).includes(norm(busqueda)));

  const handleConfirmar = () => {
    if (seleccionId === undefined) return;
    onConfirmar(seleccionId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 cursor-not-allowed">
      <div className="bg-background rounded-xl border border-outline-variant shadow-md w-full max-w-md flex flex-col cursor-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container rounded-t-xl gap-4">
          <div>
            <h2 className="font-headline text-headline-sm font-bold text-on-surface">
              Cursada de Intensificación
            </h2>
            <p className="font-body text-body-sm text-on-surface-variant mt-0.5">{estudianteNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150 shrink-0"
          >
            <span className="material-symbols-outlined text-[1.5rem]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-3">
          <p className="font-body text-body-sm text-on-surface-variant">
            Elegí en qué cursada intensificará esta materia. Se va a usar para todos los períodos de intensificación de esta inscripción.
          </p>

          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscá por materia o curso..."
            autoComplete="off"
            style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
            className="w-full px-3 py-2 rounded-lg border border-outline-variant font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150"
          />

          <ul className="max-h-56 overflow-y-auto scrollbar-custom border border-outline-variant rounded-lg divide-y divide-outline-variant">
            {opcionesFiltradas.length === 0 ? (
              <li className="px-3 py-3 font-body text-body-sm text-on-surface-variant">No se encontraron cursadas</li>
            ) : (
              opcionesFiltradas.map(c => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSeleccionId(c.id)}
                    className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                      seleccionId === c.id
                        ? 'bg-secondary-container text-on-secondary-container font-semibold'
                        : 'text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {nombreOpcion(c)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-outline-variant bg-surface-container rounded-b-xl">
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 rounded-xl text-on-surface-variant font-label text-label-md hover:bg-surface-container-high transition-colors duration-150"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={seleccionId === undefined}
            className="cursor-pointer px-4 py-2.5 rounded-xl bg-primary text-background font-label text-label-md hover:opacity-90 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>

      </div>
    </div>
  );
}

export default SeleccionCursadaIntensificacionModal;
