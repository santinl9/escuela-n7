import Module from '../components/cards/moduleCard';
import { modulesData } from '../types/props/trayectoriasProps.ts';

function Trayectorias(){
    return(
        <div className="flex flex-col gap-8"> 
            
            <div>
                <h1 className="font-headline text-headline-md font-bold text-on-surface">
                    Trayectorias Estudiantiles del Sistema de Gestión Institucional - EES 7
                </h1>
                <p className="font-body text-body-sm text-on-surface-variant mt-1">
                    Accede a la gestión de la trayectoria estudiantil para inscribir registrar y/o inscribir a los estudiantes así como para acceder a funcionalidades propias de los egresados.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <Module modules={modulesData} />
            </div>
        </div>
    )
};

export default Trayectorias