import type { Permiso } from '../../types/Permiso';
import type { Rol } from '../../types/Rol';

interface PanelPermisosProps {
  rol: Rol;
  permisos: Permiso[];
}

// Solo informativo: muestra qué puede hacer cada rol, sin posibilidad de editar sus permisos.
function PanelPermisos({ rol, permisos }: PanelPermisosProps) {
  const permisosActivos = permisos.filter(p => rol.permisos.includes(p.id)).length;

  return (
    <div className="w-full md:w-2/3 p-6 flex flex-col gap-6">
      <h3 className="font-label text-label-md text-on-surface font-semibold">
        Qué puede hacer: <span className="text-primary">{rol.nombre}</span>
      </h3>

      <ul className="flex flex-col divide-y divide-outline-variant border border-outline-variant rounded-xl overflow-hidden max-h-[340px] overflow-y-auto pr-1 scrollbar-custom bg-background">
        {permisos.map(permiso => {
          const tieneAcceso = rol.permisos.includes(permiso.id);
          return (
            <li key={permiso.id} className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3">
              <span className="font-body text-body-sm text-on-surface">{permiso.descripcion}</span>
              <span
                className={`material-symbols-outlined text-[1.25rem] ${
                  tieneAcceso ? 'text-primary' : 'text-on-surface-variant opacity-40'
                }`}
                title={tieneAcceso ? 'Puede hacerlo' : 'No puede hacerlo'}
              >
                {tieneAcceso ? 'check_circle' : 'remove_circle'}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-3 border-t border-outline-variant">
        <p className="font-body text-body-sm text-on-surface-variant">
          Permisos activos: <strong>{permisosActivos}</strong> de {permisos.length}
        </p>
      </div>
    </div>
  );
}

export default PanelPermisos;
