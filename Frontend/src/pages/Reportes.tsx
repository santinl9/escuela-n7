import Module from '../components/cards/moduleCard';
import { modulesData } from '../types/props/reportesProps';

function Reportes() {
    return (
        <div className="flex flex-col gap-8"> 
            
            <div>
                <h1 className="font-headline text-headline-md font-bold text-on-surface">
                    Reportes del Sistema de Gestión Institucional - EES 7
                </h1>
                <p className="font-body text-body-sm text-on-surface-variant mt-1">
                    Accede a los reportes disponibles para obtener información detallada sobre el rendimiento académico, asistencia y otros aspectos clave de la institución.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <Module modules={modulesData} />
            </div>
        </div>
    );
}

export default Reportes;