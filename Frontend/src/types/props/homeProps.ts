import type {Metrica} from '../../components/cards/metricaCard';
import type {Seccion} from '../../components/cards/seccionCard';

export const metricasData: Metrica[] = [
  {
    id: 1,
    titulo: "Total Estudiantes",
    valor: "1.245",
    icono: "school",
    claseFondo: "bg-primary",
    claseTexto: "text-background",
  },
  {
    id: 2,
    titulo: "Personal Activo",
    valor: 112,
    icono: "badge",
    claseFondo: "bg-secondary-container",
    claseTexto: "text-on-secondary-container",
  },
  {
    id: 3,
    titulo: "Cursos Activos",
    valor: 42,
    icono: "table_rows",
    claseFondo: "bg-surface-container-high",
    claseTexto: "text-on-surface-variant",
  },
];

export const seccionesData: Seccion[] = [
  {
    id: 1,
    titulo: "Estructura Institucional",
    descripcion: "Gestiona materias, cursos, divisiones y la configuración de ciclos lectivos.",
    icono: "account_tree",
    url: "/estructura-institucional"
  },
  {
    id: 2,
    titulo: "Trayectorias Estudiantiles",
    descripcion: "Inscripciones, estados de estudiantes (Regular, Libre) y egresos.",
    icono: "groups"
    ,url: "/trayectorias-estudiantiles"
  },
  {
    id: 3,
    titulo: "Seguimiento y Evaluación",
    descripcion: "Carga de calificaciones, control de asistencia y planillas de notas.",
    icono: "checklist"
    ,url: "/seguimiento-evaluacion"
  },
  {
    id: 4,
    titulo: "Recursos Humanos",
    descripcion: "Gestión de docentes, preceptores, directivos y asignaciones.",
    icono: "badge"
    ,url: "/recursos-humanos"
  },
  {
    id: 6,
    titulo: "Roles y Usuarios",
    descripcion: "Gestión de usuarios y asignación de roles.",
    icono: "settings"
    ,url: "/roles-usuarios"
  }
];

