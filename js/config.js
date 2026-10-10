/* =========================================================
   ProteínaSmart — config.js
   CONFIGURACIÓN DEFINE. Este es el único archivo que tocás
   para cambiar contacto, envíos, textos de marca y tracking.
   ========================================================= */

window.PS_CONFIG = {
  marca: {
    nombre: 'ProteínaSmart',
    dominio: 'proteinasmart.com',
    claim: 'Proteína inteligente',
    bajada: 'Tu marketplace de proteínas para la salud, la belleza y la longevidad.',
  },

  contacto: {
    responsable: 'Oscar Amarilla',
    telefonoLocal: '0985 864 209',
    // Formato internacional sin "+" ni espacios (wa.me lo exige)
    whatsapp: '595985864209',
    email: 'hola@proteinasmart.com',
    ruc: '4499507-5',
    ciudad: 'Asunción, Paraguay',
  },

  operacion: {
    // Se muestran en la barra de confianza y en el FAQ.
    // Envío incluido en el precio desde octubre de 2026 -- si esto vuelve a
    // "a confirmar", hay que revertir también checkout.shippingFee a null y
    // los precios de js/catalog.js, que hoy llevan el envío adentro.
    envioAsuncion: 'Envío gratis a tu puerta en Asunción y Gran Asunción',
    envioInterior: 'Envío incluido al interior por encomienda, a cualquier ciudad del país',
    despacho: 'Despachamos el mismo día los pedidos confirmados antes de las 14:00, de lunes a sábado',
    // Empresas con las que se despacha al interior. La lista operativa y
    // editable vive en Supabase (courier_companies); estas son las que se
    // nombran en el sitio.
    encomiendas: [
      'Transruta',
      'Paraná Express',
      'La Guaireña',
      'TSI Transportadora San Ignacio',
      'La Misionera',
      'Occidental Express',
    ],
    pagos: 'Transferencia bancaria, Tigo Money, Personal Pay y efectivo',
    facturacion: 'Factura legal con RUC en todos los pedidos',
    horario: 'Lunes a sábado, 08:00 a 19:00',
  },

  checkout: {
    // 0 = el envío ya está incluido en el precio de cada producto de
    // js/catalog.js. Tarifa verificada por el negocio en octubre de 2026 al
    // pasar a envío incluido; null vuelve a "Envío a confirmar".
    shippingFee: 0,
    bancard: { enabled: false }, // Sin SDK, endpoint ni credenciales en el cliente.
  },

  // Mensaje base del checkout por WhatsApp
  mensajes: {
    consultaGeneral:
      'Hola ProteínaSmart 👋 Quiero asesoramiento para elegir mi proteína.',
    pedidoPrefijo: 'Hola ProteínaSmart 👋 Quiero pedir:',
  },

  // Dejá los IDs vacíos hasta tenerlos: si están vacíos, no se cargan scripts.
  tracking: {
    ga4: '',        // ej: 'G-XXXXXXXXXX'
    metaPixel: '',  // ej: '1234567890'
  },

  // Opcional: si quedan vacías, el catálogo local (PS_CATALOG) sigue
  // operando sin downtime -- fetchCatalog() cae ahí ante cualquier fallo.
  supabaseUrl: '',
  supabaseAnonKey: '', // acepta anon key legacy o publishable key (sb_publishable_...)

  // Forma anidada previa, todavía soportada por fetchCatalog() por compatibilidad.
  supabase: {
    url: '',
    anonKey: '',
  },

  // Endpoint del formulario de asesoría (Formspree, n8n, Supabase Edge Function…)
  // Si queda vacío, el formulario deriva el lead a WhatsApp automáticamente.
  formEndpoint: '',
};
