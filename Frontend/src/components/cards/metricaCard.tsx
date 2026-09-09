export interface Metrica {
  id: number;
  titulo: string;
  valor: string | number;
  icono: string;
  claseFondo: string;
  claseTexto: string;
}

export interface MetricaCardProps {
  metricas: Metrica[];
}

function MetricaCard({ metricas }: MetricaCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md">
      {metricas.map((metrica) => (
        <div key={metrica.id} className="bg-background p-md rounded-xl border border-outline-variant shadow-sm flex items-center gap-md">
          <div className={`p-sm rounded-lg ${metrica.claseFondo} ${metrica.claseTexto}`}>
            <span className="material-symbols-outlined">{metrica.icono}</span>
          </div>
          <div>
            <p className="font-body text-body-sm text-on-surface-variant">
              {metrica.titulo}
            </p>
            <p className="font-headline text-headline-md text-on-surface">
              {metrica.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MetricaCard;