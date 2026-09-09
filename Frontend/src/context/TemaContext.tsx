// ─────────────────────────────────────────────────────────────────────────────
// ¿Qué es useContext y por qué lo usamos acá?
//
// El problema sin context:
//   Para que el Topbar comparta su tema (oscuro/claro) con cualquier otro
//   componente, habría que "pasar props" nivel por nivel:
//   App → Layout → Topbar (lo maneja) ← pero Sidebar también lo necesita...
//   entonces habría que subirlo a App y pasarlo para abajo por dos ramas.
//   Eso se llama "prop drilling" y se vuelve difícil de mantener.
//
// La solución — useContext funciona con tres piezas:
//
//   1. createContext()
//      Crea el "canal de comunicación". Define qué forma tendrán los datos
//      que se van a compartir. Es como instalar un enchufe en la pared.
//      (definido en hooks/useTema.ts, junto con el hook useTema())
//
//   2. <Provider value={...}>
//      Envuelve el árbol de componentes y pone el valor actual en el canal.
//      Cualquier componente DENTRO del Provider puede leerlo.
//      Cuando el valor cambia, todos los suscriptores se re-renderizan.
//      Es como conectar el cable a ese enchufe.
//
//   3. useContext(MiContexto)  —  o un hook personalizado como useTema()
//      Dentro de cualquier componente descendiente, lee el valor del canal
//      sin que nadie se lo haya pasado como prop.
//      Es como enchufar un dispositivo a la pared.
//
// Flujo visual de este contexto:
//
//   <TemaProvider>              ← "enchufe": pone { esOscuro, cambiarTema }
//     <App>
//       <Layout>
//         <Topbar />            ← useTema() lee y cambia el tema
//         <Sidebar />           ← podría leer esOscuro si lo necesitara
//         <main>...</main>
//       </Layout>
//     </App>
//   </TemaProvider>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from 'react';
import { TemaContext } from '../hooks/useTema';

// ── Provider ──────────────────────────────────────────────────────────────────
// Este componente envuelve toda la app y es quien "posee" el estado del tema.
// Al moverlo aquí desde Topbar, el tema queda disponible para cualquier
// componente del árbol, sin importar cuán profundo esté.

export function TemaProvider({ children }: { children: ReactNode }) {
  // Inicialización lazy (función): se ejecuta solo una vez en el primer render,
  // leyendo el estado real del DOM antes de que aparezca cualquier componente.
  // Esto evita el "flash" de tema incorrecto al cargar la página.
  const [esOscuro, setEsOscuro] = useState<boolean>(
    () => document.documentElement.classList.contains('dark')
  );

  const cambiarTema = () => {
    const el = document.documentElement;
    el.classList.add('theme-switching');
    // Fuerza un reflow sincrónico: el navegador recalcula estilos ahora,
    // estableciendo las reglas de transición ANTES de que cambien los colores.
    // Sin esto, theme-switching y dark se aplican en el mismo recálculo
    // y no hay estado "previo" desde el que animar.
    void el.offsetHeight;
    el.classList.toggle('dark', !esOscuro);
    setEsOscuro(prev => !prev);
    setTimeout(() => el.classList.remove('theme-switching'), 300);
  };

  // El Provider pone el valor en el canal. Todos los componentes dentro de
  // {children} podrán leerlo con useContext o con el hook useTema().
  return (
    <TemaContext.Provider value={{ esOscuro, cambiarTema }}>
      {children}
    </TemaContext.Provider>
  );
}
