/* =========================================================
   ProteínaSmart — globales.d.ts
   Declaraciones ambientales para que checkJs entienda los globals
   que catalog.js / cart.js / main.js / pedidos.js comparten vía window.
   ========================================================= */

interface Window {
  fetchCatalog: () => Promise<Array<Record<string, any>>>;
  PS_CONFIG: Record<string, any>;
  PS_CATALOG: Array<Record<string, any>>;
  PS_CATEGORIAS: Array<{ id: string; nombre: string; icono: string }>;
  PS_OBJETIVOS: Array<{ id: string; nombre: string; icono: string }>;
  PS_CART: {
    dispatch: Function;
    getState: () => Record<string, any>;
    subscribe: (listener: Function) => Function;
    reducer: Function;
    total: Function;

  };
  dataLayer: unknown[];
  gtag?: any;
  fbq?: any;
  _fbq?: any;
  va?: any;
}

declare function gtag(...args: unknown[]): void;
declare function fbq(...args: unknown[]): void;

