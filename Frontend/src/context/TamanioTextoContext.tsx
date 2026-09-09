// Igual que TemaContext, pero en vez de alternar la clase "dark" alterna una
// clase de escala en <html>. Como toda la tipografía y los espaciados del
// sistema están definidos en rem (ver App.css), agrandar el font-size de la
// raíz funciona como un "zoom" real de la interfaz (texto, íconos y padding
// escalan juntos), no solo como texto más grande suelto.

import { useState, type ReactNode } from 'react';
import { TamanioTextoContext, NIVELES_TAMANIO_TEXTO, type TamanioTexto } from '../hooks/useTamanioTexto';

const CLASE_POR_TAMANIO: Record<TamanioTexto, string | null> = {
  'normal': null,
  'grande': 'texto-grande',
  'extra-grande': 'texto-extra-grande',
};

export function TamanioTextoProvider({ children }: { children: ReactNode }) {
  const [tamanio, setTamanio] = useState<TamanioTexto>('normal');

  const aplicar = (nuevo: TamanioTexto) => {
    const el = document.documentElement;
    NIVELES_TAMANIO_TEXTO.forEach(nivel => {
      const clase = CLASE_POR_TAMANIO[nivel];
      if (clase) el.classList.remove(clase);
    });
    const claseNueva = CLASE_POR_TAMANIO[nuevo];
    if (claseNueva) el.classList.add(claseNueva);
    setTamanio(nuevo);
  };

  const moverNivel = (delta: 1 | -1) => {
    const idx = NIVELES_TAMANIO_TEXTO.indexOf(tamanio);
    const siguiente = NIVELES_TAMANIO_TEXTO[idx + delta];
    if (siguiente) aplicar(siguiente);
  };

  return (
    <TamanioTextoContext.Provider
      value={{
        tamanio,
        aumentarTamanio: () => moverNivel(1),
        disminuirTamanio: () => moverNivel(-1),
      }}
    >
      {children}
    </TamanioTextoContext.Provider>
  );
}
