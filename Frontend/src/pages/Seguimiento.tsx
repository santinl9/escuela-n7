import Module from '../components/cards/moduleCard';
import { seguimientoData } from '../types/props/seguimientoProps';

function Seguimiento() {
    return (
        <div className="flex flex-col gap-8"> 
            <div>
                <h1 className="font-headline text-headline-md font-bold text-on-surface">
                    Seguimiento y Evaluación - EES 7
                </h1>
                <p className="font-body text-body-sm text-on-surface-variant mt-1">
                    Accede a las herramientas de monitoreo para gestionar el rendimiento académico, instancias de evaluación y los estados de regularidad de los estudiantes.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <Module modules={seguimientoData} />
            </div>
        </div>
    );
}

export default Seguimiento;