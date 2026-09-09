import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { useUsuarioModal } from '../hooks/useUsuarioModal';
import { useBusqueda } from '../hooks/useBusqueda';
import type { Usuario } from '../types/Usuario';
import type { Personal } from '../types/Personal';
import type { Rol } from '../types/Rol';
import { PERMISOS } from '../constants/permisos';
import EstadoCarga from '../components/elements/EstadoCarga';
import UsuarioModal from '../components/modals/UsuarioModal';
import PanelRoles from '../components/cards/PanelRoles';
import PanelPermisos from '../components/cards/PanelPermisos';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import { TOAST } from '../constants/toastMessages';
import { normalizarBusqueda as norm } from '../constants/normalizarTexto';

function RolesYUsuarios() {
  const { data: rolesData,    loading: loadingRoles,    error: errorRoles    } = useFetch<Rol[]>('/data/roles.json');
  const { data: usuariosData, setData: setUsuarios, loading: loadingUsuarios, error: errorUsuarios } = useFetch<Usuario[]>('/data/usuarios.json');
  const { data: personalData, loading: loadingPersonal, error: errorPersonal } = useFetch<Personal[]>('/data/personal.json');

  const roles    = rolesData ?? [];
  const usuarios = (usuariosData ?? []).filter(u => u.activo);
  const personal = personalData ?? [];

  // Personal es la fuente de apellido/nombre/email/dni/telefono (Usuario solo guarda credenciales y roles)
  const personalDe = (personalId: string) => personal.find(p => p.id === personalId);

  const [activeTab,        setActiveTab]        = useState<'usuarios' | 'permisos'>('usuarios');
  const [selectedRolId,    setSelectedRolId]    = useState('');
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<string | null>(null);

  const { busquedaUsuarios, setBusquedaUsuarios } = useBusqueda();

  const {
    modalAbierto:  modalUsuario,
    usuarioEditando,
    form:          formUsuario,
    errores:       erroresUsuario,
    abrirModalEdicion,
    cerrarModal:   cerrarModalUsuario,
    handleRolChange,
    agregarRol,
    eliminarRol,
    validarForm:   validarUsuario,
  } = useUsuarioModal();

  const { mostrarToast } = useToast();

  // Seleccionar primer rol al cargar. Ajuste de estado durante el render (no en
  // un efecto): el guard `!selectedRolId` hace que solo se dispare una vez.
  if (rolesData && rolesData.length > 0 && !selectedRolId) {
    setSelectedRolId(rolesData[0].id);
  }

  const currentRol = roles.find(r => r.id === selectedRolId) ?? roles[0];

  // ── Usuarios ──────────────────────────────────────────────────────────────

  const usuariosFiltrados = usuarios.filter(u => {
    const p = personalDe(u.personalId);
    return p ? norm(`${p.apellido} ${p.nombre}`).includes(norm(busquedaUsuarios)) : false;
  });

  const handleEliminarUsuario = () => {
    if (!usuarioAEliminar) return;
    setUsuarios(prev => (prev ?? []).map(u => u.id === usuarioAEliminar ? { ...u, activo: false } : u));
    setUsuarioAEliminar(null);
    mostrarToast(TOAST.USUARIO_ELIMINADO);
  };

  const handleGuardarUsuario = () => {
    if (!validarUsuario() || !usuarioEditando) return;

    setUsuarios(prev => (prev ?? []).map(u => u.id === usuarioEditando ? { ...u, roles: formUsuario.roles } : u));
    cerrarModalUsuario();
    mostrarToast(TOAST.USUARIO_MODIFICADO);
  };

  // ── Carga / error ─────────────────────────────────────────────────────────

  const loading = loadingRoles || loadingUsuarios || loadingPersonal;
  const error   = errorRoles   || errorUsuarios   || errorPersonal;
  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Gestión de Roles y Usuarios
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administración de accesos, cuentas de usuarios y permisos del sistema.
          </p>
        </div>
      </div>

      {/* Card principal con pestañas integradas */}
      <div className="bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">

        {/* Nav de pestañas — mismo fondo que el header de tabla */}
        <div className="flex overflow-x-auto scrollbar-custom border-b border-outline-variant bg-surface-container">
          {(['usuarios', 'permisos'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="shrink-0 py-3 px-4 font-label text-label-md transition-colors duration-200 border-b-2 cursor-pointer border-transparent text-on-surface-variant hover:text-on-surface data-[active=true]:border-primary data-[active=true]:text-primary whitespace-nowrap"
              data-active={activeTab === tab}
            >
              {tab === 'usuarios' ? 'Usuarios' : 'Roles y Permisos'}
            </button>
          ))}
        </div>

        {activeTab === 'usuarios' ? (

          /* ── PESTAÑA USUARIOS ── */
          <>
            {/* SearchBar */}
            <div className="px-4 pt-3 pb-2 bg-surface-container border-b border-outline-variant">
              <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    fontSize: '20px',
                    color: 'var(--on-surface-variant)',
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  search
                </span>
                <input
                  type="text"
                  value={busquedaUsuarios}
                  onChange={e => setBusquedaUsuarios(e.target.value)}
                  placeholder="Buscar por nombre o apellido..."
                  style={{
                    display: 'block',
                    width: '100%',
                    boxSizing: 'border-box',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    color: 'var(--on-surface)',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Barra superior: contador */}
            <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {busquedaUsuarios
                  ? `${usuariosFiltrados.length} de ${usuarios.length} ${usuarios.length === 1 ? 'usuario' : 'usuarios'} encontrado${usuariosFiltrados.length !== 1 ? 's' : ''}`
                  : `${usuarios.length} ${usuarios.length === 1 ? 'usuario' : 'usuarios'} registrados`}
              </p>
            </div>

            {usuariosFiltrados.length === 0 ? (
              <div className="px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
                {busquedaUsuarios
                  ? 'No se encontraron usuarios que coincidan con la búsqueda.'
                  : 'No hay usuarios registrados.'}
              </div>
            ) : (
              <>
                {/* Vista escritorio: tabla — directamente en el card, igual que GestionEstudiantes */}
                <div className="hidden lg:block">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant">
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Usuario</th>
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Email</th>
                      <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Roles</th>
                      <th className="w-full"></th>
                      <th className="w-24 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {usuariosFiltrados.map(user => {
                      const p = personalDe(user.personalId);
                      return (
                      <tr key={user.id} className="hover:bg-surface-container-high transition-colors duration-150">
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{p?.apellido}, {p?.nombre}</td>
                        <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{p?.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {user.roles.map(rol => (
                              <span key={rol} className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                                {rol}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-xs">
                            <button
                              onClick={() => p && abrirModalEdicion(user, p)}
                              className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                              title="Editar usuario"
                            >
                              <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                            </button>
                            <button
                              onClick={() => setUsuarioAEliminar(user.id)}
                              className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                              title="Eliminar usuario"
                            >
                              <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 bg-surface-container border-t border-outline-variant">
                  <p className="font-body text-body-sm text-on-surface-variant">
                    {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'}
                  </p>
                </div>
                </div>

                {/* Vista mobile/tablet: cards */}
                <div className="lg:hidden flex flex-col gap-3 p-4">
                  {usuariosFiltrados.map(user => {
                    const p = personalDe(user.personalId);
                    return (
                      <div
                        key={user.id}
                        className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-body text-body-sm text-on-surface font-medium">{p?.apellido}, {p?.nombre}</p>
                            <p className="font-body text-xs text-on-surface-variant mt-0.5">{p?.email}</p>
                          </div>
                          <div className="flex items-center gap-xs flex-wrap shrink-0">
                            <button
                              onClick={() => p && abrirModalEdicion(user, p)}
                              className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                              title="Editar usuario"
                            >
                              <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                            </button>
                            <button
                              onClick={() => setUsuarioAEliminar(user.id)}
                              className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                              title="Eliminar usuario"
                            >
                              <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 border-t border-outline-variant pt-3">
                          {user.roles.map(rol => (
                            <span key={rol} className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-xs font-medium bg-secondary-container/50 text-on-secondary-container">
                              {rol}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>

        ) : (

          /* ── PESTAÑA ROLES Y PERMISOS (informativa: los roles son fijos) ── */
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-outline-variant min-h-[480px]">
            <PanelRoles
              roles={roles}
              selectedRolId={selectedRolId}
              onSelectRol={setSelectedRolId}
            />
            {currentRol && (
              <PanelPermisos
                rol={currentRol}
                permisos={PERMISOS}
              />
            )}
          </div>
        )}
      </div>

      {/* Modal editar usuario */}
      {modalUsuario && (
        <UsuarioModal
          form={formUsuario}
          errores={erroresUsuario}
          roles={roles}
          onClose={cerrarModalUsuario}
          onGuardar={handleGuardarUsuario}
          onRolChange={handleRolChange}
          onAgregarRol={agregarRol}
          onEliminarRol={eliminarRol}
        />
      )}

      {/* Modal confirmar eliminar usuario */}
      {usuarioAEliminar && (
        <ConfirmEliminar
          titulo="Eliminar usuario"
          mensaje={
            <>
              ¿Estás seguro de que querés eliminar al usuario{' '}
              <strong className="text-on-surface">
                {(() => { const u = usuarios.find(u => u.id === usuarioAEliminar); const p = u && personalDe(u.personalId); return p ? `${p.apellido}, ${p.nombre}` : ''; })()}
              </strong>? Esta acción no se puede deshacer.
            </>
          }
          onConfirmar={handleEliminarUsuario}
          onCancelar={() => setUsuarioAEliminar(null)}
        />
      )}

    </div>
  );
}

export default RolesYUsuarios;
