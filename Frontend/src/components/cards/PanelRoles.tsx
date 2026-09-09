import type { Rol } from '../../types/Rol';

interface PanelRolesProps {
  roles: Rol[];
  selectedRolId: string;
  onSelectRol: (id: string) => void;
}

function PanelRoles({ roles, selectedRolId, onSelectRol }: PanelRolesProps) {
  return (
    <div className="w-full md:w-1/3 p-4 flex flex-col gap-3 bg-surface-container/30">
      <h3 className="font-label text-label-md text-on-surface font-semibold">Roles Institucionales</h3>

      <div className="flex flex-col gap-2 max-h-[220px] md:max-h-[340px] overflow-y-auto pr-1 scrollbar-custom">
        {roles.map(rol => {
          const isSelected = rol.id === selectedRolId;
          return (
            <button
              key={rol.id}
              type="button"
              onClick={() => onSelectRol(rol.id)}
              className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-secondary-container text-on-secondary-container border-outline-variant shadow-xs'
                  : 'bg-surface-container-high hover:bg-surface-variant text-on-surface-variant border-transparent'
              }`}
            >
              <span className="font-body text-body-sm font-semibold truncate">{rol.nombre}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PanelRoles;
