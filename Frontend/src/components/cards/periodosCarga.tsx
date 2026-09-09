import { useState } from 'react'
import { Link } from 'react-router-dom';
import type { PeriodoCarga } from '../../types/PeriodoCarga';
import { diasHasta, textoCantidadDias } from '../../constants/fechas';

export interface PeriodosCargaProps {
  periodos: PeriodoCarga[];
  titulo?: string;
}

function PeriodosCarga({ periodos, titulo = "Períodos de Carga Activos" }: PeriodosCargaProps) {
  const [expandido, setExpandido] = useState(true)

  return (
    <div className="bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">

      <div className="p-md border-b border-outline-variant bg-secondary-container flex items-center justify-between gap-sm">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-secondary-container text-[1.5rem]">
            calendar_clock
          </span>
          <h3 className="font-headline text-headline-md text-on-secondary-container">
            {titulo}
          </h3>
        </div>

        <button
          onClick={() => setExpandido(prev => !prev)}
          className="text-on-secondary-container hover:opacity-70 transition-opacity cursor-pointer flex items-center"
          aria-expanded={expandido}
        >
          <span className={`material-symbols-outlined text-[1.5rem] transition-transform duration-300 ease-in-out ${expandido ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expandido ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <ul className="divide-y divide-outline-variant bg-background overflow-hidden">
          {periodos.length === 0 ? (
            <li className="p-md font-body text-body-sm text-on-surface-variant text-center">
              No hay períodos de carga activos actualmente.
            </li>
          ) : (
            periodos.map(periodo => {
              const dias = diasHasta(periodo.fechaFin);
              return (
              <li
                key={periodo.id}
                className="p-md flex justify-between items-center hover:bg-surface-container transition-colors gap-sm"
              >
                <div>
                  <p className="font-label text-label-md text-on-surface">
                    {periodo.descripcion}
                  </p>
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Calificación {periodo.tipo}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-1 shrink-0 ml-4">
                  <p className="font-body text-body-sm text-on-surface">
                    Cierra en
                  </p>
                  <span className="inline-flex items-center px-3.5 py-1.5 rounded-full font-label text-body-sm font-semibold bg-secondary-container text-on-secondary-container">
                    {dias === 0 ? 'Hoy' : textoCantidadDias(dias)}
                  </span>
                </div>
              </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="px-md py-sm bg-surface-container border-t border-outline-variant flex justify-center">
        <Link
          to="/seguimiento-evaluacion/periodos-carga"
          className="cursor-pointer flex items-center gap-xs px-3 py-1.5 text-on-surface-variant font-label text-label-md rounded-lg hover:bg-surface-container-high transition-colors duration-150"
        >
          Gestionar períodos
        </Link>
      </div>

    </div>
  )
}

export default PeriodosCarga;
