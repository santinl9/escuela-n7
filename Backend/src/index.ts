import express from "express";
import asignacionHorariaRoutes from "./routes/asignacionHoraria.routes";
import asistenciaInstitucionalRoutes from "./routes/asistenciaInstitucional.routes";
import aulaRoutes from "./routes/aula.routes";
import bloqueHorarioRoutes from "./routes/bloqueHorario.routes";
import cargaIntensificacionRoutes from "./routes/cargaIntensificacion.routes";
import cargaNumericaRoutes from "./routes/cargaNumerica.routes";
import cargaValorativaRoutes from "./routes/cargaValorativa.routes";
import cicloLectivoRoutes from "./routes/cicloLectivo.routes";
import contactoEmergenciaRoutes from "./routes/contactoEmergencia.routes";
import cursadaRoutes from "./routes/cursada.routes";
import cursoRoutes from "./routes/curso.routes";
import domicilioRoutes from "./routes/domicilio.routes";
import estudianteRoutes from "./routes/estudiante.routes";
import inscripcionRoutes from "./routes/inscripcion.routes";
import inscripcionMesaRoutes from "./routes/inscripcionMesa.routes";
import materiaRoutes from "./routes/materia.routes";
import matriculaRoutes from "./routes/matricula.routes";
import mesasDeExamenRoutes from "./routes/mesasDeExamen.routes";
import orientacionRoutes from "./routes/orientacion.routes";
import periodoCargaRoutes from "./routes/periodoCarga.routes";
import permisoRoutes from "./routes/permiso.routes";
import personaRoutes from "./routes/persona.routes";
import personalRoutes from "./routes/personal.routes";
import rolRoutes from "./routes/rol.routes";
import usuarioRoutes from "./routes/usuario.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { authenticate } from "./middlewares/auth.middleware";
import { env } from "./config/env";
import { logger } from "./config/logger";

const app = express();

app.use(express.json());

// ─── Rutas PÚBLICAS (no requieren token) ────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({ mensaje: "API de la Escuela de Educación Secundaria N°7" });
});

// El router de auth se monta antes del middleware global porque /login es
// público. Las rutas de auth que sí requieren token (/register, /yo) declaran
// `authenticate` dentro de auth.routes.ts.
app.use("/api/auth", authRoutes);

// ─── A partir de acá, TODO requiere un JWT válido ───────────────────────────
// Se monta una sola vez, antes de los routers de recursos: así cualquier router
// que se agregue debajo nace protegido (no se puede olvidar de ponerlo).
app.use("/api", authenticate);

app.use("/api/asignaciones-horarias", asignacionHorariaRoutes);
app.use("/api/asistencias-institucionales", asistenciaInstitucionalRoutes);
app.use("/api/aulas", aulaRoutes);
app.use("/api/bloques-horarios", bloqueHorarioRoutes);
app.use("/api/cargas-intensificacion", cargaIntensificacionRoutes);
app.use("/api/cargas-numericas", cargaNumericaRoutes);
app.use("/api/cargas-valorativas", cargaValorativaRoutes);
app.use("/api/ciclos-lectivos", cicloLectivoRoutes);
app.use("/api/contactos-emergencia", contactoEmergenciaRoutes);
app.use("/api/cursadas", cursadaRoutes);
app.use("/api/cursos", cursoRoutes);
app.use("/api/domicilios", domicilioRoutes);
app.use("/api/estudiantes", estudianteRoutes);
app.use("/api/inscripciones", inscripcionRoutes);
app.use("/api/inscripciones-mesa", inscripcionMesaRoutes);
app.use("/api/materias", materiaRoutes);
app.use("/api/matriculas", matriculaRoutes);
app.use("/api/mesas-examen", mesasDeExamenRoutes);
app.use("/api/orientaciones", orientacionRoutes);
app.use("/api/periodos-carga", periodoCargaRoutes);
app.use("/api/permisos", permisoRoutes);
app.use("/api/personas", personaRoutes);
app.use("/api/personal", personalRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/usuarios", usuarioRoutes);

// Middleware global de manejo de errores: debe ir después de todas las rutas.
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Servidor en http://localhost:${env.PORT}`);
});
