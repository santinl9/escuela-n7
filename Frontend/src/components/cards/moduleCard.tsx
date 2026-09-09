import {Link} from 'react-router-dom';

export interface Module {
    id: number;
    icono: string;
    titulo: string;
    descripcion: string;
    url: string;
}

export interface ModuleCardProps {
    modules: Module[];
}

function ModuleCard({ modules }: ModuleCardProps) {
    return(

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-md">
            {modules.map( (module) => (
                <Link to={module.url} key={module.id} className="block h-full">
                <div className="h-full group bg-background p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4 cursor-pointer">

                    <div className="flex items-start sm:items-center gap-3">
                        <span className="material-symbols-outlined text-primary !text-[2rem] shrink-0 mt-1 sm:mt-0 bg-surface-container-high p-2 rounded-xl">
                            {module.icono}
                        </span>
                        <h3 
                            className="font-headline text-lg xl:text-xl text-on-surface leading-tight break-words" 
                            style={{ wordBreak: 'break-word' }}
                        >
                            {module.titulo}
                        </h3>
                    </div>

                    <p className="font-body text-body-md text-on-surface-variant flex-grow">
                        {module.descripcion}
                    </p>
                
                    <p className="text-primary font-bold text-label-md mt-auto flex items-center gap-xs">
                        Gestionar
                        <span className="material-symbols-outlined !text-sm">arrow_forward</span> 
                    </p>
                </div>
                </Link>
            ))}
        </div>
    );
}

export default ModuleCard;