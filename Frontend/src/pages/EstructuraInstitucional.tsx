import Module from '../components/cards/moduleCard';
import { modulesData } from '../types/props/estructuraInstitucionalProps';

function EstructuraInstitucional() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-headline-md font-bold text-on-surface">
                    Estructura Institucional del Sistema de Gestión Institucional - EES 7
                </h1>
                <p className="font-body text-body-sm text-on-surface-variant mt-1">
                    Accede a la gestión de la estructura institucional para administrar materias, cursos, orientaciones, aulas y ciclos lectivos.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <Module modules={modulesData} />
            </div>
        </div>
    );
}

export default EstructuraInstitucional;