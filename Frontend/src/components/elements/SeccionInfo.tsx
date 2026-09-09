import { useState } from 'react';

interface SeccionInfoProps {
  icono: string;
  titulo: string;
  accionesHeader?: React.ReactNode;
  children: React.ReactNode;
}

function SeccionInfo({ icono, titulo, accionesHeader, children }: SeccionInfoProps) {
  const [expandido, setExpandido] = useState(true);

  // Las acciones del header solo se muestran con la sección expandida.
  const mostrarAcciones = expandido && Boolean(accionesHeader);

  return (
    <div className="bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="w-full flex flex-col gap-3 px-6 py-4 border-b border-outline-variant bg-surface-container">
        <div className="w-full flex items-center justify-between gap-sm">
          <button
            type="button"
            onClick={() => setExpandido(prev => !prev)}
            className="flex-1 min-w-0 flex items-center gap-sm cursor-pointer hover:opacity-90 transition-opacity text-left"
            aria-expanded={expandido}
          >
            <span className="material-symbols-outlined text-primary text-[1.5rem] shrink-0">{icono}</span>
            <h2 className="font-label text-label-md font-bold text-on-surface truncate">{titulo}</h2>
          </button>

          <div className="flex items-center gap-sm shrink-0">
            <button
              type="button"
              onClick={() => setExpandido(prev => !prev)}
              className="cursor-pointer flex items-center hover:opacity-90 transition-opacity"
              aria-expanded={expandido}
              aria-label={expandido ? 'Contraer sección' : 'Expandir sección'}
            >
              <span
                className={`material-symbols-outlined text-on-surface-variant text-[1.5rem] transition-transform duration-300 ease-in-out ${
                  expandido ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>
          </div>
        </div>

        {/* Las acciones siempre van en su propia línea, nunca compartiendo fila con el
            título: a un tamaño de letra grande o en pantallas intermedias, compartir fila
            terminaba angostando el título hasta hacerlo ilegible o desbordando la tarjeta. */}
        {mostrarAcciones && (
          <div onClick={e => e.stopPropagation()}>
            {accionesHeader}
          </div>
        )}
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expandido ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default SeccionInfo;
