/*
  Warnings:

  - You are about to drop the column `bloqueHorarioIds` on the `AsignacionHoraria` table. All the data in the column will be lost.
  - You are about to drop the column `cursoIds` on the `AsignacionHoraria` table. All the data in the column will be lost.
  - You are about to drop the column `permisos` on the `Rol` table. All the data in the column will be lost.
  - You are about to drop the column `roles` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dni]` on the table `Estudiante` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[descripcion]` on the table `Permiso` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Personal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `Rol` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personalId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `personalId` on the `AsignacionHoraria` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `personalId` on the `MesasDeExamen` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `personalId` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AsignacionHoraria" DROP COLUMN "bloqueHorarioIds",
DROP COLUMN "cursoIds",
DROP COLUMN "personalId",
ADD COLUMN     "personalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "MesasDeExamen" DROP COLUMN "personalId",
ADD COLUMN     "personalId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Rol" DROP COLUMN "permisos";

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "roles",
DROP COLUMN "personalId",
ADD COLUMN     "personalId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_AsignacionBloque" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AsignacionBloque_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AsignacionCurso" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AsignacionCurso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RolPermiso" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RolPermiso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UsuarioRol" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UsuarioRol_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AsignacionBloque_B_index" ON "_AsignacionBloque"("B");

-- CreateIndex
CREATE INDEX "_AsignacionCurso_B_index" ON "_AsignacionCurso"("B");

-- CreateIndex
CREATE INDEX "_RolPermiso_B_index" ON "_RolPermiso"("B");

-- CreateIndex
CREATE INDEX "_UsuarioRol_B_index" ON "_UsuarioRol"("B");

-- CreateIndex
CREATE INDEX "AsignacionHoraria_personalId_idx" ON "AsignacionHoraria"("personalId");

-- CreateIndex
CREATE INDEX "AsignacionHoraria_asignacionHorariaCubiertaId_idx" ON "AsignacionHoraria"("asignacionHorariaCubiertaId");

-- CreateIndex
CREATE INDEX "AsistenciaInstitucional_estudianteDni_idx" ON "AsistenciaInstitucional"("estudianteDni");

-- CreateIndex
CREATE INDEX "BloqueHorario_cursadaId_idx" ON "BloqueHorario"("cursadaId");

-- CreateIndex
CREATE INDEX "CargaIntensificacion_inscripcionId_idx" ON "CargaIntensificacion"("inscripcionId");

-- CreateIndex
CREATE INDEX "CargaIntensificacion_periodoCargaId_idx" ON "CargaIntensificacion"("periodoCargaId");

-- CreateIndex
CREATE INDEX "CargaNumerica_inscripcionId_idx" ON "CargaNumerica"("inscripcionId");

-- CreateIndex
CREATE INDEX "CargaNumerica_periodoCargaId_idx" ON "CargaNumerica"("periodoCargaId");

-- CreateIndex
CREATE INDEX "CargaValorativa_inscripcionId_idx" ON "CargaValorativa"("inscripcionId");

-- CreateIndex
CREATE INDEX "CargaValorativa_periodoCargaId_idx" ON "CargaValorativa"("periodoCargaId");

-- CreateIndex
CREATE INDEX "ContactoEmergencia_estudianteDni_idx" ON "ContactoEmergencia"("estudianteDni");

-- CreateIndex
CREATE INDEX "Cursada_cursoId_idx" ON "Cursada"("cursoId");

-- CreateIndex
CREATE INDEX "Cursada_materiaId_idx" ON "Cursada"("materiaId");

-- CreateIndex
CREATE INDEX "Cursada_aulaId_idx" ON "Cursada"("aulaId");

-- CreateIndex
CREATE INDEX "Cursada_cicloLectivoId_idx" ON "Cursada"("cicloLectivoId");

-- CreateIndex
CREATE INDEX "Curso_orientacionId_idx" ON "Curso"("orientacionId");

-- CreateIndex
CREATE INDEX "Domicilio_estudianteDni_idx" ON "Domicilio"("estudianteDni");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_dni_key" ON "Estudiante"("dni");

-- CreateIndex
CREATE INDEX "Inscripcion_estudianteDni_idx" ON "Inscripcion"("estudianteDni");

-- CreateIndex
CREATE INDEX "Inscripcion_cursadaId_idx" ON "Inscripcion"("cursadaId");

-- CreateIndex
CREATE INDEX "Inscripcion_cursadaIntensificacionId_idx" ON "Inscripcion"("cursadaIntensificacionId");

-- CreateIndex
CREATE INDEX "InscripcionMesa_mesaId_idx" ON "InscripcionMesa"("mesaId");

-- CreateIndex
CREATE INDEX "InscripcionMesa_estudianteDni_idx" ON "InscripcionMesa"("estudianteDni");

-- CreateIndex
CREATE INDEX "Matricula_estudianteDni_idx" ON "Matricula"("estudianteDni");

-- CreateIndex
CREATE INDEX "Matricula_cursoId_idx" ON "Matricula"("cursoId");

-- CreateIndex
CREATE INDEX "MesasDeExamen_materiaId_idx" ON "MesasDeExamen"("materiaId");

-- CreateIndex
CREATE INDEX "MesasDeExamen_personalId_idx" ON "MesasDeExamen"("personalId");

-- CreateIndex
CREATE INDEX "MesasDeExamen_cicloLectivoId_idx" ON "MesasDeExamen"("cicloLectivoId");

-- CreateIndex
CREATE INDEX "PeriodoCarga_cicloLectivoId_idx" ON "PeriodoCarga"("cicloLectivoId");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_descripcion_key" ON "Permiso"("descripcion");

-- CreateIndex
CREATE UNIQUE INDEX "Personal_email_key" ON "Personal"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_personalId_key" ON "Usuario"("personalId");

-- AddForeignKey
ALTER TABLE "AsignacionHoraria" ADD CONSTRAINT "AsignacionHoraria_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsignacionHoraria" ADD CONSTRAINT "AsignacionHoraria_asignacionHorariaCubiertaId_fkey" FOREIGN KEY ("asignacionHorariaCubiertaId") REFERENCES "AsignacionHoraria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsistenciaInstitucional" ADD CONSTRAINT "AsistenciaInstitucional_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloqueHorario" ADD CONSTRAINT "BloqueHorario_cursadaId_fkey" FOREIGN KEY ("cursadaId") REFERENCES "Cursada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaIntensificacion" ADD CONSTRAINT "CargaIntensificacion_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaIntensificacion" ADD CONSTRAINT "CargaIntensificacion_periodoCargaId_fkey" FOREIGN KEY ("periodoCargaId") REFERENCES "PeriodoCarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaNumerica" ADD CONSTRAINT "CargaNumerica_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaNumerica" ADD CONSTRAINT "CargaNumerica_periodoCargaId_fkey" FOREIGN KEY ("periodoCargaId") REFERENCES "PeriodoCarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaValorativa" ADD CONSTRAINT "CargaValorativa_inscripcionId_fkey" FOREIGN KEY ("inscripcionId") REFERENCES "Inscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargaValorativa" ADD CONSTRAINT "CargaValorativa_periodoCargaId_fkey" FOREIGN KEY ("periodoCargaId") REFERENCES "PeriodoCarga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactoEmergencia" ADD CONSTRAINT "ContactoEmergencia_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursada" ADD CONSTRAINT "Cursada_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursada" ADD CONSTRAINT "Cursada_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursada" ADD CONSTRAINT "Cursada_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursada" ADD CONSTRAINT "Cursada_cicloLectivoId_fkey" FOREIGN KEY ("cicloLectivoId") REFERENCES "CicloLectivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_orientacionId_fkey" FOREIGN KEY ("orientacionId") REFERENCES "Orientacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domicilio" ADD CONSTRAINT "Domicilio_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_cursadaId_fkey" FOREIGN KEY ("cursadaId") REFERENCES "Cursada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_cursadaIntensificacionId_fkey" FOREIGN KEY ("cursadaIntensificacionId") REFERENCES "Cursada"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionMesa" ADD CONSTRAINT "InscripcionMesa_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "MesasDeExamen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionMesa" ADD CONSTRAINT "InscripcionMesa_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesasDeExamen" ADD CONSTRAINT "MesasDeExamen_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesasDeExamen" ADD CONSTRAINT "MesasDeExamen_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesasDeExamen" ADD CONSTRAINT "MesasDeExamen_cicloLectivoId_fkey" FOREIGN KEY ("cicloLectivoId") REFERENCES "CicloLectivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodoCarga" ADD CONSTRAINT "PeriodoCarga_cicloLectivoId_fkey" FOREIGN KEY ("cicloLectivoId") REFERENCES "CicloLectivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AsignacionBloque" ADD CONSTRAINT "_AsignacionBloque_A_fkey" FOREIGN KEY ("A") REFERENCES "AsignacionHoraria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AsignacionBloque" ADD CONSTRAINT "_AsignacionBloque_B_fkey" FOREIGN KEY ("B") REFERENCES "BloqueHorario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AsignacionCurso" ADD CONSTRAINT "_AsignacionCurso_A_fkey" FOREIGN KEY ("A") REFERENCES "AsignacionHoraria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AsignacionCurso" ADD CONSTRAINT "_AsignacionCurso_B_fkey" FOREIGN KEY ("B") REFERENCES "Curso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolPermiso" ADD CONSTRAINT "_RolPermiso_A_fkey" FOREIGN KEY ("A") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolPermiso" ADD CONSTRAINT "_RolPermiso_B_fkey" FOREIGN KEY ("B") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioRol" ADD CONSTRAINT "_UsuarioRol_A_fkey" FOREIGN KEY ("A") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UsuarioRol" ADD CONSTRAINT "_UsuarioRol_B_fkey" FOREIGN KEY ("B") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
