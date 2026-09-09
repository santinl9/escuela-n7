import PeriodosCarga from '../components/cards/periodosCarga';
import MetricaCard from '../components/cards/metricaCard';
import SeccionCard from '../components/cards/seccionCard';
import AlertasRegularidad from '../components/cards/alertasRegularidad';
import { useFetch } from '../hooks/useFetch';

import { metricasData, seccionesData } from '../types/props/homeProps';
import type { EstudianteListado } from '../types/EstudianteListado';
import type { Personal } from '../types/Personal';
import type { Curso } from '../types/Curso';
import type { PeriodoCarga } from '../types/PeriodoCarga';
import { estaVigente } from '../constants/fechas';

function Home() {
    const { data: estudiantes } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
    const { data: personal } = useFetch<Personal[]>('/data/personal.json');
    const { data: cursos } = useFetch<Curso[]>('/data/cursos.json');
    const { data: periodosCargaData } = useFetch<PeriodoCarga[]>('/data/periodosCarga.json');

    // Un período de carga está activo cuando la fecha de hoy cae dentro de su rango.
    // Si hay varios activos a la vez, se muestra solo el que cierra primero
    // (el más urgente para el usuario).
    const periodoActivo = (periodosCargaData ?? [])
        .filter(p => estaVigente(p.fechaIni, p.fechaFin))
        .sort((a, b) => a.fechaFin.localeCompare(b.fechaFin))[0];
    const periodosActivos = periodoActivo ? [periodoActivo] : [];

    const metricas = metricasData.map(m => {
        if (m.titulo === 'Total Estudiantes') {
            return { ...m, valor: estudiantes ? estudiantes.length.toString() : '...' };
        }
        if (m.titulo === 'Personal Activo') {
            return { ...m, valor: personal ? personal.filter(p => p.activo).length : '...' };
        }
        if (m.titulo === 'Cursos Activos') {
            return { ...m, valor: cursos ? cursos.filter(c => c.activo).length : '...' };
        }
        return m;
    });

    const casosLibres = estudiantes ? estudiantes.filter(e => e.estado === 'Libre').length : 0;

    return (
        <div className="flex flex-col gap-8">

            <div>
                <h1 className="font-headline text-headline-md font-bold text-on-surface">
                    Bienvenido al Sistema de Gestión Institucional - EES N°7
                </h1>
                <p className="font-body text-body-sm text-on-surface-variant mt-1">
                    Ciclo Lectivo 2026. Resumen general del estado de la institución.
                </p>
            </div>

            <MetricaCard metricas={metricas} />

            <div className="flex flex-col gap-4">
                <p className="font-headline text-headline-md font-bold text-on-surface">
                    Secciones Principales
                </p>
                <SeccionCard secciones={seccionesData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <AlertasRegularidad casosLibres={casosLibres} />
                <PeriodosCarga periodos={periodosActivos} />
            </div>
            
        </div>
    );
}

export default Home;