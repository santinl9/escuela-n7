import { useState, type ReactNode } from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';
import { topbarProps, menuData } from '../../types/props/layoutProps';

export interface LayoutProps {
    children: ReactNode;
    onLogout: () => void;
}

function Layout({ children, onLogout }: LayoutProps) {
    // En escritorio (>= lg) la sidebar arranca abierta; en mobile/tablet arranca
    // minimizada (drawer cerrado). A partir de ahí el usuario la alterna con la hamburguesa.
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => window.innerWidth >= 1024);
    
    return (
        <div className="min-h-screen bg-background">

            <Topbar 
                {...topbarProps} 
                onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}
                onLogout={onLogout}
            />

            <Sidebar 
            menu={menuData} 
            rol="Administrador" 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            />

            <main className={`pt-16 transition-all duration-300 ease-in-out min-h-screen ${isSidebarOpen ? 'lg:pl-[22.5rem]' : 'lg:pl-0'}`}>
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;