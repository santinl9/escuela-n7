-- CreateEnum
CREATE TYPE "SituacionRevista" AS ENUM ('Titular', 'Provisional', 'Suplente', 'Titular Interino', 'Servicio Provisorio');

-- CreateEnum
CREATE TYPE "TipoCargo" AS ENUM ('Auxiliar', 'Directivo', 'EMATP', 'Preceptor', 'Profesor', 'Prosecretario', 'Secretario', 'Vicedirectivo');

-- CreateEnum
CREATE TYPE "TipoAsistencia" AS ENUM ('Asistencia Completa', 'Falta Completa', 'Media Falta');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado');

-- CreateEnum
CREATE TYPE "TipoCursada" AS ENUM ('Curricular', 'Extracurricular');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('Maniana', 'Tarde', 'Noche');

-- CreateEnum
CREATE TYPE "EstadoEstudiante" AS ENUM ('Regular', 'Libre', 'Desertor', 'Egresado');

-- CreateEnum
CREATE TYPE "TipoInscripcion" AS ENUM ('Normal', 'Recupera', 'Intensifica', 'Oyente');

-- CreateEnum
CREATE TYPE "EstadoInscripcion" AS ENUM ('Aprobada', 'Libre', 'Regular', 'Desaprobado', 'Discontinuo');

-- CreateEnum
CREATE TYPE "NotaValorativa" AS ENUM ('TEA', 'TEP', 'TED');

-- CreateEnum
CREATE TYPE "TipoCalificacion" AS ENUM ('Numerica', 'Valorativa', 'Intensificacion');

-- CreateTable
CREATE TABLE "AsignacionHoraria" (
    "id" SERIAL NOT NULL,
    "personalId" TEXT NOT NULL,
    "bloqueHorarioIds" INTEGER[],
    "tipoCargo" "TipoCargo" NOT NULL,
    "situacionRevista" "SituacionRevista" NOT NULL,
    "cursoIds" INTEGER[],
    "fechaIni" TEXT NOT NULL,
    "fechaFin" TEXT NOT NULL,
    "asignacionHorariaCubiertaId" INTEGER,

    CONSTRAINT "AsignacionHoraria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsistenciaInstitucional" (
    "id" SERIAL NOT NULL,
    "estudianteDni" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "tipo" "TipoAsistencia" NOT NULL,
    "justificada" BOOLEAN NOT NULL,

    CONSTRAINT "AsistenciaInstitucional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloqueHorario" (
    "id" SERIAL NOT NULL,
    "cursadaId" INTEGER,
    "dia" "DiaSemana" NOT NULL,
    "horaIni" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,

    CONSTRAINT "BloqueHorario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargaIntensificacion" (
    "id" SERIAL NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "periodoCargaId" INTEGER NOT NULL,
    "calificacionFinal" INTEGER NOT NULL,

    CONSTRAINT "CargaIntensificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargaNumerica" (
    "id" SERIAL NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "periodoCargaId" INTEGER NOT NULL,
    "calificacion" DOUBLE PRECISION,
    "inasistencias" INTEGER,

    CONSTRAINT "CargaNumerica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargaValorativa" (
    "id" SERIAL NOT NULL,
    "inscripcionId" INTEGER NOT NULL,
    "periodoCargaId" INTEGER NOT NULL,
    "calificacion" "NotaValorativa",
    "inasistencias" INTEGER,

    CONSTRAINT "CargaValorativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CicloLectivo" (
    "id" SERIAL NOT NULL,
    "fechaIni" TEXT NOT NULL,
    "fechaFin" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,

    CONSTRAINT "CicloLectivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactoEmergencia" (
    "id" SERIAL NOT NULL,
    "estudianteDni" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "apellido" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "dni" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" INTEGER NOT NULL,

    CONSTRAINT "ContactoEmergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cursada" (
    "id" SERIAL NOT NULL,
    "cantidadClases" INTEGER NOT NULL,
    "tipo" "TipoCursada" NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "aulaId" INTEGER NOT NULL,
    "cicloLectivoId" INTEGER NOT NULL,

    CONSTRAINT "Cursada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" SERIAL NOT NULL,
    "nivel" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "turno" "Turno" NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "orientacionId" INTEGER,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domicilio" (
    "id" SERIAL NOT NULL,
    "estudianteDni" INTEGER NOT NULL,
    "calle" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,

    CONSTRAINT "Domicilio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "id" SERIAL NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "apellido" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "dni" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" INTEGER NOT NULL,
    "folio" INTEGER NOT NULL,
    "libro" INTEGER NOT NULL,
    "estado" "EstadoEstudiante" NOT NULL,
    "fechaNacimiento" TEXT NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscripcion" (
    "id" SERIAL NOT NULL,
    "estudianteDni" INTEGER NOT NULL,
    "cursadaId" INTEGER NOT NULL,
    "tipo" "TipoInscripcion" NOT NULL,
    "cursadaIntensificacionId" INTEGER,
    "estado" "EstadoInscripcion" NOT NULL,
    "fecha" TEXT NOT NULL,
    "notaFinal" INTEGER,

    CONSTRAINT "Inscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscripcionMesa" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "estudianteDni" INTEGER NOT NULL,
    "fechaInscripcion" TEXT NOT NULL,
    "nota" INTEGER,
    "asistio" BOOLEAN NOT NULL,

    CONSTRAINT "InscripcionMesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "curricular" BOOLEAN NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matricula" (
    "id" SERIAL NOT NULL,
    "estudianteDni" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesasDeExamen" (
    "id" SERIAL NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "personalId" TEXT NOT NULL,
    "cicloLectivoId" INTEGER NOT NULL,
    "fecha" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "cupo" INTEGER NOT NULL,

    CONSTRAINT "MesasDeExamen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orientacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Orientacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodoCarga" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fechaIni" TEXT NOT NULL,
    "fechaFin" TEXT NOT NULL,
    "tipo" "TipoCalificacion" NOT NULL,
    "cicloLectivoId" INTEGER NOT NULL,

    CONSTRAINT "PeriodoCarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" SERIAL NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "apellido" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "dni" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" INTEGER NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personal" (
    "id" SERIAL NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "apellido" TEXT NOT NULL,
    "cuil" TEXT NOT NULL,
    "dni" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" INTEGER NOT NULL,
    "fechaIngreso" TEXT NOT NULL,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "permisos" TEXT[],

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "personalId" TEXT NOT NULL,
    "roles" TEXT[],
    "activo" BOOLEAN NOT NULL,
    "contrasenia" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);
