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
  { estudianteDni: 10000053, calle: "Calle 25", numero: 1520 },
  { estudianteDni: 10000054, calle: "Calle 44", numero: 2042 },
  { estudianteDni: 10000055, calle: "Calle 9", numero: 2466 },
  { estudianteDni: 10000056, calle: "Calle 7", numero: 1487 },
  { estudianteDni: 10000057, calle: "Diagonal 80", numero: 1721 },
  { estudianteDni: 10000058, calle: "Calle 50", numero: 1874 },
  { estudianteDni: 10000059, calle: "Calle 16", numero: 2099 },
  { estudianteDni: 10000060, calle: "Calle 48", numero: 1291 },
  { estudianteDni: 10000061, calle: "Av. 32", numero: 2304 },
  { estudianteDni: 10000062, calle: "Av. 13", numero: 1516 },
  { estudianteDni: 10000063, calle: "Calle 9", numero: 1066 },
  { estudianteDni: 10000064, calle: "Calle 1", numero: 2718 },
  { estudianteDni: 10000065, calle: "Av. 60", numero: 169 },
  { estudianteDni: 10000066, calle: "Av. 7", numero: 638 },
  { estudianteDni: 10000067, calle: "Calle 38", numero: 2771 },
  { estudianteDni: 10000068, calle: "Av. 7", numero: 157 },
  { estudianteDni: 10000069, calle: "Calle 38", numero: 479 },
  { estudianteDni: 10000070, calle: "Calle 50", numero: 767 },
  { estudianteDni: 10000071, calle: "Calle 7", numero: 1202 },
  { estudianteDni: 10000072, calle: "Calle 16", numero: 926 },
  { estudianteDni: 10000073, calle: "Diagonal 73", numero: 2239 },
  { estudianteDni: 10000074, calle: "Calle 66", numero: 702 },
  { estudianteDni: 10000075, calle: "Av. 60", numero: 2243 },
  { estudianteDni: 10000076, calle: "Calle 16", numero: 2204 },
  { estudianteDni: 10000077, calle: "Av. 13", numero: 1508 },
  { estudianteDni: 10000078, calle: "Calle 50", numero: 2053 },
  { estudianteDni: 10000079, calle: "Diagonal 80", numero: 2897 },
  { estudianteDni: 10000080, calle: "Calle 7", numero: 2196 },
  { estudianteDni: 10000081, calle: "Calle 25", numero: 914 },
  { estudianteDni: 10000082, calle: "Av. 44", numero: 250 },
  { estudianteDni: 10000083, calle: "Av. 122", numero: 401 },
  { estudianteDni: 10000084, calle: "Calle 16", numero: 2116 },
  { estudianteDni: 10000085, calle: "Calle 19", numero: 2022 },
  { estudianteDni: 10000086, calle: "Calle 9", numero: 922 },
  { estudianteDni: 10000087, calle: "Calle 16", numero: 1348 },
  { estudianteDni: 10000088, calle: "Calle 32", numero: 389 },
  { estudianteDni: 10000089, calle: "Calle 50", numero: 446 },
  { estudianteDni: 10000090, calle: "Av. 7", numero: 2135 },
  { estudianteDni: 10000091, calle: "Calle 50", numero: 2172 },
  { estudianteDni: 10000092, calle: "Calle 44", numero: 2705 },
  { estudianteDni: 10000093, calle: "Calle 1", numero: 1588 },
  { estudianteDni: 10000094, calle: "Calle 32", numero: 946 },
  { estudianteDni: 10000095, calle: "Calle 25", numero: 1015 },
  { estudianteDni: 10000096, calle: "Calle 9", numero: 2881 },
  { estudianteDni: 10000097, calle: "Av. 32", numero: 673 },
  { estudianteDni: 10000098, calle: "Calle 25", numero: 2216 },
  { estudianteDni: 10000099, calle: "Av. 32", numero: 1259 },
  { estudianteDni: 10000100, calle: "Calle 25", numero: 2442 },
  { estudianteDni: 10000101, calle: "Calle 66", numero: 1496 },
  { estudianteDni: 10000102, calle: "Calle 50", numero: 510 },
  { estudianteDni: 10000103, calle: "Calle 19", numero: 734 },
];

const contactosEmergencia: Omit<ContactoEmergencia, "id">[] = [
  { estudianteDni: 10000053, activo: true, nombre: "Florencia", apellido: "Giménez", dni: 10000000, cuil: "27-10000124-8", email: "test_user_1@example.com", telefono: "1111111111" },
  { estudianteDni: 10000053, activo: true, nombre: "Ricardo", apellido: "Ramos", dni: 10000001, cuil: "20-10000125-6", email: "test_user_2@example.com", telefono: "1111111111" },
  { estudianteDni: 10000054, activo: true, nombre: "Javier", apellido: "Vega", dni: 10000002, cuil: "20-10000126-0", email: "test_user_3@example.com", telefono: "1111111111" },
  { estudianteDni: 10000054, activo: true, nombre: "Silvia", apellido: "Montero", dni: 10000003, cuil: "27-10000127-1", email: "test_user_4@example.com", telefono: "1111111111" },
  { estudianteDni: 10000055, activo: true, nombre: "Diego", apellido: "Silva", dni: 10000004, cuil: "20-10000128-5", email: "test_user_5@example.com", telefono: "1111111111" },
  { estudianteDni: 10000056, activo: true, nombre: "Micaela", apellido: "Delgado", dni: 10000005, cuil: "27-10000129-1", email: "test_user_6@example.com", telefono: "1111111111" },
  { estudianteDni: 10000057, activo: true, nombre: "Tomás", apellido: "Rodríguez", dni: 10000006, cuil: "20-10000130-7", email: "test_user_7@example.com", telefono: "1111111111" },
  { estudianteDni: 10000058, activo: true, nombre: "Mariela", apellido: "Acosta", dni: 10000007, cuil: "27-10000131-3", email: "test_user_8@example.com", telefono: "1111111111" },
  { estudianteDni: 10000059, activo: true, nombre: "Javier", apellido: "Ruiz", dni: 10000008, cuil: "20-10000132-2", email: "test_user_9@example.com", telefono: "1111111111" },
  { estudianteDni: 10000060, activo: true, nombre: "Daniela", apellido: "Molina", dni: 10000009, cuil: "27-10000133-9", email: "test_user_10@example.com", telefono: "1111111111" },
  { estudianteDni: 10000061, activo: true, nombre: "Maximiliano", apellido: "Benítez", dni: 10000010, cuil: "20-10000134-5", email: "test_user_11@example.com", telefono: "1111111111" },
  { estudianteDni: 10000062, activo: true, nombre: "Federico", apellido: "Molina", dni: 10000011, cuil: "20-10000135-8", email: "test_user_12@example.com", telefono: "1111111111" },
  { estudianteDni: 10000063, activo: true, nombre: "Facundo", apellido: "Silva", dni: 10000012, cuil: "20-10000136-6", email: "test_user_13@example.com", telefono: "1111111111" },
  { estudianteDni: 10000064, activo: true, nombre: "Gonzalo", apellido: "Núñez", dni: 10000013, cuil: "20-10000137-0", email: "test_user_14@example.com", telefono: "1111111111" },
  { estudianteDni: 10000065, activo: true, nombre: "Federico", apellido: "López", dni: 10000014, cuil: "20-10000138-8", email: "test_user_15@example.com", telefono: "1111111111" },
  { estudianteDni: 10000066, activo: true, nombre: "Florencia", apellido: "Rodríguez", dni: 10000015, cuil: "27-10000139-7", email: "test_user_16@example.com", telefono: "1111111111" },
  { estudianteDni: 10000067, activo: true, nombre: "Rodrigo", apellido: "Torres", dni: 10000016, cuil: "20-10000140-0", email: "test_user_17@example.com", telefono: "1111111111" },
  { estudianteDni: 10000068, activo: true, nombre: "Ignacio", apellido: "Ibáñez", dni: 10000017, cuil: "20-10000141-9", email: "test_user_18@example.com", telefono: "1111111111" },
  { estudianteDni: 10000069, activo: true, nombre: "Aldana", apellido: "Vera", dni: 10000018, cuil: "27-10000142-8", email: "test_user_19@example.com", telefono: "1111111111" },
  { estudianteDni: 10000070, activo: true, nombre: "Emilio", apellido: "Delgado", dni: 10000019, cuil: "20-10000143-9", email: "test_user_20@example.com", telefono: "1111111111" },
  { estudianteDni: 10000071, activo: true, nombre: "Rodrigo", apellido: "Álvarez", dni: 10000020, cuil: "20-10000144-9", email: "test_user_21@example.com", telefono: "1111111111" },
  { estudianteDni: 10000072, activo: true, nombre: "Silvana", apellido: "Gómez", dni: 10000021, cuil: "27-10000145-8", email: "test_user_22@example.com", telefono: "1111111111" },
  { estudianteDni: 10000073, activo: true, nombre: "Florencia", apellido: "Paz", dni: 10000022, cuil: "27-10000146-0", email: "test_user_23@example.com", telefono: "1111111111" },
  { estudianteDni: 10000074, activo: true, nombre: "Ezequiel", apellido: "García", dni: 10000023, cuil: "20-10000147-5", email: "test_user_24@example.com", telefono: "1111111111" },
  { estudianteDni: 10000075, activo: true, nombre: "Romina", apellido: "Delgado", dni: 10000024, cuil: "27-10000148-1", email: "test_user_25@example.com", telefono: "1111111111" },
  { estudianteDni: 10000076, activo: true, nombre: "Romina", apellido: "González", dni: 10000025, cuil: "27-10000149-5", email: "test_user_26@example.com", telefono: "1111111111" },
  { estudianteDni: 10000077, activo: true, nombre: "Maximiliano", apellido: "Benítez", dni: 10000026, cuil: "20-10000150-6", email: "test_user_27@example.com", telefono: "1111111111" },
  { estudianteDni: 10000078, activo: true, nombre: "Emilio", apellido: "Vega", dni: 10000027, cuil: "20-10000151-2", email: "test_user_28@example.com", telefono: "1111111111" },
  { estudianteDni: 10000079, activo: true, nombre: "Valentina", apellido: "Silva", dni: 10000028, cuil: "27-10000152-6", email: "test_user_29@example.com", telefono: "1111111111" },
  { estudianteDni: 10000080, activo: true, nombre: "Aldana", apellido: "Ruiz", dni: 10000029, cuil: "27-10000153-0", email: "test_user_30@example.com", telefono: "1111111111" },
  { estudianteDni: 10000081, activo: true, nombre: "Romina", apellido: "Vera", dni: 10000030, cuil: "27-10000154-0", email: "test_user_31@example.com", telefono: "1111111111" },
  { estudianteDni: 10000082, activo: true, nombre: "Florencia", apellido: "Vega", dni: 10000031, cuil: "27-10000155-4", email: "test_user_32@example.com", telefono: "1111111111" },
  { estudianteDni: 10000083, activo: true, nombre: "Nicolás", apellido: "González", dni: 10000032, cuil: "20-10000156-8", email: "test_user_33@example.com", telefono: "1111111111" },
  { estudianteDni: 10000084, activo: true, nombre: "Javier", apellido: "Benítez", dni: 10000033, cuil: "20-10000157-3", email: "test_user_34@example.com", telefono: "1111111111" },
  { estudianteDni: 10000085, activo: true, nombre: "Maximiliano", apellido: "Chávez", dni: 10000034, cuil: "20-10000158-3", email: "test_user_35@example.com", telefono: "1111111111" },
  { estudianteDni: 10000086, activo: true, nombre: "Leandro", apellido: "Ramos", dni: 10000035, cuil: "20-10000159-2", email: "test_user_36@example.com", telefono: "1111111111" },
  { estudianteDni: 10000087, activo: true, nombre: "Camila", apellido: "Torres", dni: 10000036, cuil: "27-10000160-3", email: "test_user_37@example.com", telefono: "1111111111" },
  { estudianteDni: 10000088, activo: true, nombre: "Carolina", apellido: "Ríos", dni: 10000037, cuil: "27-10000161-3", email: "test_user_38@example.com", telefono: "1111111111" },
  { estudianteDni: 10000089, activo: true, nombre: "Santiago", apellido: "Ríos", dni: 10000038, cuil: "20-10000162-6", email: "test_user_39@example.com", telefono: "1111111111" },
  { estudianteDni: 10000090, activo: true, nombre: "Lucía", apellido: "González", dni: 10000039, cuil: "27-10000163-7", email: "test_user_40@example.com", telefono: "1111111111" },
  { estudianteDni: 10000091, activo: true, nombre: "Sebastián", apellido: "Ibáñez", dni: 10000040, cuil: "20-10000164-9", email: "test_user_41@example.com", telefono: "1111111111" },
  { estudianteDni: 10000092, activo: true, nombre: "Sofía", apellido: "Silva", dni: 10000041, cuil: "27-10000165-2", email: "test_user_42@example.com", telefono: "1111111111" },
  { estudianteDni: 10000093, activo: true, nombre: "Sofía", apellido: "Sánchez", dni: 10000042, cuil: "27-10000166-4", email: "test_user_43@example.com", telefono: "1111111111" },
  { estudianteDni: 10000094, activo: true, nombre: "Natalia", apellido: "Flores", dni: 10000043, cuil: "27-10000167-2", email: "test_user_44@example.com", telefono: "1111111111" },
  { estudianteDni: 10000095, activo: true, nombre: "Camila", apellido: "Suárez", dni: 10000044, cuil: "27-10000168-4", email: "test_user_45@example.com", telefono: "1111111111" },
  { estudianteDni: 10000096, activo: true, nombre: "Sebastián", apellido: "Morales", dni: 10000045, cuil: "20-10000169-4", email: "test_user_46@example.com", telefono: "1111111111" },
  { estudianteDni: 10000097, activo: true, nombre: "Luciano", apellido: "Cabrera", dni: 10000046, cuil: "20-10000170-6", email: "test_user_47@example.com", telefono: "1111111111" },
  { estudianteDni: 10000098, activo: true, nombre: "Gonzalo", apellido: "Silva", dni: 10000047, cuil: "20-10000171-9", email: "test_user_48@example.com", telefono: "1111111111" },
  { estudianteDni: 10000099, activo: true, nombre: "Martín", apellido: "García", dni: 10000048, cuil: "20-10000172-7", email: "test_user_49@example.com", telefono: "1111111111" },
  { estudianteDni: 10000100, activo: true, nombre: "Lucía", apellido: "Pérez", dni: 10000049, cuil: "27-10000173-4", email: "test_user_50@example.com", telefono: "1111111111" },
  { estudianteDni: 10000101, activo: true, nombre: "Natalia", apellido: "Mendoza", dni: 10000050, cuil: "27-10000174-3", email: "test_user_51@example.com", telefono: "1111111111" },
  { estudianteDni: 10000102, activo: true, nombre: "Leandro", apellido: "Delgado", dni: 10000051, cuil: "20-10000175-2", email: "test_user_52@example.com", telefono: "1111111111" },
  { estudianteDni: 10000103, activo: true, nombre: "Graciela", apellido: "Herrera", dni: 10000052, cuil: "27-10000176-3", email: "test_user_53@example.com", telefono: "1111111111" },
];

const estudiantes: Omit<Estudiante, "id">[] = [
  { activo: true, apellido: "Ramos", cuil: "27-10000177-7", dni: 10000053, email: "test_user_54@example.com", nombre: "Carolina", telefono: "1111111111", folio: 154, libro: 11, estado: "Regular", fechaNacimiento: "2004-02-18", nacionalidad: "Argentina", edad: 21 },
  { activo: true, apellido: "Vega", cuil: "20-10000178-4", dni: 10000054, email: "test_user_55@example.com", nombre: "Federico", telefono: "1111111111", folio: 340, libro: 3, estado: "Regular", fechaNacimiento: "2001-08-27", nacionalidad: "Uruguay", edad: 24 },
  { activo: true, apellido: "Silva", cuil: "20-10000179-8", dni: 10000055, email: "test_user_56@example.com", nombre: "Martín", telefono: "1111111111", folio: 233, libro: 2, estado: "Regular", fechaNacimiento: "2001-08-22", nacionalidad: "Chile", edad: 24 },
  { activo: true, apellido: "Delgado", cuil: "20-10000180-8", dni: 10000056, email: "test_user_57@example.com", nombre: "Lucía", telefono: "1111111111", folio: 63, libro: 19, estado: "Libre", fechaNacimiento: "2004-10-26", nacionalidad: "Chile", edad: 21 },
  { activo: true, apellido: "Rodríguez", cuil: "20-10000181-0", dni: 10000057, email: "test_user_58@example.com", nombre: "Sofía", telefono: "1111111111", folio: 121, libro: 3, estado: "Regular", fechaNacimiento: "1996-06-06", nacionalidad: "Argentina", edad: 29 },
  { activo: true, apellido: "Acosta", cuil: "20-10000182-0", dni: 10000058, email: "test_user_59@example.com", nombre: "Sebastián", telefono: "1111111111", folio: 332, libro: 6, estado: "Regular", fechaNacimiento: "1995-05-28", nacionalidad: "Argentina", edad: 30 },
  { activo: true, apellido: "Ruiz", cuil: "27-10000183-1", dni: 10000059, email: "test_user_60@example.com", nombre: "Tamara", telefono: "1111111111", folio: 51, libro: 8, estado: "Regular", fechaNacimiento: "1999-11-25", nacionalidad: "Uruguay", edad: 26 },
  { activo: true, apellido: "Molina", cuil: "27-10000184-5", dni: 10000060, email: "test_user_61@example.com", nombre: "Mariela", telefono: "1111111111", folio: 200, libro: 8, estado: "Regular", fechaNacimiento: "2005-12-13", nacionalidad: "Bolivia", edad: 20 },
  { activo: true, apellido: "Benítez", cuil: "27-10000185-9", dni: 10000061, email: "test_user_62@example.com", nombre: "Diego", telefono: "1111111111", folio: 369, libro: 2, estado: "Libre", fechaNacimiento: "1997-12-15", nacionalidad: "Argentina", edad: 28 },
  { activo: true, apellido: "Molina", cuil: "20-10000186-4", dni: 10000062, email: "test_user_63@example.com", nombre: "Tamara", telefono: "1111111111", folio: 390, libro: 18, estado: "Regular", fechaNacimiento: "2000-07-08", nacionalidad: "Paraguay", edad: 25 },
  { activo: true, apellido: "Silva", cuil: "27-10000187-9", dni: 10000063, email: "test_user_64@example.com", nombre: "Melina", telefono: "1111111111", folio: 247, libro: 11, estado: "Regular", fechaNacimiento: "2001-04-25", nacionalidad: "Argentina", edad: 24 },
  { activo: true, apellido: "Núñez", cuil: "20-10000188-0", dni: 10000064, email: "test_user_65@example.com", nombre: "Santiago", telefono: "1111111111", folio: 184, libro: 10, estado: "Regular", fechaNacimiento: "1998-12-01", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "López", cuil: "20-10000189-4", dni: 10000065, email: "test_user_66@example.com", nombre: "Ignacio", telefono: "1111111111", folio: 59, libro: 11, estado: "Regular", fechaNacimiento: "2000-07-03", nacionalidad: "Argentina", edad: 25 },
  { activo: true, apellido: "Rodríguez", cuil: "20-10000190-6", dni: 10000066, email: "test_user_67@example.com", nombre: "Agustina", telefono: "1111111111", folio: 227, libro: 11, estado: "Libre", fechaNacimiento: "1998-05-02", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "Torres", cuil: "27-10000191-7", dni: 10000067, email: "test_user_68@example.com", nombre: "Natalia", telefono: "1111111111", folio: 449, libro: 2, estado: "Regular", fechaNacimiento: "2004-12-19", nacionalidad: "Bolivia", edad: 21 },
  { activo: true, apellido: "Vega", cuil: "20-10000192-4", dni: 10000068, email: "test_user_69@example.com", nombre: "Micaela", telefono: "1111111111", folio: 163, libro: 2, estado: "Regular", fechaNacimiento: "1999-03-12", nacionalidad: "Argentina", edad: 26 },
  { activo: true, apellido: "Vera", cuil: "20-10000193-8", dni: 10000069, email: "test_user_70@example.com", nombre: "Santiago", telefono: "1111111111", folio: 493, libro: 7, estado: "Libre", fechaNacimiento: "2001-07-03", nacionalidad: "Bolivia", edad: 24 },
  { activo: true, apellido: "Delgado", cuil: "20-10000194-8", dni: 10000070, email: "test_user_71@example.com", nombre: "Micaela", telefono: "1111111111", folio: 434, libro: 15, estado: "Libre", fechaNacimiento: "2000-08-13", nacionalidad: "Argentina", edad: 25 },
  { activo: true, apellido: "Álvarez", cuil: "27-10000195-1", dni: 10000071, email: "test_user_72@example.com", nombre: "Verónica", telefono: "1111111111", folio: 262, libro: 3, estado: "Libre", fechaNacimiento: "2004-04-11", nacionalidad: "Argentina", edad: 21 },
  { activo: true, apellido: "Gómez", cuil: "20-10000196-0", dni: 10000072, email: "test_user_73@example.com", nombre: "Martín", telefono: "1111111111", folio: 436, libro: 18, estado: "Regular", fechaNacimiento: "2007-10-19", nacionalidad: "Bolivia", edad: 18 },
  { activo: true, apellido: "Paz", cuil: "20-10000197-2", dni: 10000073, email: "test_user_74@example.com", nombre: "Melina", telefono: "1111111111", folio: 267, libro: 14, estado: "Regular", fechaNacimiento: "2003-05-05", nacionalidad: "Bolivia", edad: 22 },
  { activo: true, apellido: "Sánchez", cuil: "20-10000198-6", dni: 10000074, email: "test_user_75@example.com", nombre: "Nicolás", telefono: "1111111111", folio: 110, libro: 16, estado: "Regular", fechaNacimiento: "1995-11-10", nacionalidad: "Uruguay", edad: 30 },
  { activo: true, apellido: "Paz", cuil: "27-10000199-3", dni: 10000075, email: "test_user_76@example.com", nombre: "Romina", telefono: "1111111111", folio: 335, libro: 3, estado: "Regular", fechaNacimiento: "1996-01-08", nacionalidad: "Perú", edad: 29 },
  { activo: true, apellido: "Cabrera", cuil: "20-10000200-2", dni: 10000076, email: "test_user_77@example.com", nombre: "Tomás", telefono: "1111111111", folio: 497, libro: 17, estado: "Regular", fechaNacimiento: "2007-05-19", nacionalidad: "Argentina", edad: 18 },
  { activo: true, apellido: "Benítez", cuil: "20-10000201-2", dni: 10000077, email: "test_user_78@example.com", nombre: "Romina", telefono: "1111111111", folio: 302, libro: 8, estado: "Libre", fechaNacimiento: "2001-11-20", nacionalidad: "Uruguay", edad: 24 },
  { activo: true, apellido: "Benítez", cuil: "20-10000202-6", dni: 10000078, email: "test_user_79@example.com", nombre: "Ramiro", telefono: "1111111111", folio: 12, libro: 17, estado: "Regular", fechaNacimiento: "2007-03-12", nacionalidad: "Chile", edad: 18 },
  { activo: true, apellido: "Silva", cuil: "20-10000203-0", dni: 10000079, email: "test_user_80@example.com", nombre: "Lucía", telefono: "1111111111", folio: 104, libro: 3, estado: "Libre", fechaNacimiento: "2007-11-01", nacionalidad: "Perú", edad: 18 },
  { activo: true, apellido: "Torres", cuil: "20-10000204-2", dni: 10000080, email: "test_user_81@example.com", nombre: "Martín", telefono: "1111111111", folio: 410, libro: 15, estado: "Regular", fechaNacimiento: "2007-07-13", nacionalidad: "Argentina", edad: 18 },
  { activo: true, apellido: "Vera", cuil: "27-10000205-3", dni: 10000081, email: "test_user_82@example.com", nombre: "Tamara", telefono: "1111111111", folio: 465, libro: 15, estado: "Regular", fechaNacimiento: "2006-03-26", nacionalidad: "Argentina", edad: 19 },
  { activo: true, apellido: "Reyes", cuil: "27-10000206-3", dni: 10000082, email: "test_user_83@example.com", nombre: "Daniela", telefono: "1111111111", folio: 341, libro: 8, estado: "Regular", fechaNacimiento: "2002-12-14", nacionalidad: "Argentina", edad: 23 },
  { activo: true, apellido: "González", cuil: "27-10000207-3", dni: 10000083, email: "test_user_84@example.com", nombre: "Romina", telefono: "1111111111", folio: 411, libro: 10, estado: "Regular", fechaNacimiento: "2002-12-06", nacionalidad: "Paraguay", edad: 23 },
  { activo: true, apellido: "Benítez", cuil: "20-10000208-6", dni: 10000084, email: "test_user_85@example.com", nombre: "Luciano", telefono: "1111111111", folio: 31, libro: 12, estado: "Libre", fechaNacimiento: "1999-10-11", nacionalidad: "Argentina", edad: 26 },
  { activo: true, apellido: "Reyes", cuil: "27-10000209-7", dni: 10000085, email: "test_user_86@example.com", nombre: "Ezequiel", telefono: "1111111111", folio: 352, libro: 3, estado: "Regular", fechaNacimiento: "1998-02-06", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "Gómez", cuil: "20-10000210-2", dni: 10000086, email: "test_user_87@example.com", nombre: "Facundo", telefono: "1111111111", folio: 464, libro: 16, estado: "Egresado", fechaNacimiento: "1998-06-13", nacionalidad: "Uruguay", edad: 27 },
  { activo: true, apellido: "Torres", cuil: "20-10000211-8", dni: 10000087, email: "test_user_68@example.com", nombre: "Natalia", telefono: "1111111111", folio: 69, libro: 15, estado: "Regular", fechaNacimiento: "2002-09-01", nacionalidad: "Perú", edad: 23 },
  { activo: true, apellido: "Castro", cuil: "27-10000212-1", dni: 10000088, email: "test_user_88@example.com", nombre: "Melina", telefono: "1111111111", folio: 197, libro: 6, estado: "Egresado", fechaNacimiento: "2002-06-18", nacionalidad: "Paraguay", edad: 23 },
  { activo: true, apellido: "Mendoza", cuil: "20-10000213-8", dni: 10000089, email: "test_user_89@example.com", nombre: "Ramiro", telefono: "1111111111", folio: 447, libro: 1, estado: "Libre", fechaNacimiento: "2006-09-03", nacionalidad: "Argentina", edad: 19 },
  { activo: true, apellido: "González", cuil: "27-10000214-1", dni: 10000090, email: "test_user_90@example.com", nombre: "Tamara", telefono: "1111111111", folio: 346, libro: 8, estado: "Libre", fechaNacimiento: "1998-05-09", nacionalidad: "Argentina", edad: 27 },
  { activo: true, apellido: "Ibáñez", cuil: "20-10000215-4", dni: 10000091, email: "test_user_91@example.com", nombre: "Verónica", telefono: "1111111111", folio: 258, libro: 3, estado: "Libre", fechaNacimiento: "2002-08-18", nacionalidad: "Argentina", edad: 23 },
  { activo: true, apellido: "López", cuil: "27-10000216-7", dni: 10000092, email: "test_user_92@example.com", nombre: "Nicolás", telefono: "1111111111", folio: 68, libro: 17, estado: "Regular", fechaNacimiento: "2003-11-20", nacionalidad: "Perú", edad: 22 },
  { activo: true, apellido: "Sánchez", cuil: "27-10000217-9", dni: 10000093, email: "test_user_93@example.com", nombre: "Aldana", telefono: "1111111111", folio: 389, libro: 8, estado: "Libre", fechaNacimiento: "1995-08-26", nacionalidad: "Paraguay", edad: 30 },
  { activo: true, apellido: "Flores", cuil: "20-10000218-4", dni: 10000094, email: "test_user_94@example.com", nombre: "Sofía", telefono: "1111111111", folio: 241, libro: 17, estado: "Regular", fechaNacimiento: "2002-05-26", nacionalidad: "Argentina", edad: 23 },
  { activo: true, apellido: "López", cuil: "20-10000219-6", dni: 10000095, email: "test_user_95@example.com", nombre: "Romina", telefono: "1111111111", folio: 119, libro: 15, estado: "Egresado", fechaNacimiento: "1996-04-26", nacionalidad: "Argentina", edad: 29 },
  { activo: true, apellido: "Morales", cuil: "20-10000220-6", dni: 10000096, email: "test_user_96@example.com", nombre: "Ezequiel", telefono: "1111111111", folio: 178, libro: 2, estado: "Libre", fechaNacimiento: "1997-11-06", nacionalidad: "Argentina", edad: 28 },
  { activo: true, apellido: "Giménez", cuil: "27-10000221-3", dni: 10000097, email: "test_user_97@example.com", nombre: "Aldana", telefono: "1111111111", folio: 79, libro: 19, estado: "Libre", fechaNacimiento: "1996-07-01", nacionalidad: "Perú", edad: 29 },
  { activo: true, apellido: "Silva", cuil: "20-10000222-8", dni: 10000098, email: "test_user_98@example.com", nombre: "Aldana", telefono: "1111111111", folio: 417, libro: 5, estado: "Regular", fechaNacimiento: "1997-12-24", nacionalidad: "Argentina", edad: 28 },
  { activo: true, apellido: "Reyes", cuil: "20-10000223-4", dni: 10000099, email: "test_user_99@example.com", nombre: "Matías", telefono: "1111111111", folio: 46, libro: 19, estado: "Libre", fechaNacimiento: "1995-12-06", nacionalidad: "Argentina", edad: 30 },
  { activo: true, apellido: "Pérez", cuil: "20-10000224-8", dni: 10000100, email: "test_user_100@example.com", nombre: "Ramiro", telefono: "1111111111", folio: 20, libro: 1, estado: "Regular", fechaNacimiento: "2001-06-21", nacionalidad: "Chile", edad: 24 },
  { activo: true, apellido: "Flores", cuil: "27-10000225-9", dni: 10000101, email: "test_user_101@example.com", nombre: "Javier", telefono: "1111111111", folio: 147, libro: 6, estado: "Regular", fechaNacimiento: "1996-11-04", nacionalidad: "Bolivia", edad: 29 },
  { activo: true, apellido: "Vargas", cuil: "27-10000226-5", dni: 10000102, email: "test_user_102@example.com", nombre: "Daniela", telefono: "1111111111", folio: 359, libro: 19, estado: "Regular", fechaNacimiento: "2002-06-15", nacionalidad: "Argentina", edad: 23 },
  { activo: false, apellido: "Herrera", cuil: "20-10000227-5", dni: 10000103, email: "test_user_103@example.com", nombre: "Pablo", telefono: "1111111111", folio: 88, libro: 7, estado: "Desertor", fechaNacimiento: "2004-05-15", nacionalidad: "Argentina", edad: 22 },
];

const personal: Omit<Personal, "id">[] = [
  { activo: true, apellido: "Díaz", cuil: "20-10000228-6", dni: 10000104, email: "test_user_104@example.com", nombre: "Ana", telefono: "1111111111", fechaIngreso: "2015-03-01" },
  { activo: true, apellido: "Gómez", cuil: "27-10000229-9", dni: 10000105, email: "test_user_105@example.com", nombre: "Carlos", telefono: "1111111111", fechaIngreso: "2017-08-15" },
  { activo: true, apellido: "Rodríguez", cuil: "20-10000230-4", dni: 10000106, email: "test_user_106@example.com", nombre: "María", telefono: "1111111111", fechaIngreso: "2010-02-10" },
  { activo: true, apellido: "Fernández", cuil: "27-10000231-3", dni: 10000107, email: "test_user_107@example.com", nombre: "Luis", telefono: "1111111111", fechaIngreso: "2019-04-22" },
  { activo: true, apellido: "Sosa", cuil: "27-10000232-3", dni: 10000108, email: "test_user_108@example.com", nombre: "Valeria", telefono: "1111111111", fechaIngreso: "2021-06-01" },
  { activo: true, apellido: "Álvarez", cuil: "20-10000233-5", dni: 10000109, email: "test_user_109@example.com", nombre: "Roberto", telefono: "1111111111", fechaIngreso: "2018-03-05" },
  { activo: true, apellido: "Torres", cuil: "27-10000234-2", dni: 10000110, email: "test_user_110@example.com", nombre: "Marina", telefono: "1111111111", fechaIngreso: "2020-08-10" },
  { activo: true, apellido: "Ríos", cuil: "20-10000235-7", dni: 10000111, email: "test_user_111@example.com", nombre: "Diego", telefono: "1111111111", fechaIngreso: "2023-02-20" },
  { activo: true, apellido: "Núñez", cuil: "27-10000236-8", dni: 10000112, email: "test_user_112@example.com", nombre: "Patricia", telefono: "1111111111", fechaIngreso: "2016-05-12" },
  { activo: true, apellido: "Medina", cuil: "20-10000237-9", dni: 10000113, email: "test_user_113@example.com", nombre: "Jorge", telefono: "1111111111", fechaIngreso: "2012-11-03" },
  { activo: true, apellido: "Paz", cuil: "27-10000238-1", dni: 10000114, email: "test_user_114@example.com", nombre: "Silvina", telefono: "1111111111", fechaIngreso: "2021-09-01" },
  { activo: false, apellido: "Ibáñez", cuil: "20-10000239-3", dni: 10000115, email: "test_user_115@example.com", nombre: "Fernando", telefono: "1111111111", fechaIngreso: "2011-04-18" },
  { activo: true, apellido: "Acosta", cuil: "27-10000240-5", dni: 10000116, email: "test_user_116@example.com", nombre: "Lucía", telefono: "1111111111", fechaIngreso: "2026-03-02" },
  { activo: true, apellido: "Molina", cuil: "20-10000241-1", dni: 10000117, email: "test_user_117@example.com", nombre: "Gustavo", telefono: "1111111111", fechaIngreso: "2020-03-01" },
  { activo: true, apellido: "Benítez", cuil: "27-10000242-2", dni: 10000118, email: "test_user_118@example.com", nombre: "Camila", telefono: "1111111111", fechaIngreso: "2026-06-20" },
  { activo: true, apellido: "Castro", cuil: "20-10000243-0", dni: 10000119, email: "test_user_119@example.com", nombre: "Hugo", telefono: "1111111111", fechaIngreso: "2019-03-01" },
  { activo: true, apellido: "Vega", cuil: "27-10000244-8", dni: 10000120, email: "test_user_120@example.com", nombre: "Natalia", telefono: "1111111111", fechaIngreso: "2024-02-01" },
  { activo: true, apellido: "Herrera", cuil: "20-10000245-7", dni: 10000121, email: "test_user_121@example.com", nombre: "Julián", telefono: "1111111111", fechaIngreso: "2022-03-01" },
  // Cubre el rol Directivo, que no tenia ningun usuario asociado.
  { activo: true, apellido: "Quiroga", cuil: "27-10000246-3", dni: 10000122, email: "test_user_122@example.com", nombre: "Silvia", telefono: "1111111111", fechaIngreso: "2016-03-01" },
  // Personal SIN Usuario a proposito: es el fixture del 201 de POST /api/auth/register.
  { activo: true, apellido: "Ledesma", cuil: "20-10000247-4", dni: 10000123, email: "test_user_123@example.com", nombre: "Tomás", telefono: "1111111111", fechaIngreso: "2026-03-01" },
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
  { personalRef: "test_user_104@example.com", rolesRef: ["Administrador"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_105@example.com", rolesRef: ["Preceptor"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_106@example.com", rolesRef: ["Secretario", "Vicedirectivo"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_107@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_108@example.com", rolesRef: ["Preceptor"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_109@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_110@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_111@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_112@example.com", rolesRef: ["EMATP"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_113@example.com", rolesRef: ["Prosecretario"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_114@example.com", rolesRef: ["Docente", "Preceptor"], activo: true, contrasenia: "generic_pass_2026" },
  // Unico usuario inactivo: es el fixture del 401 "El usuario esta inactivo".
  { personalRef: "test_user_115@example.com", rolesRef: ["Docente"], activo: false, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_116@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_117@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_118@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_119@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_120@example.com", rolesRef: ["Preceptor"], activo: true, contrasenia: "generic_pass_2026" },
  { personalRef: "test_user_121@example.com", rolesRef: ["Docente"], activo: true, contrasenia: "generic_pass_2026" },
  // Cubre el rol Directivo, que antes no tenia ningun usuario.
  { personalRef: "test_user_122@example.com", rolesRef: ["Directivo"], activo: true, contrasenia: "generic_pass_2026" },
];

// personalRef => Personal.email (@unique)
// bloqueHorarioIds / cursoIds => id autoincremental (BloqueHorario y Curso ya insertados)
// asignacionHorariaCubiertaId => posición (1-based) en este mismo array (autorrelación)
const asignacionesHorarias: AsignacionSeed[] = [
  { personalRef: "test_user_107@example.com", bloqueHorarioIds: [1], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2019-04-22", fechaFin: "", cursoIds: [1], materiaId: 1 },
  { personalRef: "test_user_109@example.com", bloqueHorarioIds: [3], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2018-03-05", fechaFin: "", cursoIds: [1], materiaId: 2 },
  { personalRef: "test_user_110@example.com", bloqueHorarioIds: [4], tipoCargo: "Profesor", situacionRevista: "Provisional", fechaIni: "2020-08-10", fechaFin: "", cursoIds: [1], materiaId: 3 },
  { personalRef: "test_user_114@example.com", bloqueHorarioIds: [5], tipoCargo: "Profesor", situacionRevista: "TitularInterino", fechaIni: "2021-09-01", fechaFin: "", cursoIds: [2], materiaId: 2 },
  { personalRef: "test_user_104@example.com", bloqueHorarioIds: [7, 17, 18, 19, 20], tipoCargo: "Directivo", situacionRevista: "Titular", fechaIni: "2015-03-01", fechaFin: "" },
  { personalRef: "test_user_105@example.com", bloqueHorarioIds: [8], tipoCargo: "Preceptor", situacionRevista: "Titular", fechaIni: "2017-08-15", fechaFin: "", cursoIds: [1] },
  { personalRef: "test_user_106@example.com", bloqueHorarioIds: [9], tipoCargo: "Secretario", situacionRevista: "Titular", fechaIni: "2010-02-10", fechaFin: "" },
  { personalRef: "test_user_106@example.com", bloqueHorarioIds: [10], tipoCargo: "Vicedirectivo", situacionRevista: "Suplente", fechaIni: "2022-03-01", fechaFin: "" },
  { personalRef: "test_user_108@example.com", bloqueHorarioIds: [11], tipoCargo: "Preceptor", situacionRevista: "Provisional", fechaIni: "2021-06-01", fechaFin: "", cursoIds: [3] },
  { personalRef: "test_user_111@example.com", bloqueHorarioIds: [12], tipoCargo: "Profesor", situacionRevista: "Suplente", fechaIni: "2023-02-20", fechaFin: "", cursoIds: [3], materiaId: 4 },
  { personalRef: "test_user_112@example.com", bloqueHorarioIds: [13], tipoCargo: "EMATP", situacionRevista: "Titular", fechaIni: "2016-05-12", fechaFin: "" },
  { personalRef: "test_user_113@example.com", bloqueHorarioIds: [14], tipoCargo: "Prosecretario", situacionRevista: "Titular", fechaIni: "2012-11-03", fechaFin: "" },
  { personalRef: "test_user_114@example.com", bloqueHorarioIds: [15], tipoCargo: "Preceptor", situacionRevista: "Suplente", fechaIni: "2023-03-01", fechaFin: "", cursoIds: [2] },
  { personalRef: "test_user_115@example.com", bloqueHorarioIds: [16], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2011-04-18", fechaFin: "", cursoIds: [3], materiaId: 5 },
  { personalRef: "test_user_111@example.com", bloqueHorarioIds: [1], tipoCargo: "Profesor", situacionRevista: "Suplente", fechaIni: "2026-06-15", fechaFin: "2026-07-15", asignacionHorariaCubiertaId: 1, cursoIds: [1], materiaId: 1 },
  { personalRef: "test_user_116@example.com", bloqueHorarioIds: [21], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2026-03-02", fechaFin: "", cursoIds: [5], materiaId: 7 },
  { personalRef: "test_user_117@example.com", bloqueHorarioIds: [23], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2020-03-01", fechaFin: "", cursoIds: [6], materiaId: 10 },
  { personalRef: "test_user_118@example.com", bloqueHorarioIds: [23], tipoCargo: "Profesor", situacionRevista: "Suplente", fechaIni: "2026-06-20", fechaFin: "2026-08-20", asignacionHorariaCubiertaId: 17, cursoIds: [6], materiaId: 10 },
  { personalRef: "test_user_119@example.com", bloqueHorarioIds: [24], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2019-03-01", fechaFin: "", cursoIds: [7], materiaId: 11 },
  { personalRef: "test_user_120@example.com", bloqueHorarioIds: [26, 27], tipoCargo: "Preceptor", situacionRevista: "Titular", fechaIni: "2024-02-01", fechaFin: "", cursoIds: [4, 6] },
  { personalRef: "test_user_121@example.com", bloqueHorarioIds: [25], tipoCargo: "Profesor", situacionRevista: "Titular", fechaIni: "2022-03-01", fechaFin: "", cursoIds: [8], materiaId: 12 },
];

const asistenciasInstitucionales: Omit<AsistenciaInstitucional, "id">[] = [
  { estudianteDni: 10000053, fecha: "2026-03-18", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000054, fecha: "2026-03-20", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000054, fecha: "2026-04-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000057, fecha: "2026-03-12", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000057, fecha: "2026-03-26", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000057, fecha: "2026-04-09", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000057, fecha: "2026-04-16", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000058, fecha: "2026-03-25", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000060, fecha: "2026-03-13", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000060, fecha: "2026-04-03", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000063, fecha: "2026-03-05", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000063, fecha: "2026-03-19", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000063, fecha: "2026-04-02", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000063, fecha: "2026-04-09", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000063, fecha: "2026-04-23", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000064, fecha: "2026-03-06", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000064, fecha: "2026-03-27", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000064, fecha: "2026-04-17", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000065, fecha: "2026-04-08", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000067, fecha: "2026-03-11", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000067, fecha: "2026-04-08", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000073, fecha: "2026-04-14", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000075, fecha: "2026-03-24", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000075, fecha: "2026-04-21", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000072, fecha: "2026-03-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000072, fecha: "2026-03-24", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000072, fecha: "2026-04-07", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000072, fecha: "2026-04-14", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000072, fecha: "2026-04-28", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000078, fecha: "2026-03-17", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000078, fecha: "2026-04-01", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000078, fecha: "2026-04-15", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000078, fecha: "2026-04-22", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000053, fecha: "2026-03-05", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 10000055, fecha: "2026-03-10", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 10000059, fecha: "2026-04-08", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 10000054, fecha: "2026-05-15", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000058, fecha: "2026-05-22", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000058, fecha: "2026-06-05", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000065, fecha: "2026-06-12", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000075, fecha: "2026-05-08", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000075, fecha: "2026-06-12", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000075, fecha: "2026-06-26", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000053, fecha: "2026-05-05", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 10000076, fecha: "2026-05-09", tipo: "AsistenciaCompleta", justificada: false },
  { estudianteDni: 10000071, fecha: "2025-03-06", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000071, fecha: "2025-03-13", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000071, fecha: "2025-03-20", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000071, fecha: "2025-03-27", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000071, fecha: "2025-04-03", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000071, fecha: "2025-04-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000071, fecha: "2025-04-24", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000077, fecha: "2025-03-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000077, fecha: "2025-04-07", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000077, fecha: "2025-04-21", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000077, fecha: "2025-04-28", tipo: "FaltaCompleta", justificada: true },
  { estudianteDni: 10000077, fecha: "2025-03-25", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000086, fecha: "2024-09-10", tipo: "FaltaCompleta", justificada: false },
  { estudianteDni: 10000086, fecha: "2024-10-14", tipo: "MediaFalta", justificada: false },
  { estudianteDni: 10000088, fecha: "2024-08-22", tipo: "FaltaCompleta", justificada: true },
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
  { estudianteDni: 10000053, cursadaId: 1, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-10", notaFinal: 8 },
  { estudianteDni: 10000053, cursadaId: 2, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-10", notaFinal: null },
  { estudianteDni: 10000055, cursadaId: 2, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-11", notaFinal: null },
  { estudianteDni: 10000057, cursadaId: 3, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-11", notaFinal: null },
  { estudianteDni: 10000058, cursadaId: 5, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-12", notaFinal: null },
  { estudianteDni: 10000059, cursadaId: 22, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-12", notaFinal: null },
  { estudianteDni: 10000060, cursadaId: 6, tipo: "Oyente", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-13", notaFinal: null },
  { estudianteDni: 10000062, cursadaId: 7, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-14", notaFinal: null },
  { estudianteDni: 10000063, cursadaId: 8, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-14", notaFinal: null },
  { estudianteDni: 10000064, cursadaId: 23, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-15", notaFinal: null },
  { estudianteDni: 10000065, cursadaId: 9, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-15", notaFinal: null },
  { estudianteDni: 10000067, cursadaId: 24, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-16", notaFinal: null },
  { estudianteDni: 10000068, cursadaId: 25, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-16", notaFinal: null },
  { estudianteDni: 10000072, cursadaId: 10, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-17", notaFinal: null },
  { estudianteDni: 10000073, cursadaId: 11, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-17", notaFinal: null },
  { estudianteDni: 10000074, cursadaId: 26, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-18", notaFinal: null },
  { estudianteDni: 10000075, cursadaId: 12, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-18", notaFinal: null },
  { estudianteDni: 10000076, cursadaId: 13, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-19", notaFinal: null },
  { estudianteDni: 10000078, cursadaId: 14, tipo: "Normal", cursadaIntensificacionId: null, estado: "Regular", fecha: "2026-03-19", notaFinal: null },
  { estudianteDni: 10000069, cursadaId: 15, tipo: "Normal", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2024-11-20", notaFinal: 7 },
  { estudianteDni: 10000070, cursadaId: 16, tipo: "Normal", cursadaIntensificacionId: null, estado: "Desaprobado", fecha: "2024-11-22", notaFinal: 3 },
  { estudianteDni: 10000071, cursadaId: 17, tipo: "Normal", cursadaIntensificacionId: null, estado: "Libre", fecha: "2025-06-10", notaFinal: null },
  { estudianteDni: 10000077, cursadaId: 19, tipo: "Oyente", cursadaIntensificacionId: null, estado: "Discontinuo", fecha: "2025-05-05", notaFinal: null },
  { estudianteDni: 10000079, cursadaId: 20, tipo: "Normal", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2024-11-25", notaFinal: 8 },
  { estudianteDni: 10000084, cursadaId: 21, tipo: "Recupera", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2025-11-10", notaFinal: 6 },
  { estudianteDni: 10000089, cursadaId: 4, tipo: "Normal", cursadaIntensificacionId: null, estado: "Aprobada", fecha: "2025-11-01", notaFinal: 9 },
  { estudianteDni: 10000054, cursadaId: 1, tipo: "Intensifica", cursadaIntensificacionId: 1, estado: "Regular", fecha: "2026-08-10", notaFinal: null },
  { estudianteDni: 10000077, cursadaId: 1, tipo: "Intensifica", cursadaIntensificacionId: 1, estado: "Regular", fecha: "2026-08-10", notaFinal: null },
];

const inscripcionesMesa: Omit<InscripcionMesa, "id">[] = [
  { mesaId: 1, estudianteDni: 10000086, fechaInscripcion: "2026-06-20", nota: 8, asistio: true },
  { mesaId: 1, estudianteDni: 10000088, fechaInscripcion: "2026-06-21", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 10000095, fechaInscripcion: "2026-06-22", nota: 6, asistio: true },
  { mesaId: 1, estudianteDni: 10000069, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000071, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000070, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000056, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000061, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000096, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000084, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000089, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 1, estudianteDni: 10000090, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 10000066, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 10000091, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 10000093, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 10000079, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 2, estudianteDni: 10000099, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 10000097, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 10000077, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 10000092, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 10000086, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 10000088, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 3, estudianteDni: 10000095, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 10000090, fechaInscripcion: "2026-07-01", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 10000099, fechaInscripcion: "2026-07-02", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 10000091, fechaInscripcion: "2026-07-03", nota: null, asistio: false },
  { mesaId: 4, estudianteDni: 10000066, fechaInscripcion: "2026-07-04", nota: null, asistio: false },
  { mesaId: 5, estudianteDni: 10000086, fechaInscripcion: "2025-10-20", nota: 7, asistio: true },
  { mesaId: 5, estudianteDni: 10000088, fechaInscripcion: "2025-10-21", nota: 5, asistio: true },
  { mesaId: 5, estudianteDni: 10000095, fechaInscripcion: "2025-10-22", nota: 9, asistio: true },
  { mesaId: 5, estudianteDni: 10000069, fechaInscripcion: "2025-10-23", nota: 2, asistio: true },
  { mesaId: 5, estudianteDni: 10000071, fechaInscripcion: "2025-10-24", nota: null, asistio: false },
  { mesaId: 5, estudianteDni: 10000084, fechaInscripcion: "2025-10-25", nota: 4, asistio: true },
  { mesaId: 6, estudianteDni: 10000086, fechaInscripcion: "2025-10-25", nota: 6, asistio: true },
  { mesaId: 6, estudianteDni: 10000095, fechaInscripcion: "2025-10-26", nota: 8, asistio: true },
  { mesaId: 6, estudianteDni: 10000056, fechaInscripcion: "2025-10-27", nota: 3, asistio: true },
  { mesaId: 6, estudianteDni: 10000079, fechaInscripcion: "2025-10-28", nota: null, asistio: false },
  { mesaId: 7, estudianteDni: 10000088, fechaInscripcion: "2025-07-01", nota: 5, asistio: true },
  { mesaId: 7, estudianteDni: 10000086, fechaInscripcion: "2025-07-02", nota: 9, asistio: true },
  { mesaId: 7, estudianteDni: 10000097, fechaInscripcion: "2025-07-03", nota: 1, asistio: true },
  { mesaId: 8, estudianteDni: 10000056, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 8, estudianteDni: 10000066, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 8, estudianteDni: 10000070, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 8, estudianteDni: 10000079, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 9, estudianteDni: 10000095, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 9, estudianteDni: 10000086, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 10, estudianteDni: 10000090, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
  { mesaId: 10, estudianteDni: 10000097, fechaInscripcion: "2026-07-05", nota: null, asistio: false },
];

const matriculas: Omit<Matricula, "id">[] = [
  { estudianteDni: 10000054, cursoId: 1, fecha: "2026-03-10" },
  { estudianteDni: 10000070, cursoId: 1, fecha: "2024-11-22" },
  { estudianteDni: 10000084, cursoId: 3, fecha: "2025-11-10" },
  { estudianteDni: 10000063, cursoId: 3, fecha: "2026-03-14" },
  { estudianteDni: 10000089, cursoId: 2, fecha: "2025-11-01" },
  { estudianteDni: 10000053, cursoId: 1, fecha: "2026-03-10" },
  { estudianteDni: 10000059, cursoId: 2, fecha: "2026-03-12" },
  { estudianteDni: 10000077, cursoId: 2, fecha: "2025-05-05" },
  { estudianteDni: 10000078, cursoId: 8, fecha: "2026-03-19" },
  { estudianteDni: 10000071, cursoId: 1, fecha: "2025-06-10" },
  { estudianteDni: 10000062, cursoId: 3, fecha: "2026-03-14" },
  { estudianteDni: 10000060, cursoId: 2, fecha: "2026-03-13" },
  { estudianteDni: 10000075, cursoId: 6, fecha: "2026-03-18" },
  { estudianteDni: 10000074, cursoId: 5, fecha: "2026-03-18" },
  { estudianteDni: 10000065, cursoId: 4, fecha: "2026-03-15" },
  { estudianteDni: 10000057, cursoId: 1, fecha: "2026-03-11" },
  { estudianteDni: 10000067, cursoId: 4, fecha: "2026-03-16" },
  { estudianteDni: 10000058, cursoId: 2, fecha: "2026-03-12" },
  { estudianteDni: 10000068, cursoId: 4, fecha: "2026-03-16" },
  { estudianteDni: 10000069, cursoId: 1, fecha: "2024-11-20" },
  { estudianteDni: 10000072, cursoId: 5, fecha: "2026-03-17" },
  { estudianteDni: 10000076, cursoId: 7, fecha: "2026-03-19" },
  { estudianteDni: 10000079, cursoId: 3, fecha: "2024-11-25" },
  { estudianteDni: 10000073, cursoId: 5, fecha: "2026-03-17" },
  { estudianteDni: 10000055, cursoId: 1, fecha: "2026-03-11" },
  { estudianteDni: 10000064, cursoId: 3, fecha: "2026-03-15" },
];

// personalRef => Personal.email (@unique)
const mesasDeExamen: MesaSeed[] = [
  { materiaId: 1, personalRef: "test_user_104@example.com", cicloLectivoId: 3, fecha: "2026-07-15", hora: "09:00", cupo: 15 },
  { materiaId: 6, personalRef: "test_user_109@example.com", cicloLectivoId: 3, fecha: "2026-07-16", hora: "10:30", cupo: 10 },
  { materiaId: 9, personalRef: "test_user_112@example.com", cicloLectivoId: 3, fecha: "2026-07-17", hora: "14:00", cupo: 12 },
  { materiaId: 11, personalRef: "test_user_114@example.com", cicloLectivoId: 3, fecha: "2026-07-20", hora: "08:30", cupo: 8 },
  { materiaId: 4, personalRef: "test_user_107@example.com", cicloLectivoId: 2, fecha: "2025-11-10", hora: "09:30", cupo: 10 },
  { materiaId: 3, personalRef: "test_user_109@example.com", cicloLectivoId: 2, fecha: "2025-11-15", hora: "09:00", cupo: 10 },
  { materiaId: 7, personalRef: "test_user_110@example.com", cicloLectivoId: 2, fecha: "2025-07-12", hora: "10:00", cupo: 8 },
  { materiaId: 2, personalRef: "test_user_106@example.com", cicloLectivoId: 3, fecha: "2026-08-05", hora: "08:30", cupo: 15 },
  { materiaId: 10, personalRef: "test_user_104@example.com", cicloLectivoId: 3, fecha: "2026-08-10", hora: "09:00", cupo: 10 },
  { materiaId: 5, personalRef: "test_user_107@example.com", cicloLectivoId: 3, fecha: "2026-08-12", hora: "11:00", cupo: 12 },
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
