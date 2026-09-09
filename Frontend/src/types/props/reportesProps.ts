import type { Module } from "../../components/cards/moduleCard";

export const modulesData: Module[] = [
    {
        id: 1,
        icono: "assignment",
        titulo: "Boletines",
        descripcion: "Reporte de boletines",
        url: "/reportes-estadisticas/boletines"

    },
    {
        id: 2,
        icono: "file_export",
        titulo: "Certificados",
        descripcion: "Reporte de certificados",
        url: "/reportes-estadisticas/certificados"
    },
    {
        id: 3,
        icono: "query_stats",
        titulo: "Metricas",
        descripcion: "Reporte de metricas",
        url: "/reportes-estadisticas/metricas"
    }
];