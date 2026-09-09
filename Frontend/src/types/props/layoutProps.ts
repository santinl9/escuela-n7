import type { MenuItem } from "../../components/layout/sidebar";
import type { TopbarProps } from "../../components/layout/topbar";

export const menuData: MenuItem[] = [
  { id: 'home', label: 'Inicio', icon: 'home', href: '/' },
  {
    id: 'estructura',
    label: 'Estructura Institucional',
    icon: 'account_tree',
    subItems: [
      { name: 'Materias', href: '/estructura-institucional/materias' },
      { name: 'Cursos', href: '/estructura-institucional/cursos' },
      { name: 'Orientaciones', href: '/estructura-institucional/orientaciones' },
      { name: 'Aulas', href: '/estructura-institucional/aulas' },
      { name: 'Ciclos Lectivos', href: '/estructura-institucional/ciclos-lectivos' },
    ],
    href: '/estructura-institucional'
  },
  {
    id: 'trayectorias',
    label: 'Trayectorias Estudiantiles',
    icon: 'groups',
    subItems: [
      { name: 'Estudiantes', href: '/trayectorias-estudiantiles/estudiantes' },
      { name: 'Mesas de Examen', href: '/trayectorias-estudiantiles/mesas-examen' },
    ],
    href: '/trayectorias-estudiantiles'
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento y Evaluación',
    icon: 'checklist',
    subItems: [
      { name: 'Mis Cursadas', href: '/seguimiento-evaluacion/cursadas' },
      { name: 'Mis Cursos', href: '/seguimiento-evaluacion/mis-cursos' },
      { name: 'Períodos de Carga', href: '/seguimiento-evaluacion/periodos-carga' },
      { name: 'Intensificaciones', href: '/seguimiento-evaluacion/intensificaciones' }
    ],
    href: '/seguimiento-evaluacion'
  },
  {
    id: 'rrhh',
    label: 'Recursos Humanos',
    icon: 'badge',
    subItems: [
      { name: 'Personal', href: '/recursos-humanos/personal' },
    ],
    href: '/recursos-humanos'
  },
  /*{
    id: 'reportes',
    label: 'Reportes y Estadísticas',
    icon: 'bar_chart',
    subItems: [
      { name: 'Boletines', href: '/reportes-estadisticas/boletines' },
      { name: 'Certificados', href: '/reportes-estadisticas/certificados' },
      { name: 'Métricas', href: '/reportes-estadisticas/metricas' },
    ],
    href: '/reportes-estadisticas'
  },*/
  {
    id: 'configuracion',
    label: 'Roles y Usuarios',
    icon: 'settings',
    href: '/roles-usuarios'
  },
];

export const topbarProps: Omit<TopbarProps, 'onToggleMenu' | 'onLogout'> = {
  nombreEscuela: "EES N°7 Che Guevara",
};