import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useEstudianteModal } from '../hooks/useEstudianteModal';
import { useBusqueda } from '../hooks/useBusqueda';
import { useToast } from '../hooks/useToast';
import type { EstudianteListado } from '../types/EstudianteListado';
import type { Estudiante } from '../types/Estudiante';
import type { ContactoEmergencia } from '../types/ContactoEmergencia';
import type { Domicilio } from '../types/Domicilio';
import EstadoBadge from '../components/elements/EstadoBadge';
import EstudianteModal from '../components/modals/EstudianteModal';
import ConfirmEliminar from '../components/modals/ConfirmEliminar';
import EstadoCarga from '../components/elements/EstadoCarga';
import { TOAST } from '../constants/toastMessages';
import { normalizarBusqueda as norm } from '../constants/normalizarTexto';

const calcularEdad = (fechaNacimiento: string): number => {
  const nacimiento = new Date(fechaNacimiento + 'T00:00:00');
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumplio =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumplio) edad--;
  return edad;
};

function GestionEstudiantes() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: estudiantesData, setData: setEstudiantes, loading, error } = useFetch<EstudianteListado[]>('/data/estudiantes_listado.json');
  const { data: estudiantesCompletosData, setData: setEstudiantesCompletos } = useFetch<Estudiante[]>('/data/estudiantes.json');
  const { data: contactosData, setData: setContactos } = useFetch<ContactoEmergencia[]>('/data/contactosEmergencia.json');
  const { data: domiciliosData, setData: setDomicilios } = useFetch<Domicilio[]>('/data/domicilios.json');

  const estudiantesCompletos = estudiantesCompletosData ?? [];
  const estudiantes = (estudiantesData ?? []).filter(est =>
    estudiantesCompletos.find(e => e.id === est.id)?.activo !== false
  );

  const [estudianteAEliminar, setEstudianteAEliminar] = useState<number | null>(null);

  const { busqueda, setBusqueda } = useBusqueda();
  const { mostrarToast } = useToast();

  // El filtro por estado es una acción puntual disparada por navegación (p.ej.
  // "Revisar" desde Alertas de Regularidad), no una búsqueda persistente como
  // `busqueda`: viaja como state de la navegación y sólo vive mientras dura
  // esta visita a la página, así que no queda pegado si se vuelve a entrar
  // por otro lado (ej. sidebar).
  const [filtroEstado, setFiltroEstado] = useState<string>(
    () => (location.state as { filtroEstado?: string } | null)?.filtroEstado ?? ''
  );

  // Se limpia el state de navegación una vez consumido, para que volver atrás
  // con el botón del navegador no vuelva a aplicar el filtro.
  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const {
    modalAbierto, modoEdicion, idEditando,
    form, errores, erroresContactos,
    abrirModalNuevo, abrirModalEdicion, cerrarModal,
    handleChange, handleContactoChange,
    agregarContacto, eliminarContacto,
    validarForm,
  } = useEstudianteModal();

  const estudiantesFiltrados = estudiantes.filter(est => {
    const coincideTexto = norm(`${est.apellido} ${est.nombre}`).includes(norm(busqueda));
    const coincideEstado = filtroEstado === '' || est.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  // ── Editar ────────────────────────────────────────────────────────────────

  const handleAbrirEdicion = (id: number) => {
    const completo = estudiantesCompletos.find(e => e.id === id);
    const contactosDelEstudiante = (contactosData ?? []).filter(c => c.estudianteDni === completo?.dni);
    const domicilioDelEstudiante = (domiciliosData ?? []).find(d => d.estudianteDni === completo?.dni);
    if (completo) abrirModalEdicion(completo, contactosDelEstudiante, domicilioDelEstudiante);
  };

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = () => {
    if (!validarForm(estudiantesCompletos)) return;

    if (modoEdicion && idEditando !== null) {
      setEstudiantes(prev =>
        (prev ?? []).map(est =>
          est.id === idEditando
            ? { ...est, apellido: form.apellido, nombre: form.nombre }
            : est
        )
      );
      cerrarModal();
      mostrarToast(TOAST.ESTUDIANTE_MODIFICADO);
      return;
    }

    const nuevoId = estudiantesCompletos.length > 0 ? Math.max(...estudiantesCompletos.map(e => e.id)) + 1 : 1;

    const nuevoEstudiante: Estudiante = {
      id: nuevoId,
      activo: true,
      apellido: form.apellido,
      nombre: form.nombre,
      dni: Number(form.dni),
      cuil: form.cuil,
      email: form.email,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento,
      folio: Number(form.folio),
      libro: Number(form.libro),
      nacionalidad: form.nacionalidad,
      estado: 'Regular',
      edad: calcularEdad(form.fechaNacimiento),
    };

    setEstudiantesCompletos(prev => [...(prev ?? []), nuevoEstudiante]);
    setEstudiantes(prev => [
      ...(prev ?? []),
      { id: nuevoId, dni: Number(form.dni), apellido: form.apellido, nombre: form.nombre, estado: 'Regular' },
    ]);

    setContactos(prev => {
      const existentes = prev ?? [];
      const proximoId = existentes.length > 0 ? Math.max(...existentes.map(c => c.id)) + 1 : 1;
      return [
        ...existentes,
        ...form.contactos.map((c, idx) => ({ id: proximoId + idx, estudianteDni: nuevoEstudiante.dni, activo: true, ...c, dni: Number(c.dni), telefono: c.telefono })),
      ];
    });

    setDomicilios(prev => {
      const existentes = prev ?? [];
      const proximoId = existentes.length > 0 ? Math.max(...existentes.map(d => d.id)) + 1 : 1;
      return [
        ...existentes,
        { id: proximoId, estudianteDni: nuevoEstudiante.dni, calle: form.calle, numero: Number(form.numero) },
      ];
    });

    cerrarModal();
    mostrarToast(TOAST.ESTUDIANTE_CREADO);
  };

  // ── Eliminar (baja lógica) ────────────────────────────────────────────────

  const handleEliminar = () => {
    if (estudianteAEliminar === null) return;
    setEstudiantesCompletos(prev => (prev ?? []).map(e => e.id === estudianteAEliminar ? { ...e, activo: false } : e));
    setEstudianteAEliminar(null);
    mostrarToast(TOAST.ESTUDIANTE_ELIMINADO);
  };

  // ── Estados de carga ──────────────────────────────────────────────────────

  if (loading || error) return <EstadoCarga loading={loading} error={error} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8">

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-headline-md font-bold text-on-surface">
            Gestión de Estudiantes
          </h1>
          <p className="font-body text-body-sm text-on-surface-variant mt-1">
            Administra el listado de estudiantes del sistema.
          </p>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="cursor-pointer flex items-center gap-sm px-4 py-2.5 bg-primary text-background font-label text-label-md rounded-xl hover:opacity-90 transition-all duration-200 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.25rem]">add</span>
          Nuevo Estudiante
        </button>
      </div>

      {/* Buscador */}
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
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
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
            backgroundColor: 'var(--surface-container)',
            border: '1px solid var(--outline-variant)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
      </div>

      {/* Chip de filtro activo */}
      {filtroEstado && (
        <div className="flex items-center gap-2 -mt-4">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-error-container text-on-error-container text-sm font-medium">
            <span>Filtrado por estado: {filtroEstado.charAt(0).toUpperCase() + filtroEstado.slice(1)}</span>
            <button
              onClick={() => setFiltroEstado('')}
              className="ml-1 hover:opacity-70 cursor-pointer flex items-center"
              title="Quitar filtro"
            >
              <span className="material-symbols-outlined text-[1rem]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Contador superior */}
      <p className="font-body text-body-sm text-on-surface-variant -mt-4">
        {busqueda || filtroEstado
          ? `${estudiantesFiltrados.length} de ${estudiantes.length} ${estudiantes.length === 1 ? 'estudiante' : 'estudiantes'} encontrado${estudiantesFiltrados.length !== 1 ? 's' : ''}`
          : `${estudiantes.length} ${estudiantes.length === 1 ? 'estudiante' : 'estudiantes'} en total`}
      </p>

      {/* Listado */}
      {estudiantesFiltrados.length === 0 ? (
        <div className="bg-background rounded-xl border border-outline-variant shadow-sm px-4 py-10 text-center font-body text-body-sm text-on-surface-variant">
          {busqueda
            ? 'No se encontraron estudiantes que coincidan con la búsqueda.'
            : 'No hay estudiantes registrados.'}
        </div>
      ) : (
        <>
          {/* Vista escritorio: tabla */}
          <div className="hidden lg:block bg-background rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estudiante</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">DNI</th>
                  <th className="text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Estado</th>
                  <th className="w-full"></th>
                  <th className="w-28 text-left px-4 py-3 font-label text-label-md text-on-surface-variant whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {estudiantesFiltrados.map(est => (
                  <tr key={est.id} className="hover:bg-surface-container-high transition-colors duration-150">
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface font-medium whitespace-nowrap">{est.apellido}, {est.nombre}</td>
                    <td className="px-4 py-3 font-body text-body-sm text-on-surface-variant whitespace-nowrap">{est.dni}</td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={est.estado} />
                    </td>
                    <td></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-xs">
                        <button
                          onClick={() => navigate(`/trayectorias-estudiantiles/estudiantes/${est.id}`)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title="Ver detalle"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleAbrirEdicion(est.id)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                        </button>
                        <button
                          onClick={() => setEstudianteAEliminar(est.id)}
                          className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <div className="px-md py-sm bg-surface-container border-t border-outline-variant">
              <p className="font-body text-body-sm text-on-surface-variant">
                {estudiantesFiltrados.length}{' '}
                {estudiantesFiltrados.length === 1 ? 'estudiante' : 'estudiantes'}
                {busqueda && ` encontrado${estudiantesFiltrados.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Vista mobile/tablet: cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {estudiantesFiltrados.map(est => (
              <div
                key={est.id}
                className="bg-background rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-body text-body-sm text-on-surface font-medium">{est.apellido}, {est.nombre}</p>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5">DNI {est.dni}</p>
                  </div>
                  <div className="flex items-center gap-xs flex-wrap shrink-0">
                    <button
                      onClick={() => navigate(`/trayectorias-estudiantiles/estudiantes/${est.id}`)}
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                      title="Ver detalle"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">visibility</span>
                    </button>
                    <button
                      onClick={() => handleAbrirEdicion(est.id)}
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors duration-150"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">edit</span>
                    </button>
                    <button
                      onClick={() => setEstudianteAEliminar(est.id)}
                      className="cursor-pointer p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors duration-150"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[1.25rem]">delete</span>
                    </button>
                  </div>
                </div>
                <div className="border-t border-outline-variant pt-3">
                  <EstadoBadge estado={est.estado} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal edición */}
      {modalAbierto && (
        <EstudianteModal
          modoEdicion={modoEdicion}
          form={form}
          errores={errores}
          erroresContactos={erroresContactos}
          onClose={cerrarModal}
          onGuardar={handleGuardar}
          onChange={handleChange}
          onContactoChange={handleContactoChange}
          onAgregarContacto={agregarContacto}
          onEliminarContacto={eliminarContacto}
        />
      )}

      {/* Modal confirmación de eliminación */}
      {estudianteAEliminar !== null && (
        <ConfirmEliminar
          onConfirmar={handleEliminar}
          onCancelar={() => setEstudianteAEliminar(null)}
        />
      )}

    </div>
  );
}

export default GestionEstudiantes;
