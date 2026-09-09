import { Routes, Route, Navigate } from 'react-router-dom';
import './assets/App.css';
import Layout from './components/layout/layout.tsx';
import Home from './pages/Home.tsx';
import Reportes from './pages/Reportes.tsx';
import Seguimiento from './pages/Seguimiento.tsx';
import Trayectorias from './pages/Trayectorias.tsx';
import RolesYUsuarios from './pages/RolesYUsuarios';
import RecursosHumanos from './pages/RecursosHumanos';
import EstructuraInstitucional from './pages/EstructuraInstitucional';
import GestionEstudiantes from './pages/GestionEstudiantes';
import DetalleEstudiante from './pages/DetalleEstudiante';
import GestionOrientaciones from './pages/GestionOrientaciones';
import GestionMaterias from './pages/GestionMaterias';
import GestionCursos from './pages/GestionCursos';
import CursadasCurso from './pages/CursadasCurso';
import MatriculadosCurso from './pages/MatriculadosCurso';
import DetalleMatriculadoCurso from './pages/DetalleMatriculadoCurso';
import TotalizadoraCurso from './pages/TotalizadoraCurso';
import MisCursos from './pages/MisCursos';
import DetalleMiCurso from './pages/DetalleMiCurso';
import DetalleEstudianteMiCurso from './pages/DetalleEstudianteMiCurso';
import PasarListaCurso from './pages/PasarListaCurso';
import GestionCursadas from './pages/GestionCursadas';
import GestionInscripcionesCursada from './pages/GestionInscripcionesCursada';
import InscriptosCursada from './pages/InscriptosCursada';
import Intensificaciones from './pages/Intensificaciones';
import GestionAulas from './pages/GestionAulas';
import GestionCiclosLectivos from './pages/GestionCiclosLectivos';
import GestionPersonal from './pages/GestionPersonal';
import DetallePersonal from './pages/DetallePersonal';
import GestionMesasExamen from './pages/GestionMesasExamen';
import InscriptosMesaExamen from './pages/InscriptosMesaExamen';
import GestionPeriodosCarga from './pages/GestionPeriodosCarga';
import MiPerfil from './pages/MiPerfil';
import Login from './pages/Login.tsx';
import { TemaProvider } from './context/TemaContext';
import { TamanioTextoProvider } from './context/TamanioTextoContext';
import { BusquedaProvider } from './context/BusquedaContext';
import { ToastProvider } from './context/ToastContext';
import { CicloLectivoProvider } from './context/CicloLectivoContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

function AppRoutes() {
  const { usuarioActual, logout } = useAuth();
  const authed = usuarioActual !== null;

  return (
    <Routes>
      <Route
        path="/login"
        element={authed ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/*"
        element={
          authed ? (
            <Layout onLogout={logout}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/mi-perfil" element={<MiPerfil />} />
                <Route path="/reportes-estadisticas" element={<Reportes />} />
                <Route path="/seguimiento-evaluacion" element={<Seguimiento />} />
                <Route path="/trayectorias-estudiantiles" element={<Trayectorias />} />
                <Route path="/roles-usuarios" element={<RolesYUsuarios />} />
                <Route path="/recursos-humanos" element={<RecursosHumanos />} />
                <Route path="/recursos-humanos/personal" element={<GestionPersonal />} />
                <Route path="/recursos-humanos/personal/:id" element={<DetallePersonal />} />
                <Route path="/estructura-institucional" element={<EstructuraInstitucional />} />
                <Route path="/trayectorias-estudiantiles/estudiantes" element={<GestionEstudiantes />} />
                <Route path="/trayectorias-estudiantiles/estudiantes/:id" element={<DetalleEstudiante />} />
                <Route path="/trayectorias-estudiantiles/mesas-examen" element={<GestionMesasExamen />} />
                <Route path="/trayectorias-estudiantiles/mesas-examen/:id" element={<InscriptosMesaExamen />} />
                <Route path="/estructura-institucional/orientaciones" element={<GestionOrientaciones />} />
                <Route path="/estructura-institucional/materias" element={<GestionMaterias />} />
                <Route path="/estructura-institucional/cursos" element={<GestionCursos />} />
                <Route path="/estructura-institucional/cursos/:id/cursadas" element={<CursadasCurso />} />
                <Route path="/estructura-institucional/cursos/:id/matriculados" element={<MatriculadosCurso />} />
                <Route path="/estructura-institucional/cursos/:id/totalizadora" element={<TotalizadoraCurso />} />
                <Route path="/estructura-institucional/cursos/:cursoId/matriculados/:id" element={<DetalleMatriculadoCurso />} />
                <Route path="/estructura-institucional/cursos/:cursoId/cursadas/:cursadaId/inscripciones" element={<GestionInscripcionesCursada />} />
                <Route path="/estructura-institucional/aulas" element={<GestionAulas />} />
                <Route path="/estructura-institucional/ciclos-lectivos" element={<GestionCiclosLectivos />} />
                <Route path="/seguimiento-evaluacion/cursadas" element={<GestionCursadas />} />
                <Route path="/seguimiento-evaluacion/cursadas/:cursadaId/inscriptos" element={<InscriptosCursada />} />
                <Route path="/seguimiento-evaluacion/periodos-carga" element={<GestionPeriodosCarga />} />
                <Route path="/seguimiento-evaluacion/intensificaciones" element={<Intensificaciones />} />
                <Route path="/seguimiento-evaluacion/mis-cursos" element={<MisCursos />} />
                <Route path="/seguimiento-evaluacion/mis-cursos/:id" element={<DetalleMiCurso />} />
                <Route path="/seguimiento-evaluacion/mis-cursos/:cursoId/estudiantes/:id" element={<DetalleEstudianteMiCurso />} />
                <Route path="/seguimiento-evaluacion/mis-cursos/:id/pasar-lista" element={<PasarListaCurso />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <TemaProvider>
    <TamanioTextoProvider>
    <ToastProvider>
    <BusquedaProvider>
    <CicloLectivoProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    </CicloLectivoProvider>
    </BusquedaProvider>
    </ToastProvider>
    </TamanioTextoProvider>
    </TemaProvider>
  );
}

export default App;
