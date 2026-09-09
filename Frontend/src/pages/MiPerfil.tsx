import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import type { Personal } from '../types/Personal';
import type { Usuario } from '../types/Usuario';
import type { AsignacionHoraria } from '../types/AsignacionHoraria';
import type { Cursada } from '../types/Cursada';
import type { Materia } from '../types/Materia';
import { nombreCurso, type Curso } from '../types/Curso';
import { nombreBloqueHorario, type BloqueHorario } from '../types/BloqueHorario';
import { cargoDeMayorJerarquia } from '../constants/cargoJerarquia';
import { EMAIL_REGEX, SOLO_NUMEROS } from '../constants/regexPatterns';
import { TOAST } from '../constants/toastMessages';
import { formatFecha } from '../constants/fechas';
import SeccionInfo from '../components/elements/SeccionInfo';
import CampoDetalle from '../components/elements/CampoDetalle';
import EstadoBadge from '../components/elements/EstadoBadge';
import EstadoCarga from '../components/elements/EstadoCarga';


type CampoContacto = 'email' | 'telefono';

interface CampoContactoEditableProps {
  label: string;
  valor: string;
  editando: boolean;
  valorTemp: string;
  error?: string;
  inputMode?: 'text' | 'numeric';
  onIniciarEdicion: () => void;
  onCambiar: (valor: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

function CampoContactoEditable({
  label, valor, editando, valorTemp, error, inputMode,
  onIniciarEdicion, onCambiar, onGuardar, onCancelar,
}: CampoContactoEditableProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-label text-label-md text-on-surface-variant">{label}</span>
      {editando ? (
        <div className="flex items-start gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <input
              type="text"
              inputMode={inputMode}
              autoFocus
              value={valorTemp}
              onChange={e => onCambiar(e.target.value)}
              style={{ color: 'var(--on-surface)', backgroundColor: 'var(--background)' }}
              className={`w-full px-2 py-1.5 rounded-lg border font-body text-body-sm focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all duration-150 ${error ? 'border-error' : 'border-outline-variant'}`}
            />
            {error && <p className="font-body text-xs text-error">{error}</p>}
          </div>
          <button
            onClick={onGuardar}
            className="cursor-pointer p-1 rounded-lg text-primary hover:bg-surface-container-high transition-colors duration-150"
            title="Guardar"
          >
            <span className="material-symbols-outlined text-[1.25rem]">check</span>
          </button>
          <button
            onClick={onCancelar}
            className="cursor-pointer p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-150"
            title="Cancelar"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-body text-body-sm text-on-surface font-medium">{valor || '—'}</span>
          <button
            onClick={onIniciarEdicion}
            className="cursor-pointer p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
            title={`Editar ${label.toLowerCase()}`}
          >
            <span className="material-symbols-outlined text-[1.1rem]">edit</span>
          </button>
        </div>
      )}
    </div>
  );
}

function MiPerfil() {
  const { personalIdActual } = useAuth();
  const { data: personalData, setData: setPersonalData, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');
  const { data: usuariosData, loading: loadingUsuarios, error: errorUsuarios } = useFetch<Usuario[]>('/data/usuarios.json');
  const { data: horariosData, loading: loadingHorarios, error: errorHorarios } = useFetch<AsignacionHoraria[]>('/data/asignacionesHorarias.json');
  const { data: cursadasData, loading: loadingCursadas, error: errorCursadas } = useFetch<Cursada[]>('/data/cursadas.json');
  const { data: materiasData, loading: loadingMaterias, error: errorMaterias } = useFetch<Materia[]>('/data/materias.json');
  const { data: cursosData,   loading: loadingCursos,   error: errorCursos   } = useFetch<Curso[]>('/data/cursos.json');
  const { data: bloquesData, loading: loadingBloques,  error: errorBloques  } = useFetch<BloqueHorario[]>('/data/bloquesHorarios.json');
  const { mostrarToast } = useToast();

  const [campoEditando, setCampoEditando] = useState<CampoContacto | null>(null);
  const [valorTemp, setValorTemp] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [filtroVigencia, setFiltroVigencia] = useState<'' | 'vigente' | 'finalizada'>('');

  const personal = (personalData ?? []).find(p => p.id === personalIdActual);
  const usuario  = (usuariosData ?? []).find(u => u.personalId === personalIdActual);

  const cursadas = cursadasData ?? [];
  const materias = materiasData ?? [];
  const cursosLista = cursosData ?? [];
  const bloques = bloquesData ?? [];

  // Vigentes primero (sin fecha de fin) y, dentro de cada grupo, de la más reciente a la más antigua.
  const horarios = (horariosData ?? []).filter(h => h.personalId === personalIdActual).sort((a, b) => {
    const aVigente = a.fechaFin === '';
    const bVigente = b.fechaFin === '';
    if (aVigente !== bVigente) return aVigente ? -1 : 1;
    return b.fechaIni.localeCompare(a.fechaIni);
  });
  const horariosFiltrados = horarios.filter(h => {
    if (filtroVigencia === '') return true;
    const esVigente = h.fechaFin === '';
    return filtroVigencia === 'vigente' ? esVigente : !esVigente;
  });
  const cargoPrincipal = cargoDeMayorJerarquia(horarios.map(h => ({ id: h.id, tipo: h.tipoCargo })));

  // Para Profesor se muestra "Materia Curso" (bloque asociado a una cursada); el resto de los
  // cargos, incluido Preceptor, muestran solo el día y horario del bloque.
  const renderBloque = (bloqueHorarioId: number, esDocente: boolean) => {
    const bloque = bloques.find(b => b.id === bloqueHorarioId);
    if (!bloque) return '—';
    if (esDocente && bloque.cursadaId !== undefined) {
      const cursada = cursadas.find(c => c.id === bloque.cursadaId);
      const materia = cursada ? materias.find(m => m.id === cursada.materiaId)?.nombre ?? '—' : '—';
      const curso = cursada ? cursosLista.find(c => c.id === cursada.cursoId) : undefined;
      return (
        <>
          <span className="block">{materia} {curso ? nombreCurso(curso) : '—'}</span>
          <span className="block font-normal text-on-surface-variant">{nombreBloqueHorario(bloque)}</span>
        </>
      );
    }
    return nombreBloqueHorario(bloque);
  };

  const loading = loadingPersonal || loadingUsuarios || loadingHorarios || loadingCursadas || loadingMaterias || loadingCursos || loadingBloques;
  const conError = errorPersonal || errorUsuarios || errorHorarios || errorCursadas || errorMaterias || errorCursos || errorBloques;
  if (loading || conError) return <EstadoCarga loading={loading} error={conError} />;

  if (!personal) {
    return (
      <div>
        <h1 className="font-headline text-headline-md font-bold text-on-surface">Perfil no encontrado</h1>
      </div>
    );
  }

  const iniciarEdicion = (campo: CampoContacto) => {
    setCampoEditando(campo);
    setValorTemp(String(personal[campo]));
    setError(undefined);
  };

  const cancelarEdicion = () => {
    setCampoEditando(null);
    setValorTemp('');
    setError(undefined);
  };

  const guardarCampo = () => {
    if (!campoEditando) return;

    if (campoEditando === 'email') {
      if (!valorTemp || !EMAIL_REGEX.test(valorTemp)) {
        setError('Email inválido');
        return;
      }
    } else if (!valorTemp || !SOLO_NUMEROS.test(valorTemp)) {
      setError('Solo se permiten números');
      return;
    }

    const valorGuardado = valorTemp;
    setPersonalData(prev => (prev ?? []).map(p => p.id === personalIdActual ? { ...p, [campoEditando]: valorGuardado } : p));
    setCampoEditando(null);
    setValorTemp('');
    setError(undefined);
    mostrarToast(TOAST.PERFIL_MODIFICADO);
  };

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="font-headline text-headline-md font-bold text-on-surface">
          {personal.apellido}, {personal.nombre}
        </h1>
        <p className="font-body text-body-sm text-on-surface-variant mt-1">
          {cargoPrincipal ? cargoPrincipal.tipo : 'Sin cargo asignado'} · Mi perfil
        </p>
      </div>

      {/* Datos personales */}
      <SeccionInfo icono="person" titulo="Datos personales">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CampoDetalle label="Apellido" value={personal.apellido} />
          <CampoDetalle label="Nombre" value={personal.nombre} />
          <CampoDetalle label="DNI" value={personal.dni} />
          <CampoDetalle label="CUIL" value={personal.cuil} />
          <CampoDetalle label="Fecha de ingreso" value={formatFecha(personal.fechaIngreso)} />

          <CampoContactoEditable
            label="Email"
            valor={personal.email}
            editando={campoEditando === 'email'}
            valorTemp={valorTemp}
            error={campoEditando === 'email' ? error : undefined}
            onIniciarEdicion={() => iniciarEdicion('email')}
            onCambiar={setValorTemp}
            onGuardar={guardarCampo}
            onCancelar={cancelarEdicion}
          />

          <CampoContactoEditable
            label="Teléfono"
            valor={String(personal.telefono)}
            editando={campoEditando === 'telefono'}
            valorTemp={valorTemp}
            error={campoEditando === 'telefono' ? error : undefined}
            inputMode="numeric"
            onIniciarEdicion={() => iniciarEdicion('telefono')}
            onCambiar={setValorTemp}
            onGuardar={guardarCampo}
            onCancelar={cancelarEdicion}
          />
        </div>
      </SeccionInfo>

      {/* Usuario asociado */}
      <SeccionInfo icono="account_circle" titulo="Roles asociados">
        {usuario ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-label text-label-md text-on-surface-variant">Roles</span>
              <div className="flex flex-wrap gap-1.5">
                {usuario.roles.map(rol => (
                  <span key={rol} className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                    {rol}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label text-label-md text-on-surface-variant">Estado</span>
              <EstadoBadge estado={usuario.activo ? 'Activo' : 'Inactivo'} />
            </div>
          </div>
        ) : (
          <p className="font-body text-body-sm text-on-surface-variant">
            No tenés un usuario asociado.
          </p>
        )}
      </SeccionInfo>

      {/* Asignaciones horarias: cargo + situación de revista + bloque horario que ocupa */}
      <SeccionInfo
        icono="work_history"
        titulo={`Asignaciones Horarias (${horarios.length})`}
        accionesHeader={horarios.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 p-1 rounded-xl bg-surface-container border border-outline-variant">
            {([
              { valor: '',           label: 'Todas' },
              { valor: 'vigente',    label: 'Vigentes' },
              { valor: 'finalizada', label: 'Finalizadas' },
            ] as const).map(opcion => (
              <button
                key={opcion.valor}
                onClick={() => setFiltroVigencia(opcion.valor)}
                className={`cursor-pointer shrink-0 px-3 py-1.5 rounded-lg font-label text-label-md transition-colors duration-150 whitespace-nowrap ${
                  filtroVigencia === opcion.valor
                    ? 'bg-secondary-container/80 text-on-secondary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        )}
      >
        {horarios.length === 0 ? (
          <p className="font-body text-body-sm text-on-surface-variant">
            No tenés asignaciones registradas.
          </p>
        ) : (
          <>
            <p className="font-body text-body-sm text-on-surface-variant mb-4">
              {filtroVigencia
                ? `${horariosFiltrados.length} de ${horarios.length} ${horarios.length === 1 ? 'asignación' : 'asignaciones'}`
                : `${horarios.length} ${horarios.length === 1 ? 'asignación' : 'asignaciones'} en total`}
            </p>

            {horariosFiltrados.length === 0 ? (
              <p className="font-body text-body-sm text-on-surface-variant">
                No hay asignaciones que coincidan con el filtro seleccionado.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-outline-variant">
                {horariosFiltrados.map((horario, idx) => (
                  <div
                    key={horario.id}
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 ${idx > 0 ? 'pt-6' : ''} ${idx < horariosFiltrados.length - 1 ? 'pb-6' : ''}`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-label text-label-md text-on-surface-variant">Cargo</span>
                      <span
                        className={`w-fit inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium ${
                          horario.id === cargoPrincipal?.id ? 'bg-primary text-background' : 'bg-secondary-container text-on-secondary-container'
                        }`}
                      >
                        {horario.tipoCargo}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-label text-label-md text-on-surface-variant">
                        {horario.bloqueHorarioIds.length === 1 ? 'Bloque horario' : 'Bloques horarios'}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        {horario.bloqueHorarioIds.map(bloqueId => (
                          <span key={bloqueId} className="font-body text-body-sm text-on-surface font-medium">
                            {renderBloque(bloqueId, horario.tipoCargo === 'Profesor')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <CampoDetalle label="Situación de revista" value={horario.situacionRevista} />
                    <CampoDetalle label="Fecha de inicio" value={formatFecha(horario.fechaIni)} />
                    <CampoDetalle label="Fecha de fin" value={formatFecha(horario.fechaFin) || 'Vigente'} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </SeccionInfo>

    </div>
  );
}

export default MiPerfil;
