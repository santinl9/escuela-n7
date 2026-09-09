import { estadoClase } from '../../constants/estadoClases';

interface EstadoBadgeProps {
  estado: string;
  tamano?: 'sm' | 'md';
}

const TAMANOS = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

function EstadoBadge({ estado, tamano = 'sm' }: EstadoBadgeProps) {
  return (
    <span className={`w-fit rounded-full font-label font-medium capitalize ${TAMANOS[tamano]} ${estadoClase(estado)}`}>
      {estado}
    </span>
  );
}

export default EstadoBadge;
