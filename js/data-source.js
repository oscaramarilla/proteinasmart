/* El catálogo local ya está visible mientras se intenta la fuente remota.
   Este adaptador no carga SDKs ni reemplaza los datos locales de respaldo. */
(async function iniciarFuenteHibrida() {
  if (typeof window.fetchCatalog !== 'function') return;
  const catalogo = await window.fetchCatalog();
  if (catalogo !== window.PS_CATALOG) {
    window.dispatchEvent(new CustomEvent('ps:catalogo-remoto', { detail: catalogo }));
  }
})();
