interface CampoDetalleProps {
  label: string;
  value: string | number;
}

function CampoDetalle({ label, value }: CampoDetalleProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-label text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body text-body-sm text-on-surface font-medium break-words">{value || '—'}</span>
    </div>
  );
}

export default CampoDetalle;
