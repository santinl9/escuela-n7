import type { Module } from "../../components/cards/moduleCard";

export const seguimientoData: Module[] = [

    {
        id: 4,
        icono: "school",
        titulo: "Mis Cursos",
        descripcion: "Control de asistencias de tus cursos asociados",
        url: "/seguimiento-evaluacion/mis-cursos"
    },

    {
        id: 2,
        icono: "rule",
        titulo: "Mis Cursadas",
        descripcion: "Control de calificaciones y asistencias de tus cursadas asociadas",
        url: "/seguimiento-evaluacion/cursadas"
    },

    {
        id: 3,
        icono: "calendar_today",
        titulo: "Periodos de Carga",
        descripcion: "Gestión de periodos de carga",
        url: "/seguimiento-evaluacion/periodos-carga"
    },

    {
        id: 5,
        icono: "trending_up",
        titulo: "Intensificaciones",
        descripcion: "Totalizadora de notas de las inscripciones de intensificación por curso",
        url: "/seguimiento-evaluacion/intensificaciones"
    },
];
