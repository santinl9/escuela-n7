import { useState, useRef, useEffect } from 'react';
import type { TipoInscripcion } from '../../types/Inscripcion';
import { TIPOS_INSCRIPCION_OPCIONES } from '../../constants/inscripcionForm';

interface SelectTipoInscripcionProps {
  valor: TipoInscripcion;
  onSelect: (valor: TipoInscripcion) => void;
  // Cuando está presente, el estudiante solo puede anotarse como 'Oyente' (tope de
  // inscripciones u horario superpuesto): el select queda fijo, sin poder abrirse.
  soloOyente?: string;
  // Cupo de intensificación restante del estudiante: si es 0, esa opción queda deshabilitada;
  // si está definido, se muestra al lado de la opción "Intensifica" en la lista.
  intensificacionesRestantes?: number;
}

// Select del tipo de inscripción — mismo dropdown que se usa en el resto de la app
// (ver el campo "Tipo" de CursadaModal), montado por fila cuando se activa la inscripción.
function SelectTipoInscripcion({ valor, onSelect, soloOyente, intensificacionesRestantes }: SelectTipoInscripcionProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (soloOyente) {
    return (
      <div
        className="w-44 flex items-center justify-between px-3 py-2 rounded-lg border border-outline-variant font-body text-body-sm text-left bg-surface-container text-on-surface-variant cursor-not-allowed"
        title={soloOyente}
      >
        <span>Oyente</span>
        <span className="material-symbols-outlined text-[1.1rem] leading-none">lock</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative w-44">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        style={{ backgroundColor: 'var(--background)' }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-outline-variant font-body text-body-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 cursor-pointer"
      >
        <span style={{ color: 'var(--on-surface)' }}>{valor}</span>
        <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      <div
        className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <ul className="max-h-48 overflow-y-auto scrollbar-custom">
          {TIPOS_INSCRIPCION_OPCIONES.map(t => {
            const sinCupoIntensificacion = t === 'Intensifica' && intensificacionesRestantes === 0;
            return (
              <li key={t}>
                <button
                  type="button"
                  disabled={sinCupoIntensificacion}
                  onClick={() => { onSelect(t); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 flex items-center justify-between gap-2 ${
                    sinCupoIntensificacion
                      ? 'text-on-surface-variant/50 cursor-not-allowed'
                      : `cursor-pointer ${valor === t ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface hover:bg-surface-container-high'}`
                  }`}
                >
                  <span>{t}</span>
                  {t === 'Intensifica' && intensificacionesRestantes !== undefined && (
                    <span className="text-xs shrink-0">
                      {intensificacionesRestantes > 0 ? `(${intensificacionesRestantes} disponibles)` : '(sin cupo)'}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default SelectTipoInscripcion;
