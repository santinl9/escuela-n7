import ModuleCard from '../components/cards/moduleCard';
import { modulesData } from '../types/props/recursosHumanosProps.ts';

function RecursosHumanos() {
    return (
        <div className="flex flex-col gap-8">
            
            <div>
                <h1 className="font-headline text-headline-md font-bold text-on-surface">
                    Recursos Humanos - EES 7
                </h1>
                <p className="font-body text-body-sm text-on-surface-variant mt-1">
                    Accede a las herramientas de gestión del personal institucional para administrar docentes y cargos del plantel activo.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <ModuleCard modules={modulesData} />
            </div>

        </div>
    );
}

export default RecursosHumanos;