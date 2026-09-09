import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTema } from '../../hooks/useTema';
import { useTamanioTexto } from '../../hooks/useTamanioTexto';

export interface SubMenuItem { name: string; href: string; }
export interface MenuItem { id: string; label: string; icon: string; href: string; subItems?: SubMenuItem[]; }
export interface SidebarProps { menu: MenuItem[]; rol: string; isOpen: boolean; onClose: () => void; }

function Sidebar({ menu, rol, isOpen, onClose }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();
  const { esOscuro, cambiarTema } = useTema();
  const { tamanio, aumentarTamanio, disminuirTamanio } = useTamanioTexto();

  // Ajuste de estado durante el render (no en un efecto): cada vez que cambia
  // la ruta, si hay un ítem padre cuyo submenú contiene la ruta activa, lo
  // abrimos automáticamente. `pathnameSincronizado` actúa como "clave" para
  // detectar el cambio y evitar que esto se repita en cada render.
  const [pathnameSincronizado, setPathnameSincronizado] = useState<string | null>(null);
  if (location.pathname !== pathnameSincronizado) {
    setPathnameSincronizado(location.pathname);
    const activeParent = menu.find(item =>
      item.subItems?.some(subItem => subItem.href === location.pathname) ||
      (item.href !== '/' && location.pathname.startsWith(item.href))
    );
    if (activeParent) {
      setOpenMenu(activeParent.id);
    }
  }

  useEffect(() => {
    // En mobile/tablet el menú es un drawer: se cierra al navegar para no tapar el
    // contenido. En escritorio se respeta el estado que dejó el usuario (minimizado o no).
    if (window.matchMedia('(max-width: 1023px)').matches) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleMenu = (id: string) => {
    setOpenMenu((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        className={`fixed left-0 top-0 h-full w-[min(22.5rem,88vw)] bg-surface-container border-r border-outline-variant py-6 pl-5 pr-1 pt-20 pb-8 z-40 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Botón para minimizar la sidebar (disponible en todos los tamaños) */}
        <button
          onClick={onClose}
          aria-label="Minimizar menú"
          className="absolute top-20 right-4 text-on-surface hover:text-primary transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[1.75rem]">close</span>
        </button>

        {/* Cabecera del Sidebar */}
        <div className="mb-8 pr-4 text-center mt-4 md:mt-0 shrink-0">
          <h2 className="text-xl font-bold text-on-surface">
            Gestión Institucional
          </h2>
          <p className="text-sm font-medium text-on-surface-variant mt-1.5">
            {rol}
          </p>
        </div>

        {/* Lista de Navegación */}
        <ul className="flex-1 space-y-2.5 overflow-y-auto pr-4 scrollbar-custom">
          {menu.map((item) => {
            // -- RENDERIZADO DE ÍTEMS SIMPLES (SIN SUBMENÚ) --
            if (!item.subItems) {
              const isActive = location.pathname === item.href;

              return (
                <li key={item.id} className="mb-2.5">
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold transition-colors cursor-pointer active:opacity-80
                      ${isActive
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[1.5rem] shrink-0">{item.icon}</span>
                    <span className="text-base">{item.label}</span>
                  </Link>
                </li>
              );
            }

            // -- RENDERIZADO DE ÍTEMS CON SUBMENÚ --
            const isOpenSub = openMenu === item.id;
            
            // Lógica para detectar si el padre debe estar resaltado (si la ruta empieza con su href o un hijo coincide)
            const isParentActive = 
              (item.href !== '/' && location.pathname.startsWith(item.href)) || 
              item.subItems.some(subItem => location.pathname === subItem.href);

            return (
              <li key={item.id} className="group">
                <button 
                  onClick={() => toggleMenu(item.id)} 
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors cursor-pointer 
                    ${isParentActive 
                      ? 'bg-secondary-container text-on-secondary-container font-semibold' 
                      : isOpenSub
                        ? 'bg-surface-container-high text-on-surface'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="material-symbols-outlined text-[1.5rem] shrink-0">{item.icon}</span>
                    <span className="text-base font-semibold text-left">{item.label}</span>
                  </div>
                  <span className={`material-symbols-outlined text-[1.25rem] shrink-0 transition-transform duration-200 ${isOpenSub ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>

                {/* Lista de Sub-ítems (Acordeón) */}
                <div className={`grid transition-all duration-300 ease-in-out ${isOpenSub ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <ul className="overflow-hidden">
                    <div className="mt-1.5 ml-[3.25rem] space-y-1.5 pb-2">
                      {item.subItems.map((subItem) => {
                        const isSubItemActive =
                          location.pathname === subItem.href ||
                          location.pathname.startsWith(subItem.href + '/');

                        return (
                          <li key={subItem.name}>
                            <Link
                              to={subItem.href}
                              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${isSubItemActive
                                  ? 'bg-secondary-container/50 text-primary font-bold'
                                  : 'text-on-surface-variant hover:text-primary'
                                }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        );
                      })}
                    </div>
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Switch de tema y tamaño de letra: en desktop ya están en el Topbar, acá solo se muestran en mobile/tablet. */}
        <div className="lg:hidden shrink-0 pt-4 mt-4 border-t border-outline-variant pr-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface-variant">Tamaño de letra</span>
            <div className="flex items-center gap-0.5 rounded-full border border-outline-variant p-0.5" title="Tamaño de letra">
              <button
                type="button"
                onClick={disminuirTamanio}
                disabled={tamanio === 'normal'}
                aria-label="Reducir tamaño de letra"
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[1rem] leading-none">remove</span>
              </button>
              <span className="w-5 text-center font-label text-xs font-bold text-on-surface-variant select-none">A</span>
              <button
                type="button"
                onClick={aumentarTamanio}
                disabled={tamanio === 'extra-grande'}
                aria-label="Aumentar tamaño de letra"
                className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[1rem] leading-none">add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface-variant">Cambiar tema</span>
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
        </div>
      </nav>
    </>
  );
}

export default Sidebar;