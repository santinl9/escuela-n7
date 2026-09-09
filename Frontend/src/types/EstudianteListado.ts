import type { EstadoEstudiante } from './Estudiante';

export interface EstudianteListado {
  id: number;
  dni: number;
  apellido: string;
  nombre: string;
  estado: EstadoEstudiante;
}
