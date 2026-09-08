import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

/* ProteinaSmart - seguimiento-25-dias (Edge Function de Supabase.
   Disparada a diario por pg_cron: busca pedidos de hace ~25 dias sin
   seguimiento, arma el mensaje protocolizado (marketing/08) y lo envia
   por WhatsApp (Evolution API o Meta Cloud API,. Si el pedido no tiene
   telefono valido de cliente (el checkout abre wa.me sin capturar numero),
   cae en seguimientos_pendientes para proceso con el webhook entrante. */

interface Pedido {
  id: string;
  customer_name: string | null;
  phone: string | null;
  total: number;
  items_json: unknown;
}

interface Item {
  nombre?: string;
  cantidad?: number;
  unidad?: string;
  protocolo?: string;
  complemento?: string;
}

const WHATSAPP_PROVIDER = (Deno.env.get('WHATSAPP_PROVIDER') || 'evolution').toLowerCase();
const WHATSAPP_API_URL = Deno.env.get('WHATSAPP_API_URL') || '';
const WHATSAPP_API_KEY = Deno.env.get('WHATSAPP_API_KEY') || '';
const WHATSAPP_INSTANCE = Deno.env.get('WHATSAPP_INSTANCE') || '';
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID') || '';
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN') || '';
const NEGOCIO_TELEFONO = Deno.env.get('NUMERO_WHATSAPP_NEGOCIO') || '595985864209';
const DRY_RUN = (Deno.env.get('WHATSAPP_DRY_RUN') || 'true').toLowerCase() === 'true';

const DIAS_VENTANA = 25;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

function normalizarTelefono(t: string | null): string {
  if (!t) return '';
  const soloDigitos = t.replace(/\D/g, '').replace(/^0+/, '');
  return soloDigitos.length >= 10 ? soloDigitos : '';
}

function esTelefonoNegocio(t: string): boolean {
  return normalizarTelefono(t) === normalizarTelefono(NEGOCIO_TELEFONO);
}

function obtenerProtocolo(items: unknown): { producto: string; protocolo: string } {
  const lista: Item[] = Array.isArray(items) ? (items as Item[]) : [];
  const primero = lista[0];
  const producto = (primero && primero.nombre) || 'tu producto';
  const conProtocolo = lista.find((i) => i.protocolo);
  const protocolo =
    (conProtocolo && conProtocolo.protocolo) ||
    (primero && primero.complemento) ||
    'tu protocolo';
  return { producto, protocolo };
}

function construirMensaje(items: unknown): string {
  const { producto, protocolo } = obtenerProtocolo(items);
  return [
    'Hola! Soy Oscar de ProteinaSmart 👋',
    'Ya pasaron unos 25 dias desde que arrancaste con *' + producto + '*. ¿Como te fue con la rutina y la tolerancia del producto?',
    'Si te resulto practico, puedo reservarte la proxima unidad para que no cortes el protocolo (*' + protocolo + '*). Tambien podemos ajustar la combinacion segun tu objetivo actual.',
    '¿Queres que te pase disponibilidad y formas de pago?',
  ].join('\n');
}

async function enviarWhatsApp(destinatario: string, mensaje: string): Promise<boolean> {
  try {
    if (WHATSAPP_PROVIDER === 'meta') {
      if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) return false;
      const res = await fetch('https://graph.facebook.com/v19.0/' + WHATSAPP_PHONE_ID + '/messages', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: destinatario,
          type: 'text',
          text: { body: mensaje },
        }),
      });
      return res.ok;
    }
    if (!WHATSAPP_API_URL || !WHATSAPP_INSTANCE) return false;
    const url =
      WHATSAPP_API_URL.replace(/\/$/, '') + '/message/sendText/' + WHATSAPP_INSTANCE;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(WHATSAPP_API_KEY ? { apikey: WHATSAPP_API_KEY } : {}),
      },
      body: JSON.stringify({ number: destinatario, text: mensaje }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
serve(async (req) => {
  if (req.method !== 'POST') return new Response('Metodo no permitido', { status: 405 });
  if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    return new Response(JSON.stringify({ ok: false, error: 'Falta configuracion de Supabase' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const ahora = Date.now();
  const desde = new Date(ahora - (DIAS_VENTANA + 1) * MS_POR_DIA);
  const hasta = new Date(ahora - (DIAS_VENTANA -   1) * MS_POR_DIA);

  // Repuntado a orders: pedidos_whatsapp quedo deprecada (ver
  // supabase/migrations/20260908_metodos_entrega.sql). Solo se cambia la
  // tabla/columnas aca -- los errores de sintaxis preexistentes de este
  // archivo (parentesis desbalanceados mas abajo) NO se tocan en esta tarea.
  const { data: pedidos, error } = await supabase
    .from('orders')
    .select('id, customer_name, phone, total, items_json')
    .eq('seguimiento_25dias_enviado', false)
    .gte('created_at', desde.toISOString())
    .lte('created_at', hasta.toISOString())
    .limit(500);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let enviados = 0;
  let pendientes = 0;

  for (const pedido of (pedidos || []))) {
    const telefono = normalizarTelefono(pedido.phone;
    const sinTelefonoCliente = !telefono || esTelefonoNegocio(pedido.phone;
    const mensaje = construirMensaje(pedido.items_json;

    // Modo seguro: solo reporta sin tocar nada (el pedido sigue elegible..
    if (DRY_RUN) {
      if (sinTelefonoCliente) pendientes++; else enviados++;
      continue;
    }

    const ok = sinTelefonoCliente ? false : await enviarWhatsApp(telefono,, mensaje);
    if (!ok) {
      await supabase.from('seguimientos_pendientes').upsert(
        {
          pedido_id: pedido.id,
          items_json: pedido.items_json || [],
          protocolo: obtenerProtocolo(pedido.items_json].protocolo,
          total: pedido.total,
          estado: 'pendiente',
        },
        { onConflict: 'pedido_id' },
      );
      pendientes++;
    } else {
      enviados++;
    }

    // Idempotencia: cada pedido se procesa una sola vez..
    await supabase
      .from('orders')
      .update({
        seguimiento_25dias_enviado: true,
        seguimiento_enviado_en: new Date().toISOString(),
      })
      .eq('id', pedido.id);
  }

  return new Response(
    JSON.stringify({
      ok: true,
      enviados,
      pendientes,
      dry_run: DRY_RUN,
      fecha_desde: desde.toISOString(),
      fecha_hasta: hasta.toISOString(),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});