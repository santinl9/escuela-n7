import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegularidadProps {
    casosLibres: number;
}

function AlertasRegularidad({ casosLibres }: RegularidadProps) {
    const [expandido, setExpandido] = useState(true);
    const navigate = useNavigate();

    return (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            
            <div className="p-md border-b border-outline-variant bg-error-container flex items-center justify-between gap-sm">
                <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-error text-[1.5rem]">warning</span>
                    <h3 className="font-headline-md text-headline-md text-on-error-container">Alertas de Regularidad</h3>
                </div>

                <button
                    onClick={() => setExpandido(prev => !prev)}
                    className="text-on-error-container hover:opacity-70 transition-opacity cursor-pointer flex items-center"
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
                <ul className="divide-y divide-outline-variant bg-surface-container-lowest overflow-hidden">
                    <li className="p-md flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-surface-bright transition-colors gap-3 sm:gap-0">
                        <div>
                            <p className="font-label-md text-label-md text-on-surface">Estudiantes en situación de libre</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Revisar legajos en condición de libre.</p>
                        </div>
                        <span className="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full font-bold text-sm whitespace-nowrap shrink-0">
                            {`${casosLibres > 0 ? casosLibres : "Sin"} ${casosLibres === 1 ? "Caso" : "Casos"}`}
                        </span>
                    </li>
                </ul>
            </div>

            <div className="px-md py-sm bg-surface-container border-t border-outline-variant flex justify-center">
                <button
                    onClick={() => {
                        navigate('/trayectorias-estudiantiles/estudiantes', { state: { filtroEstado: 'Libre' } });
                    }}
                    className="cursor-pointer flex items-center gap-xs px-3 py-1.5 text-on-surface-variant font-label text-label-md rounded-lg hover:bg-surface-container-high transition-colors duration-150"
                >
                    Revisar
                </button>
            </div>
        </div>
    );
}

export default AlertasRegularidad;