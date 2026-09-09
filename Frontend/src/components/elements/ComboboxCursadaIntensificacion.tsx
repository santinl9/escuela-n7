import { useState, useRef, useEffect } from 'react';
import { normalizarBusqueda as norm } from '../../constants/normalizarTexto';
import type { CursadaOpcion } from '../modals/CargaIntensificacionModal';

interface ComboboxCursadaIntensificacionProps {
  opciones: CursadaOpcion[];
  valor?: number;
  onSeleccionar: (cursadaId: number) => void;
  error?: boolean;
}

const nombreOpcion = (c: CursadaOpcion) => `${c.materiaNombre} · ${c.cursoNombre}`;

// Combobox con búsqueda en tiempo real para elegir la cursada en la que un estudiante
// intensificará (misma materia, cualquier curso). Se muestra inline debajo del select de
// tipo de inscripción apenas se elige "Intensifica", en vez de abrir un modal aparte.
function ComboboxCursadaIntensificacion({ opciones, valor, onSeleccionar, error }: ComboboxCursadaIntensificacionProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const actual = opciones.find(c => c.id === valor);
  const [query, setQuery] = useState(actual ? nombreOpcion(actual) : '');

  const cerrar = () => {
    setOpen(false);
    const actualCerrar = opciones.find(c => c.id === valor);
    setQuery(actualCerrar ? nombreOpcion(actualCerrar) : '');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cerrar();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opciones, valor]);

  const seleccionar = (c: CursadaOpcion) => {
    onSeleccionar(c.id);
    setQuery(nombreOpcion(c));
    setOpen(false);
  };

  const opcionesFiltradas = opciones.filter(c => norm(nombreOpcion(c)).includes(norm(query)));

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscá la cursada de intensificación..."
        autoComplete="off"
        style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
        className={`w-full pl-3 pr-9 py-1.5 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${
          error ? 'border-error' : 'border-outline-variant'
        }`}
      />
      <span className={`material-symbols-outlined text-on-surface-variant text-[1.1rem] leading-none absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
        expand_more
      </span>

      <div
        className={`absolute z-20 left-0 right-0 mt-1 bg-background border border-outline-variant rounded-lg shadow-md transition-opacity duration-150 ease-in-out ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <ul className="max-h-48 overflow-y-auto scrollbar-custom">
          {opcionesFiltradas.length === 0 ? (
            <li className="px-3 py-2 font-body text-body-sm text-on-surface-variant">No se encontraron cursadas</li>
          ) : (
            opcionesFiltradas.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => seleccionar(c)}
                  className={`w-full text-left px-3 py-2 font-body text-body-sm transition-colors duration-150 cursor-pointer ${
                    valor === c.id
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
    </div>
  );
}

export default ComboboxCursadaIntensificacion;
