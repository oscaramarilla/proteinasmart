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
    // Se muestran en la barra de confianza y en el FAQ
    envioAsuncion: 'Envíos en Asunción y Gran Asunción: plazo y costo a confirmar',
    envioInterior: 'Envíos al interior por encomienda: plazo y costo a confirmar',
    pagos: 'Transferencia bancaria, Tigo Money, Personal Pay y efectivo',
    facturacion: 'Factura legal con RUC en todos los pedidos',
    horario: 'Lunes a sábado, 08:00 a 19:00',
  },

  checkout: {
    shippingFee: null, // PYG; null = Envío a confirmar. 0 solo con tarifa verificada.
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
