-- DropForeignKey
ALTER TABLE "AsistenciaInstitucional" DROP CONSTRAINT "AsistenciaInstitucional_estudianteDni_fkey";

-- DropForeignKey
ALTER TABLE "Inscripcion" DROP CONSTRAINT "Inscripcion_estudianteDni_fkey";

-- DropForeignKey
ALTER TABLE "InscripcionMesa" DROP CONSTRAINT "InscripcionMesa_estudianteDni_fkey";

-- DropForeignKey
ALTER TABLE "Matricula" DROP CONSTRAINT "Matricula_estudianteDni_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_personalId_fkey";

-- AlterTable
ALTER TABLE "AsignacionHoraria" ADD COLUMN     "materiaId" INTEGER;

-- AlterTable
ALTER TABLE "Orientacion" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Permiso" ADD COLUMN     "codigo" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AsignacionHoraria_materiaId_idx" ON "AsignacionHoraria"("materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_codigo_key" ON "Permiso"("codigo");

-- AddForeignKey
ALTER TABLE "AsignacionHoraria" ADD CONSTRAINT "AsignacionHoraria_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsistenciaInstitucional" ADD CONSTRAINT "AsistenciaInstitucional_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscripcion" ADD CONSTRAINT "Inscripcion_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscripcionMesa" ADD CONSTRAINT "InscripcionMesa_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_estudianteDni_fkey" FOREIGN KEY ("estudianteDni") REFERENCES "Estudiante"("dni") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "Personal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

