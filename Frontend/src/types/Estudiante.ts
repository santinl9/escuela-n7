import type { Persona } from './Persona';

export type EstadoEstudiante = "Regular" | "Libre" | "Desertor" | "Egresado";

export interface Estudiante extends Persona {
  id: number;
  folio: number;
  libro: number;
  estado: EstadoEstudiante;
  fechaNacimiento: string;
  nacionalidad: string;
  /** derivada de fechaNacimiento */
  edad: number;
}
