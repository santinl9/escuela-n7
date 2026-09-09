import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";
import { env } from "../src/config/env";
import { CATALOGO_PERMISOS } from "../src/constants/permisos";
import { PERMISOS_POR_ROL } from "../src/constants/roles";
import { AsignacionHoraria } from "../src/types/asignacionHoraria.types";
import { AsistenciaInstitucional } from "../src/types/asistenciaInstitucional.types";
import { Aula } from "../src/types/aula.types";
import { BloqueHorario } from "../src/types/bloqueHorario.types";
import { CargaIntensificacion } from "../src/types/cargaIntensificacion.types";
import { CargaNumerica } from "../src/types/cargaNumerica.types";
import { CargaValorativa } from "../src/types/cargaValorativa.types";
import { CicloLectivo } from "../src/types/cicloLectivo.types";
import { ContactoEmergencia } from "../src/types/contactoEmergencia.types";
import { Cursada } from "../src/types/cursada.types";
import { Curso } from "../src/types/curso.types";
import { Domicilio } from "../src/types/domicilio.types";
import { Estudiante } from "../src/types/estudiante.types";
import { Inscripcion } from "../src/types/inscripcion.types";
import { InscripcionMesa } from "../src/types/inscripcionMesa.types";
import { Materia } from "../src/types/materia.types";
import { Matricula } from "../src/types/matricula.types";
import { MesasDeExamen } from "../src/types/mesasDeExamen.types";
import { Orientacion } from "../src/types/orientacion.types";
import { PeriodoCarga } from "../src/types/periodoCarga.types";
import { Permiso } from "../src/types/permiso.types";
import { Personal } from "../src/types/personal.types";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de entrada del seed.
// Las tablas con relaciones se describen con campos "ref" que se traducen a la
// sintaxis `connect` de Prisma dentro de main(), usando SIEMPRE una clave
// natural @unique del padre:
//   - personalRef  -> Personal.email      (@unique)
//   - rolesRef     -> Rol.nombre          (@unique)
//   - permisosRef  -> Permiso.codigo      (@unique)
//   - estudianteDni -> Estudiante.dni     (@unique, ya es columna FK escalar)
// bloqueHorarioIds / cursoIds usan el id autoincremental (base recién reseteada).
// ─────────────────────────────────────────────────────────────────────────────
type BloqueSeed = Omit<BloqueHorario, "id" | "cursadaId"> & { cursadaId?: number };

type CursoSeed = Omit<Curso, "id" | "orientacionId"> & { orientacionId?: number };

type RolSeed = { nombre: string; permisosRef: string[] };

type UsuarioSeed = {
  personalRef: string;
  rolesRef: string[];
  activo: boolean;
  contrasenia: string;
};

type MesaSeed = Omit<MesasDeExamen, "id" | "personalId"> & { personalRef: string };

type AsignacionSeed = Omit<
  AsignacionHoraria,
  "id" | "personalId" | "asignacionHorariaCubiertaId" | "materiaId"
> & {
  personalRef: string;
  bloqueHorarioIds: number[];
  cursoIds?: number[];
  /** Solo en tipoCargo Profesor: junto con cursoIds determina que cursadas dicta. */
  materiaId?: number;
  /** Posición (1-based) de la asignación cubierta dentro de `asignacionesHorarias`. */
  asignacionHorariaCubiertaId?: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────────────────────────────────────
const aulas: Omit<Aula, "id">[] = [
  { nombre: "Aula 1", capacidad: 30, activo: true },
  { nombre: "Aula 2", capacidad: 30, activo: true },
  { nombre: "Aula 3", capacidad: 25, activo: true },
  { nombre: "Laboratorio A", capacidad: 25, activo: true },
  { nombre: "Laboratorio B", capacidad: 20, activo: true },
  { nombre: "Biblioteca", capacidad: 40, activo: true },
];

const bloquesHorarios: BloqueSeed[] = [
  { cursadaId: 1, dia: "Lunes", horaIni: "08:00", horaFin: "09:30" },
  { cursadaId: 2, dia: "Lunes", horaIni: "09:30", horaFin: "11:00" },
  { cursadaId: 9, dia: "Martes", horaIni: "08:00", horaFin: "09:30" },
  { cursadaId: 7, dia: "Miercoles", horaIni: "10:00", horaFin: "11:30" },
  { cursadaId: 13, dia: "Jueves", horaIni: "14:00", horaFin: "15:30" },
  { cursadaId: 3, dia: "Viernes", horaIni: "08:00", horaFin: "09:30" },
  { dia: "Lunes", horaIni: "08:00", horaFin: "14:00" },
  { cursadaId: 4, dia: "Lunes", horaIni: "07:30", horaFin: "13:00" },
  { dia: "Martes", horaIni: "08:00", horaFin: "14:00" },
  { dia: "Miercoles", horaIni: "08:00", horaFin: "12:00" },
  { cursadaId: 5, dia: "Jueves", horaIni: "07:30", horaFin: "13:00" },
  { cursadaId: 6, dia: "Viernes", horaIni: "08:00", horaFin: "12:00" },
  { dia: "Lunes", horaIni: "14:00", horaFin: "18:00" },
  { dia: "Martes", horaIni: "14:00", horaFin: "18:00" },
  { cursadaId: 8, dia: "Viernes", horaIni: "13:00", horaFin: "18:00" },
  { cursadaId: 10, dia: "Miercoles", horaIni: "08:00", horaFin: "12:00" },
  { dia: "Martes", horaIni: "09:00", horaFin: "13:00" },
  { dia: "Miercoles", horaIni: "10:00", horaFin: "16:00" },
  { dia: "Jueves", horaIni: "08:00", horaFin: "12:00" },
  { dia: "Viernes", horaIni: "09:00", horaFin: "15:00" },
  { cursadaId: 22, dia: "Martes", horaIni: "10:00", horaFin: "11:30" },
  { cursadaId: 23, dia: "Jueves", horaIni: "08:00", horaFin: "09:30" },
  { cursadaId: 24, dia: "Lunes", horaIni: "11:00", horaFin: "12:30" },
  { cursadaId: 25, dia: "Miercoles", horaIni: "09:00", horaFin: "10:30" },
  { cursadaId: 26, dia: "Viernes", horaIni: "10:00", horaFin: "11:30" },
  { dia: "Lunes", horaIni: "08:00", horaFin: "12:00" },
  { dia: "Miercoles", horaIni: "08:00", horaFin: "12:00" },
];

const ciclosLectivos: Omit<CicloLectivo, "id">[] = [
  { fechaIni: "2024-03-01", fechaFin: "2025-02-28", activo: false },
  { fechaIni: "2025-03-01", fechaFin: "2026-02-28", activo: false },
  { fechaIni: "2026-03-02", fechaFin: "2027-02-28", activo: true },
];

const orientaciones: Omit<Orientacion, "id">[] = [
  { nombre: "Ciencias Naturales", activo: true },
  { nombre: "Ciencias Sociales", activo: true },
  { nombre: "Economía", activo: true },
  { nombre: "Arte", activo: true },
  { nombre: "Informática", activo: true },
  { nombre: "Agropecuaria", activo: true },
];

const cursos: CursoSeed[] = [
  { nivel: 1, nombre: "A", turno: "Maniana", activo: true },
  { nivel: 1, nombre: "B", turno: "Tarde", activo: true },
  { nivel: 2, nombre: "A", turno: "Maniana", activo: true },
  { nivel: 2, nombre: "B", turno: "Tarde", activo: true },
  { nivel: 3, nombre: "A", turno: "Maniana", activo: true },
  { nivel: 4, nombre: "A", turno: "Tarde", activo: true, orientacionId: 5 },
  { nivel: 5, nombre: "A", turno: "Noche", activo: true, orientacionId: 5 },
  { nivel: 6, nombre: "A", turno: "Noche", activo: true, orientacionId: 5 },
];

const materias: Omit<Materia, "id">[] = [
  { nombre: "Matemática", nivel: 1, activo: true, curricular: true },
  { nombre: "Lengua y Literatura", nivel: 1, activo: true, curricular: true },
  { nombre: "Biología", nivel: 1, activo: true, curricular: true },
  { nombre: "Historia", nivel: 2, activo: true, curricular: true },
  { nombre: "Geografía", nivel: 2, activo: true, curricular: true },
  { nombre: "Física", nivel: 2, activo: true, curricular: true },
  { nombre: "Química", nivel: 3, activo: true, curricular: true },
  { nombre: "Educación Ciudadana", nivel: 3, activo: true, curricular: true },
  { nombre: "Inglés", nivel: 3, activo: true, curricular: false },
  { nombre: "Economía", nivel: 4, activo: true, curricular: true },
  { nombre: "Filosofía", nivel: 5, activo: true, curricular: true },
  { nombre: "Psicología", nivel: 6, activo: true, curricular: true },
];

const cursadas: Omit<Cursada, "id">[] = [
  { cantidadClases: 32, tipo: "Curricular", cursoId: 1, materiaId: 1, aulaId: 1, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 1, materiaId: 2, aulaId: 1, cicloLectivoId: 3 },
  { cantidadClases: 30, tipo: "Curricular", cursoId: 1, materiaId: 3, aulaId: 4, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 2, materiaId: 1, aulaId: 2, cicloLectivoId: 2 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 2, materiaId: 2, aulaId: 2, cicloLectivoId: 3 },
  { cantidadClases: 16, tipo: "Extracurricular", cursoId: 2, materiaId: 9, aulaId: 6, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 3, materiaId: 4, aulaId: 3, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 3, materiaId: 5, aulaId: 3, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 4, materiaId: 6, aulaId: 4, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 5, materiaId: 7, aulaId: 4, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 5, materiaId: 8, aulaId: 3, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 6, materiaId: 10, aulaId: 2, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 7, materiaId: 11, aulaId: 6, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 8, materiaId: 12, aulaId: 5, cicloLectivoId: 3 },
  { cantidadClases: 30, tipo: "Curricular", cursoId: 1, materiaId: 1, aulaId: 1, cicloLectivoId: 1 },
  { cantidadClases: 30, tipo: "Curricular", cursoId: 1, materiaId: 2, aulaId: 1, cicloLectivoId: 1 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 1, materiaId: 1, aulaId: 1, cicloLectivoId: 2 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 1, materiaId: 3, aulaId: 4, cicloLectivoId: 2 },
  { cantidadClases: 16, tipo: "Extracurricular", cursoId: 2, materiaId: 9, aulaId: 6, cicloLectivoId: 2 },
  { cantidadClases: 30, tipo: "Curricular", cursoId: 3, materiaId: 4, aulaId: 3, cicloLectivoId: 1 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 3, materiaId: 5, aulaId: 3, cicloLectivoId: 2 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 2, materiaId: 3, aulaId: 1, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 3, materiaId: 6, aulaId: 4, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 4, materiaId: 4, aulaId: 2, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 4, materiaId: 5, aulaId: 2, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 5, materiaId: 9, aulaId: 3, cicloLectivoId: 3 },
  { cantidadClases: 32, tipo: "Curricular", cursoId: 2, materiaId: 1, aulaId: 2, cicloLectivoId: 3 },
];

const domicilios: Omit<Domicilio, "id">[] = [
  { estudianteDni: 43935217, calle: "Calle 25", numero: 1520 },
  { estudianteDni: 45860344, calle: "Calle 44", numero: 2042 },
  { estudianteDni: 46236188, calle: "Calle 9", numero: 2466 },
  { estudianteDni: 44731678, calle: "Calle 7", numero: 1487 },
  { estudianteDni: 45030580, calle: "Diagonal 80", numero: 1721 },
  { estudianteDni: 42983610, calle: "Calle 50", numero: 1874 },
  { estudianteDni: 43764831, calle: "Calle 16", numero: 2099 },
  { estudianteDni: 43581585, calle: "Calle 48", numero: 1291 },
  { estudianteDni: 45179999, calle: "Av. 32", numero: 2304 },
  { estudianteDni: 44158634, calle: "Av. 13", numero: 1516 },
  { estudianteDni: 39759209, calle: "Calle 9", numero: 1066 },
  { estudianteDni: 45381840, calle: "Calle 1", numero: 2718 },
  { estudianteDni: 38299384, calle: "Av. 60", numero: 169 },
  { estudianteDni: 44082976, calle: "Av. 7", numero: 638 },
  { estudianteDni: 46628417, calle: "Calle 38", numero: 2771 },
  { estudianteDni: 44381044, calle: "Av. 7", numero: 157 },
  { estudianteDni: 41799828, calle: "Calle 38", numero: 479 },
  { estudianteDni: 38290548, calle: "Calle 50", numero: 767 },
  { estudianteDni: 42453361, calle: "Calle 7", numero: 1202 },
  { estudianteDni: 45605170, calle: "Calle 16", numero: 926 },
  { estudianteDni: 38902962, calle: "Diagonal 73", numero: 2239 },
  { estudianteDni: 43143736, calle: "Calle 66", numero: 702 },
  { estudianteDni: 39129173, calle: "Av. 60", numero: 2243 },
  { estudianteDni: 39513592, calle: "Calle 16", numero: 2204 },
  { estudianteDni: 41953972, calle: "Av. 13", numero: 1508 },
  { estudianteDni: 45300006, calle: "Calle 50", numero: 2053 },
  { estudianteDni: 43447010, calle: "Diagonal 80", numero: 2897 },
  { estudianteDni: 45618692, calle: "Calle 7", numero: 2196 },
  { estudianteDni: 40994343, calle: "Calle 25", numero: 914 },
  { estudianteDni: 44108773, calle: "Av. 44", numero: 250 },
  { estudianteDni: 45395463, calle: "Av. 122", numero: 401 },
  { estudianteDni: 43908206, calle: "Calle 16", numero: 2116 },
  { estudianteDni: 42918437, calle: "Calle 19", numero: 2022 },
  { estudianteDni: 40030382, calle: "Calle 9", numero: 922 },
  { estudianteDni: 39385568, calle: "Calle 16", numero: 1348 },
  { estudianteDni: 42460771, calle: "Calle 32", numero: 389 },
  { estudianteDni: 46588018, calle: "Calle 50", numero: 446 },
  { estudianteDni: 41298861, calle: "Av. 7", numero: 2135 },
  { estudianteDni: 43311164, calle: "Calle 50", numero: 2172 },
  { estudianteDni: 44278117, calle: "Calle 44", numero: 2705 },
  { estudianteDni: 44378419, calle: "Calle 1", numero: 1588 },
  { estudianteDni: 45552644, calle: "Calle 32", numero: 946 },
  { estudianteDni: 42765346, calle: "Calle 25", numero: 1015 },
  { estudianteDni: 44874616, calle: "Calle 9", numero: 2881 },
  { estudianteDni: 45217843, calle: "Av. 32", numero: 673 },
  { estudianteDni: 45338138, calle: "Calle 25", numero: 2216 },
  { estudianteDni: 45629954, calle: "Av. 32", numero: 1259 },
  { estudianteDni: 40794348, calle: "Calle 25", numero: 2442 },
  { estudianteDni: 41467449, calle: "Calle 66", numero: 1496 },
  { estudianteDni: 42017165, calle: "Calle 50", numero: 510 },
  { estudianteDni: 44512345, calle: "Calle 19", numero: 734 },
];

const contactosEmergencia: Omit<ContactoEmergencia, "id">[] = [
  { estudianteDni: 43935217, activo: true, nombre: "Florencia", apellido: "Giménez", dni: 38925479, cuil: "27-38925479-8", email: "florencia.gimenez51@gmail.com", telefono: "2213875824" },
  { estudianteDni: 43935217, activo: true, nombre: "Ricardo", apellido: "Ramos", dni: 35421987, cuil: "20-35421987-6", email: "ricardo.ramos@gmail.com", telefono: "2215549103" },
  { estudianteDni: 45860344, activo: true, nombre: "Javier", apellido: "Vega", dni: 44537009, cuil: "20-44537009-0", email: "javier.vega17@gmail.com", telefono: "2214271087" },
  { estudianteDni: 45860344, activo: true, nombre: "Silvia", apellido: "Montero", dni: 36712345, cuil: "27-36712345-1", email: "silvia.montero@gmail.com", telefono: "2213017755" },
  { estudianteDni: 46236188, activo: true, nombre: "Diego", apellido: "Silva", dni: 40397504, cuil: "20-40397504-5", email: "diego.silva56@gmail.com", telefono: "2214989199" },
  { estudianteDni: 44731678, activo: true, nombre: "Micaela", apellido: "Delgado", dni: 41962593, cuil: "27-41962593-1", email: "micaela.delgado78@hotmail.com", telefono: "2216422070" },
  { estudianteDni: 45030580, activo: true, nombre: "Tomás", apellido: "Rodríguez", dni: 42309311, cuil: "20-42309311-7", email: "tomas.rodriguez15@yahoo.com.ar", telefono: "2213249222" },
  { estudianteDni: 42983610, activo: true, nombre: "Mariela", apellido: "Acosta", dni: 45595611, cuil: "27-45595611-3", email: "mariela.acosta41@hotmail.com", telefono: "2216798892" },
  { estudianteDni: 43764831, activo: true, nombre: "Javier", apellido: "Ruiz", dni: 40983213, cuil: "20-40983213-2", email: "javier.ruiz71@gmail.com", telefono: "2213842394" },
  { estudianteDni: 43581585, activo: true, nombre: "Daniela", apellido: "Molina", dni: 38229314, cuil: "27-38229314-9", email: "daniela.molina96@yahoo.com.ar", telefono: "2213119434" },
  { estudianteDni: 45179999, activo: true, nombre: "Maximiliano", apellido: "Benítez", dni: 40983451, cuil: "20-40983451-5", email: "maximiliano.benitez31@yahoo.com.ar", telefono: "2213743188" },
  { estudianteDni: 44158634, activo: true, nombre: "Federico", apellido: "Molina", dni: 44215879, cuil: "20-44215879-8", email: "federico.molina32@outlook.com", telefono: "2213524792" },
  { estudianteDni: 39759209, activo: true, nombre: "Facundo", apellido: "Silva", dni: 41233314, cuil: "20-41233314-6", email: "facundo.silva67@hotmail.com", telefono: "2215473478" },
  { estudianteDni: 45381840, activo: true, nombre: "Gonzalo", apellido: "Núñez", dni: 39096984, cuil: "20-39096984-0", email: "gonzalo.nunez34@hotmail.com", telefono: "2216847055" },
  { estudianteDni: 38299384, activo: true, nombre: "Federico", apellido: "López", dni: 39649354, cuil: "20-39649354-8", email: "federico.lopez23@yahoo.com.ar", telefono: "2216074280" },
  { estudianteDni: 44082976, activo: true, nombre: "Florencia", apellido: "Rodríguez", dni: 44731963, cuil: "27-44731963-7", email: "florencia.rodriguez52@yahoo.com.ar", telefono: "2216384991" },
  { estudianteDni: 46628417, activo: true, nombre: "Rodrigo", apellido: "Torres", dni: 46887987, cuil: "20-46887987-0", email: "rodrigo.torres65@yahoo.com.ar", telefono: "2213933586" },
  { estudianteDni: 44381044, activo: true, nombre: "Ignacio", apellido: "Ibáñez", dni: 42915425, cuil: "20-42915425-9", email: "ignacio.ibanez37@hotmail.com", telefono: "2215645829" },
  { estudianteDni: 41799828, activo: true, nombre: "Aldana", apellido: "Vera", dni: 41489277, cuil: "27-41489277-8", email: "aldana.vera75@hotmail.com", telefono: "2215275038" },
  { estudianteDni: 38290548, activo: true, nombre: "Emilio", apellido: "Delgado", dni: 43463946, cuil: "20-43463946-9", email: "emilio.delgado94@yahoo.com.ar", telefono: "2213009088" },
  { estudianteDni: 42453361, activo: true, nombre: "Rodrigo", apellido: "Álvarez", dni: 38048129, cuil: "20-38048129-9", email: "rodrigo.alvarez88@gmail.com", telefono: "2214628423" },
  { estudianteDni: 45605170, activo: true, nombre: "Silvana", apellido: "Gómez", dni: 39617053, cuil: "27-39617053-8", email: "silvana.gomez5@yahoo.com.ar", telefono: "2215169438" },
  { estudianteDni: 38902962, activo: true, nombre: "Florencia", apellido: "Paz", dni: 39007297, cuil: "27-39007297-0", email: "florencia.paz76@gmail.com", telefono: "2213342918" },
  { estudianteDni: 43143736, activo: true, nombre: "Ezequiel", apellido: "García", dni: 40998608, cuil: "20-40998608-5", email: "ezequiel.garcia24@hotmail.com", telefono: "2214759702" },
  { estudianteDni: 39129173, activo: true, nombre: "Romina", apellido: "Delgado", dni: 39416052, cuil: "27-39416052-1", email: "romina.delgado76@outlook.com", telefono: "2213829300" },
  { estudianteDni: 39513592, activo: true, nombre: "Romina", apellido: "González", dni: 44189008, cuil: "27-44189008-5", email: "romina.gonzalez31@gmail.com", telefono: "2216535083" },
  { estudianteDni: 41953972, activo: true, nombre: "Maximiliano", apellido: "Benítez", dni: 43128776, cuil: "20-43128776-6", email: "maximiliano.benitez67@yahoo.com.ar", telefono: "2213966554" },
  { estudianteDni: 45300006, activo: true, nombre: "Emilio", apellido: "Vega", dni: 42200075, cuil: "20-42200075-2", email: "emilio.vega99@gmail.com", telefono: "2216759521" },
  { estudianteDni: 43447010, activo: true, nombre: "Valentina", apellido: "Silva", dni: 46892102, cuil: "27-46892102-6", email: "valentina.silva20@outlook.com", telefono: "2216678458" },
  { estudianteDni: 45618692, activo: true, nombre: "Aldana", apellido: "Ruiz", dni: 43517922, cuil: "27-43517922-0", email: "aldana.ruiz47@hotmail.com", telefono: "2216021301" },
  { estudianteDni: 40994343, activo: true, nombre: "Romina", apellido: "Vera", dni: 43056817, cuil: "27-43056817-0", email: "romina.vera71@gmail.com", telefono: "2213585426" },
  { estudianteDni: 44108773, activo: true, nombre: "Florencia", apellido: "Vega", dni: 40417872, cuil: "27-40417872-4", email: "florencia.vega23@gmail.com", telefono: "2213014699" },
  { estudianteDni: 45395463, activo: true, nombre: "Nicolás", apellido: "González", dni: 46997246, cuil: "20-46997246-8", email: "nicolas.gonzalez22@yahoo.com.ar", telefono: "2213377988" },
  { estudianteDni: 43908206, activo: true, nombre: "Javier", apellido: "Benítez", dni: 43144076, cuil: "20-43144076-3", email: "javier.benitez18@hotmail.com", telefono: "2214329332" },
  { estudianteDni: 42918437, activo: true, nombre: "Maximiliano", apellido: "Chávez", dni: 43391989, cuil: "20-43391989-3", email: "maximiliano.chavez20@hotmail.com", telefono: "2215991879" },
  { estudianteDni: 40030382, activo: true, nombre: "Leandro", apellido: "Ramos", dni: 45319936, cuil: "20-45319936-2", email: "leandro.ramos45@gmail.com", telefono: "2215146486" },
  { estudianteDni: 39385568, activo: true, nombre: "Camila", apellido: "Torres", dni: 43783469, cuil: "27-43783469-3", email: "camila.torres89@yahoo.com.ar", telefono: "2213759701" },
  { estudianteDni: 42460771, activo: true, nombre: "Carolina", apellido: "Ríos", dni: 42399649, cuil: "27-42399649-3", email: "carolina.rios6@gmail.com", telefono: "2215596484" },
  { estudianteDni: 46588018, activo: true, nombre: "Santiago", apellido: "Ríos", dni: 38687359, cuil: "20-38687359-6", email: "santiago.rios71@yahoo.com.ar", telefono: "2214294779" },
  { estudianteDni: 41298861, activo: true, nombre: "Lucía", apellido: "González", dni: 43905926, cuil: "27-43905926-7", email: "lucia.gonzalez38@yahoo.com.ar", telefono: "2213262072" },
  { estudianteDni: 43311164, activo: true, nombre: "Sebastián", apellido: "Ibáñez", dni: 46857977, cuil: "20-46857977-9", email: "sebastian.ibanez51@gmail.com", telefono: "2216165646" },
  { estudianteDni: 44278117, activo: true, nombre: "Sofía", apellido: "Silva", dni: 40039182, cuil: "27-40039182-2", email: "sofia.silva39@hotmail.com", telefono: "2216997967" },
  { estudianteDni: 44378419, activo: true, nombre: "Sofía", apellido: "Sánchez", dni: 38561827, cuil: "27-38561827-4", email: "sofia.sanchez37@gmail.com", telefono: "2216104087" },
  { estudianteDni: 45552644, activo: true, nombre: "Natalia", apellido: "Flores", dni: 42220241, cuil: "27-42220241-2", email: "natalia.flores53@outlook.com", telefono: "2216453294" },
  { estudianteDni: 42765346, activo: true, nombre: "Camila", apellido: "Suárez", dni: 40582029, cuil: "27-40582029-4", email: "camila.suarez12@gmail.com", telefono: "2215489552" },
  { estudianteDni: 44874616, activo: true, nombre: "Sebastián", apellido: "Morales", dni: 43169073, cuil: "20-43169073-4", email: "sebastian.morales89@yahoo.com.ar", telefono: "2213011502" },
  { estudianteDni: 45217843, activo: true, nombre: "Luciano", apellido: "Cabrera", dni: 44855653, cuil: "20-44855653-6", email: "luciano.cabrera86@outlook.com", telefono: "2216263881" },
  { estudianteDni: 45338138, activo: true, nombre: "Gonzalo", apellido: "Silva", dni: 39349788, cuil: "20-39349788-9", email: "gonzalo.silva21@yahoo.com.ar", telefono: "2215163788" },
  { estudianteDni: 45629954, activo: true, nombre: "Martín", apellido: "García", dni: 45889114, cuil: "20-45889114-7", email: "martin.garcia9@outlook.com", telefono: "2214714509" },
  { estudianteDni: 40794348, activo: true, nombre: "Lucía", apellido: "Pérez", dni: 38203403, cuil: "27-38203403-4", email: "lucia.perez84@gmail.com", telefono: "2216733105" },
  { estudianteDni: 41467449, activo: true, nombre: "Natalia", apellido: "Mendoza", dni: 44549486, cuil: "27-44549486-3", email: "natalia.mendoza30@outlook.com", telefono: "2215867983" },
  { estudianteDni: 42017165, activo: true, nombre: "Leandro", apellido: "Delgado", dni: 41291093, cuil: "20-41291093-2", email: "leandro.delgado75@outlook.com", telefono: "2214252498" },
  { estudianteDni: 44512345, activo: true, nombre: "Graciela", apellido: "Herrera", dni: 36842201, cuil: "27-36842201-3", email: "graciela.herrera@gmail.com", telefono: "2214903312" },
];

const estudiantes: Omit<Estudiante, "id">[] = [
  { activo: true, apellido: "Ramos", cuil: "27-43935217-7", dni: 43935217, email: "carolina.ramos@gmail.com", nombre: "Carolina", telefono: "2210116013", folio: 154, libro: 11, estado: "Regular", fechaNacimiento: "2004-02-18", nacionalidad: "Argentina", edad: 21 },
  { activo: true, apellido: "Vega", cuil: "20-45860344-4", dni: 45860344, email: "federico.vega@gmail.com", nombre: "Federico", telefono: "2210103586", folio: 340, libro: 3, estado: "Regular", fechaNacimiento: "2001-08-27", nacionalidad: "Uruguay", edad: 24 },
  { activo: true, apellido: "Silva", cuil: "20-46236188-8", dni: 46236188, email: "martin.silva@gmail.com", nombre: "Martín", telefono: "2210197560", folio: 233, libro: 2, estado: "Regular", fechaNacimiento: "2001-08-22", nacionalidad: "Chile", edad: 24 },
  { activo: true, apellido: "Delgado", cuil: "20-44731678-8", dni: 44731678, email: "lucia.delgado@gmail.com", nombre: "Lucía", telefono: "2210177390", folio: 63, libro: 19, estado: "Libre", fechaNacimiento: "2004-10-26", nacionalidad: "Chile", edad: 21 },
  { activo: true, apellido: "Rodríguez", cuil: "20-45030580-0", dni: 45030580, email: "sofia.rodriguez@gmail.com", nombre: "Sofía", telefono: "2210165107", folio: 121, libro: 3, estado: "Regular", fechaNacimiento: "1996-06-06", nacionalidad: "Argentina", edad: 29 },
  { activo: true, apellido: "Acosta", cuil: "20-42983610-0", dni: 42983610, email: "sebastian.acosta@gmail.com", nombre: "Sebastián", telefono: "2210167874", folio: 332, libro: 6, estado: "Regular", fechaNacimiento: "1995-05-28", nacionalidad: "Argentina", edad: 30 },
  { activo: true, apellido: "Ruiz", cuil: "27-43764831-1", dni: 43764831, email: "tamara.ruiz@gmail.com", nombre: "Tamara", telefono: "2210130584", folio: 51, libro: 8, estado: "Regular", fechaNacimiento: "1999-11-25", nacionalidad: "Uruguay", edad: 26 },
  { activo: true, apellido: "Molina", cuil: "27-43581585-5", dni: 43581585, email: "mariela.molina@gmail.com", nombre: "Mariela", telefono: "2210155541", folio: 200, libro: 8, estado: "Regular", fechaNacimiento: "2005-12-13", nacionalidad: "Bolivia", edad: 20 },
  { activo: true, apellido: "Benítez", cuil: "27-45179999-9", dni: 45179999, email: "diego.benitez@gmail.com", nombre: "Diego", telefono: "2210125549", folio: 369, libro: 2, estado: "Libre", fechaNacimiento: "1997-12-15", nacionalidad: "Argentina", edad: 28 },
  { activo: true, apellido: "Molina", cuil: "20-44158634-4", dni: 44158634, email: "tamara.molina@gmail.com", nombre: "Tamara", telefono: "2210152750", folio: 390, libro: 18, estado: "Regular", fechaNacimiento: "2000-07-08", nacionalidad: "Paraguay", edad: 25 },
  { activo: true, apellido: "Silva", cuil: "27-39759209-9", dni: 39759209, email: "melina.silva@gmail.com", nombre: "Melina", telefono: "2210110477", folio: 247, libro: 11, estado: "Regular", fechaNacimiento: "2001-04-25", nacionalidad: "Argentina", edad: 24 },
  { activo: true, apellido: "Núñez", cuil: "20-45381840-0", dni: 45381840, email: "santiago.nunez@gmail.com", nombre: "Santiago", telefono: "2210199137", folio: 184, libro: 10, estado: "Regular", fechaNacimiento: "1998-12-01", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "López", cuil: "20-38299384-4", dni: 38299384, email: "ignacio.lopez@gmail.com", nombre: "Ignacio", telefono: "2210160462", folio: 59, libro: 11, estado: "Regular", fechaNacimiento: "2000-07-03", nacionalidad: "Argentina", edad: 25 },
  { activo: true, apellido: "Rodríguez", cuil: "20-44082976-6", dni: 44082976, email: "agustina.rodriguez@gmail.com", nombre: "Agustina", telefono: "2210153915", folio: 227, libro: 11, estado: "Libre", fechaNacimiento: "1998-05-02", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "Torres", cuil: "27-46628417-7", dni: 46628417, email: "natalia.torres@gmail.com", nombre: "Natalia", telefono: "2210166782", folio: 449, libro: 2, estado: "Regular", fechaNacimiento: "2004-12-19", nacionalidad: "Bolivia", edad: 21 },
  { activo: true, apellido: "Vega", cuil: "20-44381044-4", dni: 44381044, email: "micaela.vega@gmail.com", nombre: "Micaela", telefono: "2210177454", folio: 163, libro: 2, estado: "Regular", fechaNacimiento: "1999-03-12", nacionalidad: "Argentina", edad: 26 },
  { activo: true, apellido: "Vera", cuil: "20-41799828-8", dni: 41799828, email: "santiago.vera@gmail.com", nombre: "Santiago", telefono: "2210178239", folio: 493, libro: 7, estado: "Libre", fechaNacimiento: "2001-07-03", nacionalidad: "Bolivia", edad: 24 },
  { activo: true, apellido: "Delgado", cuil: "20-38290548-8", dni: 38290548, email: "micaela.delgado@gmail.com", nombre: "Micaela", telefono: "2210107306", folio: 434, libro: 15, estado: "Libre", fechaNacimiento: "2000-08-13", nacionalidad: "Argentina", edad: 25 },
  { activo: true, apellido: "Álvarez", cuil: "27-42453361-1", dni: 42453361, email: "veronica.alvarez@gmail.com", nombre: "Verónica", telefono: "2210149301", folio: 262, libro: 3, estado: "Libre", fechaNacimiento: "2004-04-11", nacionalidad: "Argentina", edad: 21 },
  { activo: true, apellido: "Gómez", cuil: "20-45605170-0", dni: 45605170, email: "martin.gomez@gmail.com", nombre: "Martín", telefono: "2210181313", folio: 436, libro: 18, estado: "Regular", fechaNacimiento: "2007-10-19", nacionalidad: "Bolivia", edad: 18 },
  { activo: true, apellido: "Paz", cuil: "20-38902962-2", dni: 38902962, email: "melina.paz@gmail.com", nombre: "Melina", telefono: "2210197169", folio: 267, libro: 14, estado: "Regular", fechaNacimiento: "2003-05-05", nacionalidad: "Bolivia", edad: 22 },
  { activo: true, apellido: "Sánchez", cuil: "20-43143736-6", dni: 43143736, email: "nicolas.sanchez@gmail.com", nombre: "Nicolás", telefono: "2210159741", folio: 110, libro: 16, estado: "Regular", fechaNacimiento: "1995-11-10", nacionalidad: "Uruguay", edad: 30 },
  { activo: true, apellido: "Paz", cuil: "27-39129173-3", dni: 39129173, email: "romina.paz@gmail.com", nombre: "Romina", telefono: "2210156565", folio: 335, libro: 3, estado: "Regular", fechaNacimiento: "1996-01-08", nacionalidad: "Perú", edad: 29 },
  { activo: true, apellido: "Cabrera", cuil: "20-39513592-2", dni: 39513592, email: "tomas.cabrera@gmail.com", nombre: "Tomás", telefono: "2210185496", folio: 497, libro: 17, estado: "Regular", fechaNacimiento: "2007-05-19", nacionalidad: "Argentina", edad: 18 },
  { activo: true, apellido: "Benítez", cuil: "20-41953972-2", dni: 41953972, email: "romina.benitez@gmail.com", nombre: "Romina", telefono: "2210138780", folio: 302, libro: 8, estado: "Libre", fechaNacimiento: "2001-11-20", nacionalidad: "Uruguay", edad: 24 },
  { activo: true, apellido: "Benítez", cuil: "20-45300006-6", dni: 45300006, email: "ramiro.benitez@gmail.com", nombre: "Ramiro", telefono: "2210146939", folio: 12, libro: 17, estado: "Regular", fechaNacimiento: "2007-03-12", nacionalidad: "Chile", edad: 18 },
  { activo: true, apellido: "Silva", cuil: "20-43447010-0", dni: 43447010, email: "lucia.silva@gmail.com", nombre: "Lucía", telefono: "2210187417", folio: 104, libro: 3, estado: "Libre", fechaNacimiento: "2007-11-01", nacionalidad: "Perú", edad: 18 },
  { activo: true, apellido: "Torres", cuil: "20-45618692-2", dni: 45618692, email: "martin.torres@gmail.com", nombre: "Martín", telefono: "2210117153", folio: 410, libro: 15, estado: "Regular", fechaNacimiento: "2007-07-13", nacionalidad: "Argentina", edad: 18 },
  { activo: true, apellido: "Vera", cuil: "27-40994343-3", dni: 40994343, email: "tamara.vera@gmail.com", nombre: "Tamara", telefono: "2210172053", folio: 465, libro: 15, estado: "Regular", fechaNacimiento: "2006-03-26", nacionalidad: "Argentina", edad: 19 },
  { activo: true, apellido: "Reyes", cuil: "27-44108773-3", dni: 44108773, email: "daniela.reyes@gmail.com", nombre: "Daniela", telefono: "2210117856", folio: 341, libro: 8, estado: "Regular", fechaNacimiento: "2002-12-14", nacionalidad: "Argentina", edad: 23 },
  { activo: true, apellido: "González", cuil: "27-45395463-3", dni: 45395463, email: "romina.gonzalez@gmail.com", nombre: "Romina", telefono: "2210176709", folio: 411, libro: 10, estado: "Regular", fechaNacimiento: "2002-12-06", nacionalidad: "Paraguay", edad: 23 },
  { activo: true, apellido: "Benítez", cuil: "20-43908206-6", dni: 43908206, email: "luciano.benitez@gmail.com", nombre: "Luciano", telefono: "2210107604", folio: 31, libro: 12, estado: "Libre", fechaNacimiento: "1999-10-11", nacionalidad: "Argentina", edad: 26 },
  { activo: true, apellido: "Reyes", cuil: "27-42918437-7", dni: 42918437, email: "ezequiel.reyes@gmail.com", nombre: "Ezequiel", telefono: "2210127780", folio: 352, libro: 3, estado: "Regular", fechaNacimiento: "1998-02-06", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "Gómez", cuil: "20-40030382-2", dni: 40030382, email: "facundo.gomez@gmail.com", nombre: "Facundo", telefono: "2210153506", folio: 464, libro: 16, estado: "Egresado", fechaNacimiento: "1998-06-13", nacionalidad: "Uruguay", edad: 27 },
  { activo: true, apellido: "Torres", cuil: "20-39385568-8", dni: 39385568, email: "natalia.torres@gmail.com", nombre: "Natalia", telefono: "2210106772", folio: 69, libro: 15, estado: "Regular", fechaNacimiento: "2002-09-01", nacionalidad: "Perú", edad: 23 },
  { activo: true, apellido: "Castro", cuil: "27-42460771-1", dni: 42460771, email: "melina.castro@gmail.com", nombre: "Melina", telefono: "2210197504", folio: 197, libro: 6, estado: "Egresado", fechaNacimiento: "2002-06-18", nacionalidad: "Paraguay", edad: 23 },
  { activo: true, apellido: "Mendoza", cuil: "20-46588018-8", dni: 46588018, email: "ramiro.mendoza@gmail.com", nombre: "Ramiro", telefono: "2210115422", folio: 447, libro: 1, estado: "Libre", fechaNacimiento: "2006-09-03", nacionalidad: "Argentina", edad: 19 },
  { activo: true, apellido: "González", cuil: "27-41298861-1", dni: 41298861, email: "tamara.gonzalez@gmail.com", nombre: "Tamara", telefono: "2210141335", folio: 346, libro: 8, estado: "Libre", fechaNacimiento: "1998-05-09", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "Ibáñez", cuil: "20-43311164-4", dni: 43311164, email: "veronica.ibanez@gmail.com", nombre: "Verónica", telefono: "2210103401", folio: 258, libro: 3, estado: "Libre", fechaNacimiento: "2002-08-18", nacionalidad: "Argentina", edad: 23 },
  { activo: true, apellido: "López", cuil: "27-44278117-7", dni: 44278117, email: "nicolas.lopez@gmail.com", nombre: "Nicolás", telefono: "2210187436", folio: 68, libro: 17, estado: "Regular", fechaNacimiento: "2003-11-20", nacionalidad: "Perú", edad: 22 },
  { activo: true, apellido: "Sánchez", cuil: "27-44378419-9", dni: 44378419, email: "aldana.sanchez@gmail.com", nombre: "Aldana", telefono: "2210158061", folio: 389, libro: 8, estado: "Libre", fechaNacimiento: "1995-08-26", nacionalidad: "Paraguay", edad: 30 },
  { activo: true, apellido: "Flores", cuil: "20-45552644-4", dni: 45552644, email: "sofia.flores@gmail.com", nombre: "Sofía", telefono: "2210148333", folio: 241, libro: 17, estado: "Regular", fechaNacimiento: "2002-05-26", nacionalidad: "Argentina", edad: 23 },
  { activo: true, apellido: "López", cuil: "20-42765346-6", dni: 42765346, email: "romina.lopez@gmail.com", nombre: "Romina", telefono: "2210166482", folio: 119, libro: 15, estado: "Egresado", fechaNacimiento: "1996-04-26", nacionalidad: "Argentina", edad: 29 },
  { activo: true, apellido: "Morales", cuil: "20-44874616-6", dni: 44874616, email: "ezequiel.morales@gmail.com", nombre: "Ezequiel", telefono: "2210112221", folio: 178, libro: 2, estado: "Libre", fechaNacimiento: "1997-11-06", nacionalidad: "Argentina", edad: 28 },
  { activo: true, apellido: "Giménez", cuil: "27-45217843-3", dni: 45217843, email: "aldana.gimenez@gmail.com", nombre: "Aldana", telefono: "2210143514", folio: 79, libro: 19, estado: "Libre", fechaNacimiento: "1996-07-01", nacionalidad: "Perú", edad: 29 },
  { activo: true, apellido: "Silva", cuil: "20-45338138-8", dni: 45338138, email: "aldana.silva@gmail.com", nombre: "Aldana", telefono: "2210153921", folio: 417, libro: 5, estado: "Regular", fechaNacimiento: "1997-12-24", nacionalidad: "Argentina", edad: 28 },
  { activo: true, apellido: "Reyes", cuil: "20-45629954-4", dni: 45629954, email: "matias.reyes@gmail.com", nombre: "Matías", telefono: "2210121829", folio: 46, libro: 19, estado: "Libre", fechaNacimiento: "1995-12-06", nacionalidad: "Argentina", edad: 30 },
  { activo: true, apellido: "Pérez", cuil: "20-40794348-8", dni: 40794348, email: "ramiro.perez@gmail.com", nombre: "Ramiro", telefono: "2210102261", folio: 20, libro: 1, estado: "Regular", fechaNacimiento: "2001-06-21", nacionalidad: "Chile", edad: 24 },
  { activo: true, apellido: "Flores", cuil: "27-41467449-9", dni: 41467449, email: "javier.flores@gmail.com", nombre: "Javier", telefono: "2210117755", folio: 147, libro: 6, estado: "Regular", fechaNacimiento: "1996-11-04", nacionalidad: "Bolivia", edad: 29 },
  { activo: true, apellido: "Vargas", cuil: "27-42017165-5", dni: 42017165, email: "daniela.vargas@gmail.com", nombre: "Daniela", telefono: "2210161478", folio: 359, libro: 19, estado: "Regular", fechaNacimiento: "2002-06-15", nacionalidad: "Argentina", edad: 23 },
  { activo: false, apellido: "Herrera", cuil: "20-44512345-5", dni: 44512345, email: "pablo.herrera@gmail.com", nombre: "Pablo", telefono: "2210134567", folio: 88, libro: 7, estado: "Desertor", fechaNacimiento: "2004-05-15", nacionalidad: "Argentina", edad: 22 },
];

const personal: Omit<Personal, "id">[] = [
  { activo: true, apellido: "Díaz", cuil: "20-30123456-6", dni: 30123456, email: "adiaz@ees7.edu.ar", nombre: "Ana", telefono: "2213456701", fechaIngreso: "2015-03-01" },
  { activo: true, apellido: "Gómez", cuil: "27-32456789-9", dni: 32456789, email: "cgomez@ees7.edu.ar", nombre: "Carlos", telefono: "2213456702", fechaIngreso: "2017-08-15" },
  { activo: true, apellido: "Rodríguez", cuil: "20-28987654-4", dni: 28987654, email: "mrodriguez@ees7.edu.ar", nombre: "María", telefono: "2213456703", fechaIngreso: "2010-02-10" },
  { activo: true, apellido: "Fernández", cuil: "27-35678123-3", dni: 35678123, email: "lfernandez@ees7.edu.ar", nombre: "Luis", telefono: "2213456704", fechaIngreso: "2019-04-22" },
  { activo: true, apellido: "Sosa", cuil: "27-33112233-3", dni: 33112233, email: "vsosa@ees7.edu.ar", nombre: "Valeria", telefono: "2213456705", fechaIngreso: "2021-06-01" },
  { activo: true, apellido: "Álvarez", cuil: "20-31456789-5", dni: 31456789, email: "ralvarez@ees7.edu.ar", nombre: "Roberto", telefono: "2213456706", fechaIngreso: "2018-03-05" },
  { activo: true, apellido: "Torres", cuil: "27-34567891-2", dni: 34567891, email: "mtorres@ees7.edu.ar", nombre: "Marina", telefono: "2213456707", fechaIngreso: "2020-08-10" },
  { activo: true, apellido: "Ríos", cuil: "20-40123456-7", dni: 40123456, email: "drios@ees7.edu.ar", nombre: "Diego", telefono: "2213456708", fechaIngreso: "2023-02-20" },
  { activo: true, apellido: "Núñez", cuil: "27-29876543-8", dni: 29876543, email: "pnunez@ees7.edu.ar", nombre: "Patricia", telefono: "2213456709", fechaIngreso: "2016-05-12" },
  { activo: true, apellido: "Medina", cuil: "20-27654321-9", dni: 27654321, email: "jmedina@ees7.edu.ar", nombre: "Jorge", telefono: "2213456710", fechaIngreso: "2012-11-03" },
  { activo: true, apellido: "Paz", cuil: "27-33445566-1", dni: 33445566, email: "spaz@ees7.edu.ar", nombre: "Silvina", telefono: "2213456711", fechaIngreso: "2021-09-01" },
  { activo: false, apellido: "Ibáñez", cuil: "20-26789012-3", dni: 26789012, email: "fibanez@ees7.edu.ar", nombre: "Fernando", telefono: "2213456712", fechaIngreso: "2011-04-18" },
  { activo: true, apellido: "Acosta", cuil: "27-36789234-5", dni: 36789234, email: "lacosta@ees7.edu.ar", nombre: "Lucía", telefono: "2213456713", fechaIngreso: "2026-03-02" },
  { activo: true, apellido: "Molina", cuil: "20-25678345-1", dni: 25678345, email: "gmolina@ees7.edu.ar", nombre: "Gustavo", telefono: "2213456714", fechaIngreso: "2020-03-01" },
  { activo: true, apellido: "Benítez", cuil: "27-37890456-2", dni: 37890456, email: "cbenitez@ees7.edu.ar", nombre: "Camila", telefono: "2213456715", fechaIngreso: "2026-06-20" },
  { activo: true, apellido: "Castro", cuil: "20-24567891-0", dni: 24567891, email: "hcastro@ees7.edu.ar", nombre: "Hugo", telefono: "2213456716", fechaIngreso: "2019-03-01" },
  { activo: true, apellido: "Vega", cuil: "27-38901567-8", dni: 38901567, email: "nvega@ees7.edu.ar", nombre: "Natalia", telefono: "2213456717", fechaIngreso: "2024-02-01" },
  { activo: true, apellido: "Herrera", cuil: "20-23456912-7", dni: 23456912, email: "jherrera@ees7.edu.ar", nombre: "Julián", telefono: "2213456718", fechaIngreso: "2022-03-01" },
  // Cubre el rol Directivo, que no tenia ningun usuario asociado.
  { activo: true, apellido: "Quiroga", cuil: "27-30111222-3", dni: 30111222, email: "squiroga@ees7.edu.ar", nombre: "Silvia", telefono: "2213456719", fechaIngreso: "2016-03-01" },
  // Personal SIN Usuario a proposito: es el fixture del 201 de POST /api/auth/register.
  { activo: true, apellido: "Ledesma", cuil: "20-31222333-4", dni: 31222333, email: "tledesma@ees7.edu.ar", nombre: "Tomás", telefono: "2213456720", fechaIngreso: "2026-03-01" },
];

// Los 100 permisos (25 recursos x 4 acciones) salen de src/constants/permisos.ts,
// para que el seed y el authorize() de los routers compartan una unica fuente.
const permisos: Omit<Permiso, "id">[] = CATALOGO_PERMISOS;

// permisosRef => Permiso.codigo (@unique). El reparto vive en
// src/constants/roles.ts, derivado de la seccion "Roles del sistema" de
// matriz-permisos.md.
const roles: RolSeed[] = Object.entries(PERMISOS_POR_ROL).map(([nombre, permisosRef]) => ({
  nombre,
  permisosRef,
}));

// personalRef => Personal.email (@unique) ; rolesRef => Rol.nombre (@unique)
// La contrasenia de cada usuario es la parte local de su email + "2026".
// Se guardan en claro SOLO aca, para poder documentarlas como credenciales de
// prueba: main() las hashea con bcrypt antes de insertarlas.
const usuarios: UsuarioSeed[] = [
  { personalRef: "adiaz@ees7.edu.ar", rolesRef: ["Administrador"], activo: true, contrasenia: "adiaz2026" },
  { personalRef: "cgomez@ees7.edu.ar", rolesRef: ["Preceptor"], activo: true, contrasenia: "cgomez2026" },
  { personalRef: "mrodriguez@ees7.edu.ar", rolesRef: ["Secretario", "Vicedirectivo"], activo: true, contrasenia: "mrodriguez2026" },
  { personalRef: "lfernandez@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "lfernandez2026" },
  { personalRef: "vsosa@ees7.edu.ar", rolesRef: ["Preceptor"], activo: true, contrasenia: "vsosa2026" },
  { personalRef: "ralvarez@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "ralvarez2026" },
  { personalRef: "mtorres@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "mtorres2026" },
  { personalRef: "drios@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "drios2026" },
  { personalRef: "pnunez@ees7.edu.ar", rolesRef: ["EMATP"], activo: true, contrasenia: "pnunez2026" },
  { personalRef: "jmedina@ees7.edu.ar", rolesRef: ["Prosecretario"], activo: true, contrasenia: "jmedina2026" },
  { personalRef: "spaz@ees7.edu.ar", rolesRef: ["Docente", "Preceptor"], activo: true, contrasenia: "spaz2026" },
  // Unico usuario inactivo: es el fixture del 401 "El usuario esta inactivo".
  { personalRef: "fibanez@ees7.edu.ar", rolesRef: ["Docente"], activo: false, contrasenia: "fibanez2026" },
  { personalRef: "lacosta@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "lacosta2026" },
  { personalRef: "gmolina@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "gmolina2026" },
  { personalRef: "cbenitez@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "cbenitez2026" },
  { personalRef: "hcastro@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "hcastro2026" },
  { personalRef: "nvega@ees7.edu.ar", rolesRef: ["Preceptor"], activo: true, contrasenia: "nvega2026" },
  { personalRef: "jherrera@ees7.edu.ar", rolesRef: ["Docente"], activo: true, contrasenia: "jherrera2026" },
  // Cubre el rol Directivo, que antes no tenia ningun usuario.
  { personalRef: "squiroga@ees7.edu.ar", rolesRef: ["Directivo"], activo: true, contrasenia: "squiroga2026" },
];

// personalRef => Personal.email (@unique)
// bloqueHorarioIds / cursoIds => id autoincremental (BloqueHorario y Curso ya insertados)
// asignacionHorariaCubiertaId => posición (1-based) en este mismo array (autorrelación)
const asignacionesHorarias: AsignacionSeed[] = [
  { personalRef: "lfernandez@ees7.edu.ar", bloqueHorarioIds: [1], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2019-04-22", fechaFin: "", cursoIds: [1], materiaId: 1 },
  { personalRef: "ralvarez@ees7.edu.ar", bloqueHorarioIds: [3], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2018-03-05", fechaFin: "", cursoIds: [1], materiaId: 2 },
  { personalRef: "mtorres@ees7.edu.ar", bloqueHorarioIds: [4], tipoCargo: "Profesor", situacionRevista: "Provisional", fechaIni: "2020-08-10", fechaFin: "", cursoIds: [1], materiaId: 3 },
  { personalRef: "spaz@ees7.edu.ar", bloqueHorarioIds: [5], tipoCargo: "Profesor", situacionRevista: "TitularInterino", fechaIni: "2021-09-01", fechaFin: "", cursoIds: [2], materiaId: 2 },
  { personalRef: "adiaz@ees7.edu.ar", bloqueHorarioIds: [7, 17, 18, 19, 20], tipoCargo: "Directivo", situacionRevista: "Titular", fechaIni: "2015-03-01", fechaFin: "" },
  { personalRef: "cgomez@ees7.edu.ar", bloqueHorarioIds: [8], tipoCargo: "Preceptor", situacionRevista: "Titular", fechaIni: "2017-08-15", fechaFin: "", cursoIds: [1] },
  { personalRef: "mrodriguez@ees7.edu.ar", bloqueHorarioIds: [9], tipoCargo: "Secretario", situacionRevista: "Titular", fechaIni: "2010-02-10", fechaFin: "" },
  { personalRef: "mrodriguez@ees7.edu.ar", bloqueHorarioIds: [10], tipoCargo: "Vicedirectivo", situacionRevista: "Suplente", fechaIni: "2022-03-01", fechaFin: "" },
  { personalRef: "vsosa@ees7.edu.ar", bloqueHorarioIds: [11], tipoCargo: "Preceptor", situacionRevista: "Provisional", fechaIni: "2021-06-01", fechaFin: "", cursoIds: [3] },
  { personalRef: "drios@ees7.edu.ar", bloqueHorarioIds: [12], tipoCargo: "Profesor", situacionRevista: "Suplente", fechaIni: "2023-02-20", fechaFin: "", cursoIds: [3], materiaId: 4 },
  { personalRef: "pnunez@ees7.edu.ar", bloqueHorarioIds: [13], tipoCargo: "EMATP", situacionRevista: "Titular", fechaIni: "2016-05-12", fechaFin: "" },
  { personalRef: "jmedina@ees7.edu.ar", bloqueHorarioIds: [14], tipoCargo: "Prosecretario", situacionRevista: "Titular", fechaIni: "2012-11-03", fechaFin: "" },
  { personalRef: "spaz@ees7.edu.ar", bloqueHorarioIds: [15], tipoCargo: "Preceptor", situacionRevista: "Suplente", fechaIni: "2023-03-01", fechaFin: "", cursoIds: [2] },
  { personalRef: "fibanez@ees7.edu.ar", bloqueHorarioIds: [16], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2011-04-18", fechaFin: "", cursoIds: [3], materiaId: 5 },
  { personalRef: "drios@ees7.edu.ar", bloqueHorarioIds: [1], tipoCargo: "Profesor", situacionRevista: "Suplente", fechaIni: "2026-06-15", fechaFin: "2026-07-15", asignacionHorariaCubiertaId: 1, cursoIds: [1], materiaId: 1 },
  { personalRef: "lacosta@ees7.edu.ar", bloqueHorarioIds: [21], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2026-03-02", fechaFin: "", cursoIds: [5], materiaId: 7 },
  { personalRef: "gmolina@ees7.edu.ar", bloqueHorarioIds: [23], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2020-03-01", fechaFin: "", cursoIds: [6], materiaId: 10 },
  { personalRef: "cbenitez@ees7.edu.ar", bloqueHorarioIds: [23], tipoCargo: "Profesor", situacionRevista: "Suplente", fechaIni: "2026-06-20", fechaFin: "2026-08-20", asignacionHorariaCubiertaId: 17, cursoIds: [6], materiaId: 10 },
  { personalRef: "hcastro@ees7.edu.ar", bloqueHorarioIds: [24], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2019-03-01", fechaFin: "", cursoIds: [7], materiaId: 11 },
  { personalRef: "nvega@ees7.edu.ar", bloqueHorarioIds: [26, 27], tipoCargo: "Preceptor", situacionRevista: "Titular", fechaIni: "2024-02-01", fechaFin: "", cursoIds: [4, 6] },
  { personalRef: "jherrera@ees7.edu.ar", bloqueHorarioIds: [25], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2022-03-01", fechaFin: "", cursoIds: [8], materiaId: 12 },
];

const asistenciasInstitucionales: Omit<AsistenciaInstitucional, "id">[] = [
  { estudianteDni: 43935217, fecha: "2026-03-18", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45860344, fecha: "2026-03-20", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 45860344, fecha: "2026-04-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45030580, fecha: "2026-03-12", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45030580, fecha: "2026-03-26", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 45030580, fecha: "2026-04-09", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45030580, fecha: "2026-04-16", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 42983610, fecha: "2026-03-25", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 43581585, fecha: "2026-03-13", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 43581585, fecha: "2026-04-03", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 39759209, fecha: "2026-03-05", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 39759209, fecha: "2026-03-19", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 39759209, fecha: "2026-04-02", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 39759209, fecha: "2026-04-09", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 39759209, fecha: "2026-04-23", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45381840, fecha: "2026-03-06", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 45381840, fecha: "2026-03-27", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45381840, fecha: "2026-04-17", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 38299384, fecha: "2026-04-08", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 46628417, fecha: "2026-03-11", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 46628417, fecha: "2026-04-08", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 38902962, fecha: "2026-04-14", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 39129173, fecha: "2026-03-24", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 39129173, fecha: "2026-04-21", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45605170, fecha: "2026-03-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45605170, fecha: "2026-03-24", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 45605170, fecha: "2026-04-07", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45605170, fecha: "2026-04-14", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 45605170, fecha: "2026-04-28", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45300006, fecha: "2026-03-17", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45300006, fecha: "2026-04-01", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 45300006, fecha: "2026-04-15", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 45300006, fecha: "2026-04-22", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 43935217, fecha: "2026-03-05", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 46236188, fecha: "2026-03-10", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 43764831, fecha: "2026-04-08", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 45860344, fecha: "2026-05-15", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 42983610, fecha: "2026-05-22", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 42983610, fecha: "2026-06-05", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 38299384, fecha: "2026-06-12", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 39129173, fecha: "2026-05-08", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 39129173, fecha: "2026-06-12", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 39129173, fecha: "2026-06-26", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 43935217, fecha: "2026-05-05", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 39513592, fecha: "2026-05-09", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 42453361, fecha: "2025-03-06", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 42453361, fecha: "2025-03-13", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 42453361, fecha: "2025-03-20", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 42453361, fecha: "2025-03-27", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 42453361, fecha: "2025-04-03", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 42453361, fecha: "2025-04-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 42453361, fecha: "2025-04-24", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 41953972, fecha: "2025-03-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 41953972, fecha: "2025-04-07", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 41953972, fecha: "2025-04-21", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 41953972, fecha: "2025-04-28", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 41953972, fecha: "2025-03-25", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 40030382, fecha: "2024-09-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 40030382, fecha: "2024-10-14", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 42460771, fecha: "2024-08-22", tipo: "FaltaCompleta", justificada: true },
];

const cargasIntensificacion: Omit<CargaIntensificacion, "id">[] = [];

const cargasNumericas: Omit<CargaNumerica, "id">[] = [
  { inscripcionId: 20, periodoCargaId: 9, calificacion: 7.0, inasistencias: 2 },
  { inscripcionId: 21, periodoCargaId: 9, calificacion: 3.0, inasistencias: 8 },
  { inscripcionId: 24, periodoCargaId: 9, calificacion: 8.0, inasistencias: 0 },
  { inscripcionId: 22, periodoCargaId: 5, calificacion: 0.0, inasistencias: 22 },
  { inscripcionId: 23, periodoCargaId: 5, calificacion: 0.0, inasistencias: 18 },
  { inscripcionId: 25, periodoCargaId: 5, calificacion: 6.0, inasistencias: 2 },
  { inscripcionId: 26, periodoCargaId: 5, calificacion: 9.0, inasistencias: 0 },
];

const cargasValorativas: Omit<CargaValorativa, "id">[] = [
  { inscripcionId: 1, periodoCargaId: 3, calificacion: "TEA", inasistencias: 1 },
  { inscripcionId: 2, periodoCargaId: 3, calificacion: "TEP", inasistencias: 2 },
  { inscripcionId: 3, periodoCargaId: 3, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 4, periodoCargaId: 3, calificacion: "TED", inasistencias: 4 },
  { inscripcionId: 5, periodoCargaId: 3, calificacion: "TEP", inasistencias: 1 },
  { inscripcionId: 6, periodoCargaId: 3, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 7, periodoCargaId: 3, calificacion: "TEP", inasistencias: 2 },
  { inscripcionId: 8, periodoCargaId: 3, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 9, periodoCargaId: 3, calificacion: "TED", inasistencias: 5 },
  { inscripcionId: 10, periodoCargaId: 3, calificacion: "TEP", inasistencias: 3 },
  { inscripcionId: 11, periodoCargaId: 3, calificacion: "TEA", inasistencias: 1 },
  { inscripcionId: 12, periodoCargaId: 3, calificacion: "TEP", inasistencias: 2 },
  { inscripcionId: 13, periodoCargaId: 3, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 14, periodoCargaId: 3, calificacion: "TED", inasistencias: 5 },
  { inscripcionId: 15, periodoCargaId: 3, calificacion: "TEP", inasistencias: 1 },
  { inscripcionId: 16, periodoCargaId: 3, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 17, periodoCargaId: 3, calificacion: "TEP", inasistencias: 2 },
  { inscripcionId: 18, periodoCargaId: 3, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 19, periodoCargaId: 3, calificacion: "TED", inasistencias: 4 },
  { inscripcionId: 1, periodoCargaId: 1, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 2, periodoCargaId: 1, calificacion: "TEP", inasistencias: 1 },
  { inscripcionId: 3, periodoCargaId: 1, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 5, periodoCargaId: 1, calificacion: "TEP", inasistencias: 2 },
  { inscripcionId: 6, periodoCargaId: 1, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 8, periodoCargaId: 1, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 11, periodoCargaId: 1, calificacion: "TEP", inasistencias: 1 },
  { inscripcionId: 13, periodoCargaId: 1, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 16, periodoCargaId: 1, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 17, periodoCargaId: 1, calificacion: "TED", inasistencias: 3 },
  { inscripcionId: 18, periodoCargaId: 1, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 20, periodoCargaId: 11, calificacion: "TEP", inasistencias: 2 },
  { inscripcionId: 21, periodoCargaId: 11, calificacion: "TED", inasistencias: 6 },
  { inscripcionId: 24, periodoCargaId: 11, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 20, periodoCargaId: 10, calificacion: "TEA", inasistencias: 1 },
  { inscripcionId: 21, periodoCargaId: 10, calificacion: "TED", inasistencias: 8 },
  { inscripcionId: 24, periodoCargaId: 10, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 20, periodoCargaId: 12, calificacion: "TEP", inasistencias: 1 },
  { inscripcionId: 21, periodoCargaId: 12, calificacion: "TED", inasistencias: 10 },
  { inscripcionId: 24, periodoCargaId: 12, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 22, periodoCargaId: 7, calificacion: "TED", inasistencias: 15 },
  { inscripcionId: 23, periodoCargaId: 7, calificacion: "TEP", inasistencias: 5 },
  { inscripcionId: 25, periodoCargaId: 7, calificacion: "TEP", inasistencias: 2 },
  { inscripcionId: 26, periodoCargaId: 7, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 22, periodoCargaId: 6, calificacion: "TED", inasistencias: 20 },
  { inscripcionId: 23, periodoCargaId: 6, calificacion: "TED", inasistencias: 12 },
  { inscripcionId: 25, periodoCargaId: 6, calificacion: "TEP", inasistencias: 3 },
  { inscripcionId: 26, periodoCargaId: 6, calificacion: "TEA", inasistencias: 0 },
  { inscripcionId: 23, periodoCargaId: 8, calificacion: "TED", inasistencias: 18 },
  { inscripcionId: 25, periodoCargaId: 8, calificacion: "TEP", inasistencias: 1 },
  { inscripcionId: 26, periodoCargaId: 8, calificacion: "TEA", inasistencias: 0 },
];

const inscripciones: Omit<Inscripcion, "id">[] = [
  { estudianteDni: 43935217, cursadaId: 1, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-10", notaFinal: 8 },
  { estudianteDni: 43935217, cursadaId: 2, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-10", notaFinal: null },
  { estudianteDni: 46236188, cursadaId: 2, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-11", notaFinal: null },
  { estudianteDni: 45030580, cursadaId: 3, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-11", notaFinal: null },
  { estudianteDni: 42983610, cursadaId: 5, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-12", notaFinal: null },
  { estudianteDni: 43764831, cursadaId: 22, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-12", notaFinal: null },
  { estudianteDni: 43581585, cursadaId: 6, tipo: "Oyente", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-13", notaFinal: null },
  { estudianteDni: 44158634, cursadaId: 7, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-14", notaFinal: null },
  { estudianteDni: 39759209, cursadaId: 8, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-14", notaFinal: null },
  { estudianteDni: 45381840, cursadaId: 23, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-15", notaFinal: null },
  { estudianteDni: 38299384, cursadaId: 9, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-15", notaFinal: null },
  { estudianteDni: 46628417, cursadaId: 24, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-16", notaFinal: null },
  { estudianteDni: 44381044, cursadaId: 25, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-16", notaFinal: null },
  { estudianteDni: 45605170, cursadaId: 10, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-17", notaFinal: null },
  { estudianteDni: 38902962, cursadaId: 11, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-17", notaFinal: null },
  { estudianteDni: 43143736, cursadaId: 26, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-18", notaFinal: null },
  { estudianteDni: 39129173, cursadaId: 12, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-18", notaFinal: null },
  { estudianteDni: 39513592, cursadaId: 13, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-19", notaFinal: null },
  { estudianteDni: 45300006, cursadaId: 14, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-19", notaFinal: null },
  { estudianteDni: 41799828, cursadaId: 15, tipo: "Normal", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2024-11-20", notaFinal: 7 },
  { estudianteDni: 38290548, cursadaId: 16, tipo: "Normal", cursadaIntensificacionId: null, estado: "Desaprobado", fecha: "2024-11-22", notaFinal: 3 },
  { estudianteDni: 42453361, cursadaId: 17, tipo: "Normal", cursadaIntensificacionId: null, estado: "Libre", fecha: "2025-06-10", notaFinal: null },
  { estudianteDni: 41953972, cursadaId: 19, tipo: "Oyente", cursadaIntensificacionId: null, estado: "Discontinuo", fecha: "2025-05-05", notaFinal: null },
  { estudianteDni: 43447010, cursadaId: 20, tipo: "Normal", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2024-11-25", notaFinal: 8 },
  { estudianteDni: 43908206, cursadaId: 21, tipo: "Recupera", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2025-11-10", notaFinal: 6 },
  { estudianteDni: 46588018, cursadaId: 4, tipo: "Normal", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2025-11-01", notaFinal: 9 },
  { estudianteDni: 45860344, cursadaId: 1, tipo: "Intensifica", cursadaIntensificacionId: 1, estado: "Regular", fecha: "2026-08-10", notaFinal: null },
  { estudianteDni: 41953972, cursadaId: 1, tipo: "Intensifica", cursadaIntensificacionId: 1, estado: "Regular", fecha: "2026-08-10", notaFinal: null },
];

const inscripcionesMesa: Omit<InscripcionMesa, "id">[] = [
  { mesaId: 1, estudianteDni: 40030382, fechaInscripcion: "2026-06-20", nota: 8, asistio: true },
  { mesaId: 1, estudianteDni: 42460771, fechaInscripcion: "2026-06-21", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 42765346, fechaInscripcion: "2026-06-22", nota: 6, asistio: true },
  { mesaId: 1, estudianteDni: 41799828, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 42453361, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 38290548, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 44731678, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 45179999, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 44874616, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 43908206, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 46588018, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 41298861, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 44082976, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 43311164, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 44378419, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 43447010, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 45629954, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 45217843, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 41953972, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 44278117, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 40030382, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 42460771, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 42765346, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 41298861, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 45629954, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 43311164, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 44082976, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 5, estudianteDni: 40030382, fechaInscripcion: "2025-10-20", nota: 7, asistio: true },
  { mesaId: 5, estudianteDni: 42460771, fechaInscripcion: "2025-10-21", nota: 5, asistio: true },
  { mesaId: 5, estudianteDni: 42765346, fechaInscripcion: "2025-10-22", nota: 9, asistio: true },
  { mesaId: 5, estudianteDni: 41799828, fechaInscripcion: "2025-10-23", nota: 2, asistio: true },
  { mesaId: 5, estudianteDni: 42453361, fechaInscripcion: "2025-10-24", nota: null, asistio: false },
  { mesaId: 5, estudianteDni: 43908206, fechaInscripcion: "2025-10-25", nota: 4, asistio: true },
  { mesaId: 6, estudianteDni: 40030382, fechaInscripcion: "2025-10-25", nota: 6, asistio: true },
  { mesaId: 6, estudianteDni: 42765346, fechaInscripcion: "2025-10-26", nota: 8, asistio: true },
  { mesaId: 6, estudianteDni: 44731678, fechaInscripcion: "2025-10-27", nota: 3, asistio: true },
  { mesaId: 6, estudianteDni: 43447010, fechaInscripcion: "2025-10-28", nota: null, asistio: false },
  { mesaId: 7, estudianteDni: 42460771, fechaInscripcion: "2025-07-01", nota: 5, asistio: true },
  { mesaId: 7, estudianteDni: 40030382, fechaInscripcion: "2025-07-02", nota: 9, asistio: true },
  { mesaId: 7, estudianteDni: 45217843, fechaInscripcion: "2025-07-03", nota: 1, asistio: true },
  { mesaId: 8, estudianteDni: 44731678, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 8, estudianteDni: 44082976, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 8, estudianteDni: 38290548, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 8, estudianteDni: 43447010, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 9, estudianteDni: 42765346, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 9, estudianteDni: 40030382, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 10, estudianteDni: 41298861, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 10, estudianteDni: 45217843, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
];

const matriculas: Omit<Matricula, "id">[] = [
  { estudianteDni: 45860344, cursoId: 1, fecha: "2026-03-10" },
  { estudianteDni: 38290548, cursoId: 1, fecha: "2024-11-22" },
  { estudianteDni: 43908206, cursoId: 3, fecha: "2025-11-10" },
  { estudianteDni: 39759209, cursoId: 3, fecha: "2026-03-14" },
  { estudianteDni: 46588018, cursoId: 2, fecha: "2025-11-01" },
  { estudianteDni: 43935217, cursoId: 1, fecha: "2026-03-10" },
  { estudianteDni: 43764831, cursoId: 2, fecha: "2026-03-12" },
  { estudianteDni: 41953972, cursoId: 2, fecha: "2025-05-05" },
  { estudianteDni: 45300006, cursoId: 8, fecha: "2026-03-19" },
  { estudianteDni: 42453361, cursoId: 1, fecha: "2025-06-10" },
  { estudianteDni: 44158634, cursoId: 3, fecha: "2026-03-14" },
  { estudianteDni: 43581585, cursoId: 2, fecha: "2026-03-13" },
  { estudianteDni: 39129173, cursoId: 6, fecha: "2026-03-18" },
  { estudianteDni: 43143736, cursoId: 5, fecha: "2026-03-18" },
  { estudianteDni: 38299384, cursoId: 4, fecha: "2026-03-15" },
  { estudianteDni: 45030580, cursoId: 1, fecha: "2026-03-11" },
  { estudianteDni: 46628417, cursoId: 4, fecha: "2026-03-16" },
  { estudianteDni: 42983610, cursoId: 2, fecha: "2026-03-12" },
  { estudianteDni: 44381044, cursoId: 4, fecha: "2026-03-16" },
  { estudianteDni: 41799828, cursoId: 1, fecha: "2024-11-20" },
  { estudianteDni: 45605170, cursoId: 5, fecha: "2026-03-17" },
  { estudianteDni: 39513592, cursoId: 7, fecha: "2026-03-19" },
  { estudianteDni: 43447010, cursoId: 3, fecha: "2024-11-25" },
  { estudianteDni: 38902962, cursoId: 5, fecha: "2026-03-17" },
  { estudianteDni: 46236188, cursoId: 1, fecha: "2026-03-11" },
  { estudianteDni: 45381840, cursoId: 3, fecha: "2026-03-15" },
];

// personalRef => Personal.email (@unique)
const mesasDeExamen: MesaSeed[] = [
  { materiaId: 1, personalRef: "adiaz@ees7.edu.ar", cicloLectivoId: 3, fecha: "2026-07-15", hora: "09:00", cupo: 15 },
  { materiaId: 6, personalRef: "ralvarez@ees7.edu.ar", cicloLectivoId: 3, fecha: "2026-07-16", hora: "10:30", cupo: 10 },
  { materiaId: 9, personalRef: "pnunez@ees7.edu.ar", cicloLectivoId: 3, fecha: "2026-07-17", hora: "14:00", cupo: 12 },
  { materiaId: 11, personalRef: "spaz@ees7.edu.ar", cicloLectivoId: 3, fecha: "2026-07-20", hora: "08:30", cupo: 8 },
  { materiaId: 4, personalRef: "lfernandez@ees7.edu.ar", cicloLectivoId: 2, fecha: "2025-11-10", hora: "09:30", cupo: 10 },
  { materiaId: 3, personalRef: "ralvarez@ees7.edu.ar", cicloLectivoId: 2, fecha: "2025-11-15", hora: "09:00", cupo: 10 },
  { materiaId: 7, personalRef: "mtorres@ees7.edu.ar", cicloLectivoId: 2, fecha: "2025-07-12", hora: "10:00", cupo: 8 },
  { materiaId: 2, personalRef: "mrodriguez@ees7.edu.ar", cicloLectivoId: 3, fecha: "2026-08-05", hora: "08:30", cupo: 15 },
  { materiaId: 10, personalRef: "adiaz@ees7.edu.ar", cicloLectivoId: 3, fecha: "2026-08-10", hora: "09:00", cupo: 10 },
  { materiaId: 5, personalRef: "lfernandez@ees7.edu.ar", cicloLectivoId: 3, fecha: "2026-08-12", hora: "11:00", cupo: 12 },
];

const periodosCarga: Omit<PeriodoCarga, "id">[] = [
  { descripcion: "1er Cuatrimestre", tipo: "Valorativa", cicloLectivoId: 3, fechaIni: "2026-05-01", fechaFin: "2026-07-10" },
  { descripcion: "2do Cuatrimestre", tipo: "Numerica", cicloLectivoId: 3, fechaIni: "2026-07-27", fechaFin: "2026-08-04" },
  { descripcion: "1er Bimestre", tipo: "Valorativa", cicloLectivoId: 3, fechaIni: "2026-03-02", fechaFin: "2026-04-30" },
  { descripcion: "2do Bimestre", tipo: "Valorativa", cicloLectivoId: 3, fechaIni: "2026-07-11", fechaFin: "2026-07-26" },
  { descripcion: "Intensificación de Agosto", tipo: "Valorativa", cicloLectivoId: 3, fechaIni: "2026-08-10", fechaFin: "2026-09-10" },
  { descripcion: "2do Cuatrimestre", tipo: "Numerica", cicloLectivoId: 2, fechaIni: "2025-07-28", fechaFin: "2025-12-05" },
  { descripcion: "1er Cuatrimestre", tipo: "Valorativa", cicloLectivoId: 2, fechaIni: "2025-05-01", fechaFin: "2025-07-11" },
  { descripcion: "1er Bimestre", tipo: "Valorativa", cicloLectivoId: 2, fechaIni: "2025-03-01", fechaFin: "2025-04-30" },
  { descripcion: "2do Bimestre", tipo: "Valorativa", cicloLectivoId: 2, fechaIni: "2025-07-12", fechaFin: "2025-07-25" },
  { descripcion: "2do Cuatrimestre", tipo: "Numerica", cicloLectivoId: 1, fechaIni: "2024-07-29", fechaFin: "2024-12-06" },
  { descripcion: "1er Cuatrimestre", tipo: "Valorativa", cicloLectivoId: 1, fechaIni: "2024-05-01", fechaFin: "2024-07-12" },
  { descripcion: "1er Bimestre", tipo: "Valorativa", cicloLectivoId: 1, fechaIni: "2024-03-01", fechaFin: "2024-04-30" },
  { descripcion: "2do Bimestre", tipo: "Valorativa", cicloLectivoId: 1, fechaIni: "2024-07-13", fechaFin: "2024-07-26" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Inserción
// Orden: primero las tablas independientes (padres), luego las dependientes
// (hijos), para no violar las Foreign Keys (error P2003).
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  // ── Tablas independientes (padres) ─────────────────────────────────────
  await prisma.aula.createMany({ data: aulas });
  await prisma.cicloLectivo.createMany({ data: ciclosLectivos });
  await prisma.orientacion.createMany({ data: orientaciones });
  await prisma.materia.createMany({ data: materias });
  await prisma.estudiante.createMany({ data: estudiantes });
  await prisma.personal.createMany({ data: personal });
  await prisma.permiso.createMany({ data: permisos });

  // ── Nivel 1 ───────────────────────────────────────────────────────────
  await prisma.curso.createMany({ data: cursos });

  // Rol: M-N con Permiso, conectando por Permiso.codigo (@unique).
  for (const rol of roles) {
    await prisma.rol.create({
      data: {
        nombre: rol.nombre,
        permisos: {
          connect: rol.permisosRef.map((codigo) => ({ codigo })),
        },
      },
    });
  }

  // Usuario: FK a Personal por email (@unique) + M-N con Rol por nombre (@unique).
  // La contrasenia se hashea con bcrypt: en la base nunca queda texto plano.
  for (const usuario of usuarios) {
    const contraseniaHasheada = await bcrypt.hash(usuario.contrasenia, env.BCRYPT_ROUNDS);
    await prisma.usuario.create({
      data: {
        activo: usuario.activo,
        contrasenia: contraseniaHasheada,
        personal: { connect: { email: usuario.personalRef } },
        roles: {
          connect: usuario.rolesRef.map((nombre) => ({ nombre })),
        },
      },
    });
  }

  // ── Nivel 2 ───────────────────────────────────────────────────────────
  await prisma.cursada.createMany({ data: cursadas });
  await prisma.periodoCarga.createMany({ data: periodosCarga });

  // MesasDeExamen: FK a Personal por email (@unique).
  for (const mesa of mesasDeExamen) {
    await prisma.mesasDeExamen.create({
      data: {
        fecha: mesa.fecha,
        hora: mesa.hora,
        cupo: mesa.cupo,
        materia: { connect: { id: mesa.materiaId } },
        cicloLectivo: { connect: { id: mesa.cicloLectivoId } },
        personal: { connect: { email: mesa.personalRef } },
      },
    });
  }

  await prisma.domicilio.createMany({ data: domicilios });
  await prisma.contactoEmergencia.createMany({ data: contactosEmergencia });
  await prisma.asistenciaInstitucional.createMany({ data: asistenciasInstitucionales });
  await prisma.matricula.createMany({ data: matriculas });

  // ── Nivel 3 ───────────────────────────────────────────────────────────
  // BloqueHorario depende de Cursada (FK opcional cursadaId).
  await prisma.bloqueHorario.createMany({ data: bloquesHorarios });
  await prisma.inscripcion.createMany({ data: inscripciones });
  await prisma.inscripcionMesa.createMany({ data: inscripcionesMesa });

  // ── Nivel 4 ───────────────────────────────────────────────────────────
  // AsignacionHoraria: FK a Personal por email, M-N con BloqueHorario y Curso
  // por id, y autorrelación (asignacionHorariaCubierta) resuelta por posición.
  const asignacionIdPorPosicion: number[] = [];
  for (let i = 0; i < asignacionesHorarias.length; i++) {
    const a = asignacionesHorarias[i];
    const creada = await prisma.asignacionHoraria.create({
      data: {
        tipoCargo: a.tipoCargo,
        situacionRevista: a.situacionRevista,
        fechaIni: a.fechaIni,
        fechaFin: a.fechaFin,
        personal: { connect: { email: a.personalRef } },
        bloquesHorarios: { connect: a.bloqueHorarioIds.map((id) => ({ id })) },
        ...(a.cursoIds && a.cursoIds.length > 0
          ? { cursos: { connect: a.cursoIds.map((id) => ({ id })) } }
          : {}),
        ...(a.materiaId ? { materia: { connect: { id: a.materiaId } } } : {}),
        ...(a.asignacionHorariaCubiertaId
          ? {
              asignacionHorariaCubierta: {
                connect: { id: asignacionIdPorPosicion[a.asignacionHorariaCubiertaId - 1] },
              },
            }
          : {}),
      },
    });
    asignacionIdPorPosicion[i] = creada.id;
  }

  // Cargas: dependen de Inscripcion y PeriodoCarga.
  if (cargasIntensificacion.length > 0) {
    await prisma.cargaIntensificacion.createMany({ data: cargasIntensificacion });
  }
  await prisma.cargaNumerica.createMany({ data: cargasNumericas });
  await prisma.cargaValorativa.createMany({ data: cargasValorativas });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
