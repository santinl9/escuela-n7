import type { Module } from "../../components/cards/moduleCard";

export const modulesData: Module[] = [
    {
        id: 1,
        icono: "menu_book", 
        titulo: "Materias",
        descripcion: "Pestaña de gestión de las materias",
        url: "/estructura-institucional/materias"
    },
    {
        id: 2,
        icono: "class",
        titulo: "Cursos",
        descripcion: "Pestaña de gestión de los cursos",
        url: "/estructura-institucional/cursos"
    },
    {
        id: 3,
        icono: "category",
        titulo: "Orientaciones",
        descripcion: "Pestaña de gestión de las orientaciones",
        url: "/estructura-institucional/orientaciones"
    },
    {
        id: 4,
        icono: "meeting_room",
        titulo: "Aulas",
        descripcion: "Pestaña de gestión de las aulas",
        url: "/estructura-institucional/aulas"
    },
    {
        id: 5,
        icono: "calendar_month",
        titulo: "Ciclos Lectivos",
        descripcion: "Pestaña de gestión de los ciclos lectivos",
        url: "/estructura-institucional/ciclos-lectivos"
    }
];