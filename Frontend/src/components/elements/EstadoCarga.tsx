interface EstadoCargaProps {
  loading: boolean;
  error: string | null;
}

function EstadoCarga({ loading, error }: EstadoCargaProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-outline-variant bg-error-container p-4 text-error font-body text-body-sm">
        Error al cargar los datos: {error}
      </div>
    );
  }
  return null;
}

export default EstadoCarga;
