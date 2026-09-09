import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTema } from '../../hooks/useTema';
import { useTamanioTexto } from '../../hooks/useTamanioTexto';
import { useAuth } from '../../hooks/useAuth';
import LogoEscuela from '../elements/LogoEscuela';
import CheIcon from '../elements/CheIcon';

export interface TopbarProps {
    nombreEscuela: string;
    onToggleMenu?: () => void;
    onLogout: () => void;
}

function Topbar({ onToggleMenu, onLogout }: TopbarProps) {
    const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
    const navigate = useNavigate();
    const { esOscuro, cambiarTema } = useTema();
    const { tamanio, aumentarTamanio, disminuirTamanio } = useTamanioTexto();
    const { personalActual } = useAuth();

    const iniciales = personalActual
        ? `${personalActual.nombre.charAt(0)}${personalActual.apellido.charAt(0)}`.toUpperCase()
        : '?';

    const handleVerPerfil = () => {
        setMenuAbierto(false);
        navigate('/mi-perfil');
    };

    return (
        <header className="bg-background border-b border-outline-variant shadow-sm flex justify-between items-center w-full px-4 sm:px-6 h-16 fixed top-0 z-50 transition-colors duration-300">

            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <button
                    onClick={onToggleMenu}
                    className="text-on-surface hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="Alternar menú"
                >
                    <span className="material-symbols-outlined text-[1.75rem]">menu</span>
                </button>

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <LogoEscuela className="h-8 w-8 sm:h-10 sm:w-10 text-primary shrink-0" />
                    <h1 className="flex flex-col justify-center text-primary min-w-0 m-0 p-0">
                        <span className="font-headline leading-none text-[0.7rem] sm:text-sm truncate">
                            Esc. de Educ. Secundaria N°7
                        </span>
                        <span className="font-headline font-extrabold leading-none text-base sm:text-xl flex items-center gap-0.5 truncate">
                            Ernesto
                            <CheIcon className="h-[1.25em] w-auto shrink-0 -translate-y-[0.1em]" />
                            Guevara
                        </span>
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* En mobile/tablet, el switch de tema y el de tamaño de letra se muestran al fondo del menú lateral (Sidebar). */}
                <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-0.5 rounded-full border border-outline-variant p-0.5" title="Tamaño de letra">
                        <button
                            type="button"
                            onClick={disminuirTamanio}
                            disabled={tamanio === 'normal'}
                            aria-label="Reducir tamaño de letra"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            <span className="material-symbols-outlined text-[0.9rem] leading-none">remove</span>
                        </button>
                        <span className="w-5 text-center font-label text-xs font-bold text-on-surface-variant select-none">A</span>
                        <button
                            type="button"
                            onClick={aumentarTamanio}
                            disabled={tamanio === 'extra-grande'}
                            aria-label="Aumentar tamaño de letra"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                            <span className="material-symbols-outlined text-[0.9rem] leading-none">add</span>
                        </button>
                    </div>

                    <label className="theme-toggle-switch" title="Cambiar tema">
                        <input
                            type="checkbox"
                            checked={esOscuro}
                            onChange={cambiarTema}
                        />
                        <span className="theme-toggle-slider">
                            <span className="material-symbols-outlined theme-toggle-icon select-none" style={{ fontSize: '0.875rem', width: '0.875rem', height: '0.875rem', overflow: 'hidden' }}>
                                light_mode
                            </span>
                            <span className="material-symbols-outlined theme-toggle-icon select-none" style={{ fontSize: '0.875rem', width: '0.875rem', height: '0.875rem', overflow: 'hidden' }}>
                                dark_mode
                            </span>
                        </span>
                    </label>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        type="button"
                        title="Opciones de usuario"
                        className="w-10 h-10 rounded-full bg-secondary-container border border-outline-variant flex items-center justify-center text-on-secondary-container font-bold cursor-pointer select-none hover:opacity-80 transition-opacity shrink-0"
                    >
                        {iniciales}
                    </button>

                    {menuAbierto && (
                        <div className="absolute right-0 mt-2 w-48 border rounded-lg shadow-lg py-1 z-50 bg-surface-container-high border-outline-variant text-left flex flex-col">

                            {/* --- OPCIÓN: VER PERFIL --- */}
                            <button onClick={handleVerPerfil}
                                type="button"
                                className="w-full px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container flex items-center gap-3 cursor-pointer border-none bg-transparent transition-colors"
                            >
                                <span className="material-symbols-outlined text-[1.25rem]">account_circle</span>
                                Ver Perfil
                            </button>

                            <div className="border-t border-outline-variant my-1" />

                            {/* --- OPCIÓN: CERRAR SESIÓN --- */}
                            <button onClick={onLogout}
                                type="button"
                                className="w-full px-4 py-2.5 text-sm text-error hover:bg-error-container hover:text-error flex items-center gap-3 cursor-pointer border-none bg-transparent transition-colors"
                            >
                                <span className="material-symbols-outlined text-[1.25rem]">logout</span>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Topbar;
