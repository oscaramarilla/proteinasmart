'use server';

import { supabaseAdminRequest } from '../../lib/supabaseAdmin';
import {
  CAMPOS_REQUERIDOS_POR_METODO,
  ES_METODO_ENCOMIENDA,
  ETIQUETAS_CAMPO,
  TIPOS_DOCUMENTO,
  esShippingMethodCode,
  type CampoEntrega,
  type ShippingMethodCode,
} from '../../lib/checkoutEntrega';
import { generarCheckoutWhatsApp } from '../../lib/generarCheckoutWhatsApp';
import { ManualInvoiceIssuer } from '../../lib/invoicing/ManualInvoiceIssuer';
import type { CartItem } from '../../lib/useCartStore';

export type CheckoutState = {
  status: 'idle' | 'error' | 'success';
  errors: Record<string, string>;
  whatsappUrl?: string;
};

export const estadoInicialCheckout: CheckoutState = { status: 'idle', errors: {} };

const ETIQUETAS_METODO: Record<ShippingMethodCode, string> = {
  pickup: 'Retiro en el local',
  delivery_metro: 'Envío en Gran Asunción',
  encomienda_puerta: 'Encomienda — puerta a puerta',
  encomienda_agencia: 'Encomienda — retiro en agencia',
};

function leerItems(raw: FormDataEntryValue | null): CartItem[] {
  if (typeof raw !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== 'object') return false;
      const posible = item as Partial<CartItem>;
      return (
        typeof posible.id === 'string' &&
        typeof posible.nombre === 'string' &&
        typeof posible.unidad === 'string' &&
        typeof posible.precio === 'number' &&
        typeof posible.cantidad === 'number' &&
        posible.cantidad > 0
      );
    });
  } catch {
    return [];
  }
}

function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === 'string' ? valor.trim() : '';
}

export async function procesarCheckout(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const items = leerItems(formData.get('items_json'));
  if (items.length === 0) {
    return { status: 'error', errors: { items: 'El carrito está vacío.' } };
  }

  const total = items.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0);

  const customerName = texto(formData, 'customer_name');
  const phone = texto(formData, 'phone');
  const idempotencyKey = texto(formData, 'idempotency_key');
  const shippingMethodCodeRaw = texto(formData, 'shipping_method_code');
  const fiscalDocumentType = texto(formData, 'fiscal_document_type');
  const fiscalDocumentNumber = texto(formData, 'fiscal_document_number');
  const fiscalBusinessName = texto(formData, 'fiscal_business_name');
  const fiscalEmail = texto(formData, 'fiscal_email');

  const errors: Record<string, string> = {};

  if (!customerName) errors.customer_name = 'Ingresá tu nombre.';
  if (!phone) errors.phone = 'Ingresá tu teléfono / WhatsApp.';
  if (!esShippingMethodCode(shippingMethodCodeRaw)) {
    errors.shipping_method_code = 'Elegí un método de entrega válido.';
  }
  if (!(TIPOS_DOCUMENTO as readonly string[]).includes(fiscalDocumentType)) {
    errors.fiscal_document_type = 'Elegí RUC o CI.';
  }
  if (!fiscalDocumentNumber) errors.fiscal_document_number = 'Ingresá el número de documento.';
  if (!fiscalBusinessName) errors.fiscal_business_name = 'Ingresá la razón social.';
  if (!fiscalEmail || !fiscalEmail.includes('@')) errors.fiscal_email = 'Ingresá un email válido.';

  if (!esShippingMethodCode(shippingMethodCodeRaw)) {
    return { status: 'error', errors };
  }
  const metodo: ShippingMethodCode = shippingMethodCodeRaw;

  const camposEntrega: Record<CampoEntrega, string> = {
    third_party_name: texto(formData, 'third_party_name'),
    third_party_ci: texto(formData, 'third_party_ci'),
    address: texto(formData, 'address'),
    city: texto(formData, 'city'),
    reference: texto(formData, 'reference'),
    department: texto(formData, 'department'),
    destination_city_agency: texto(formData, 'destination_city_agency'),
    recipient_ci: texto(formData, 'recipient_ci'),
    courier_company_id: texto(formData, 'courier_company_id'),
  };

  for (const campo of CAMPOS_REQUERIDOS_POR_METODO[metodo]) {
    if (!camposEntrega[campo]) {
      errors[campo] = `${ETIQUETAS_CAMPO[campo]} es obligatorio para este método de entrega.`;
    }
  }

  // No confiar en el <select> del cliente: revalidar la ciudad contra
  // metro_cities (active=true) en el servidor antes de aceptar la orden.
  if (metodo === 'delivery_metro' && camposEntrega.city && !errors.city) {
    const ciudades = await supabaseAdminRequest<{ name: string }[]>(
      `metro_cities?select=name&active=eq.true&name=eq.${encodeURIComponent(camposEntrega.city)}`,
    );
    if (ciudades.length === 0) {
      errors.city = 'Esa ciudad no está habilitada para envío gratuito en este momento.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors };
  }

  // Idempotencia: un doble click reenvía el mismo idempotency_key generado
  // al montar el formulario. Si ya existe una orden con esa clave, no se
  // crea una segunda orden ni una segunda factura pendiente — se reutiliza
  // la existente y se arma el mismo link de confirmación de nuevo.
  let orderId: string | undefined;
  if (idempotencyKey) {
    const existentes = await supabaseAdminRequest<{ id: string }[]>(
      `orders?select=id&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`,
    );
    orderId = existentes[0]?.id;
  }

  if (!orderId) {
    const [order] = await supabaseAdminRequest<{ id: string }[]>('orders', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        customer_name: customerName,
        phone,
        total,
        items_json: items,
        idempotency_key: idempotencyKey || null,
        shipping_method_code: metodo,
        fiscal_document_type: fiscalDocumentType,
        fiscal_document_number: fiscalDocumentNumber,
        fiscal_business_name: fiscalBusinessName,
        fiscal_email: fiscalEmail,
      }),
    });
    orderId = order.id;

    await supabaseAdminRequest('delivery_details', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        order_id: orderId,
        third_party_name: camposEntrega.third_party_name || null,
        third_party_ci: camposEntrega.third_party_ci || null,
        address: camposEntrega.address || null,
        city: camposEntrega.city || null,
        reference: camposEntrega.reference || null,
        department: camposEntrega.department || null,
        destination_city_agency: camposEntrega.destination_city_agency || null,
        recipient_ci: camposEntrega.recipient_ci || null,
        courier_company_id: camposEntrega.courier_company_id || null,
      }),
    });

    // La venta vale más que el registro: si falla la factura pendiente,
    // la orden ya está guardada y el checkout no falla por esto.
    try {
      await new ManualInvoiceIssuer().issue(orderId);
    } catch (error) {
      console.error('No se pudo crear la factura pendiente para la orden', orderId, error);
    }
  }

  let empresaNombre = '';
  if (camposEntrega.courier_company_id) {
    const empresas = await supabaseAdminRequest<{ name: string }[]>(
      `courier_companies?select=name&id=eq.${encodeURIComponent(camposEntrega.courier_company_id)}`,
    );
    empresaNombre = empresas[0]?.name ?? '';
  }

  const resumenCampos: Record<string, string> = {};
  if (camposEntrega.address) resumenCampos.Dirección = camposEntrega.address;
  if (camposEntrega.city) resumenCampos.Ciudad = camposEntrega.city;
  if (camposEntrega.reference) resumenCampos.Referencia = camposEntrega.reference;
  if (camposEntrega.department) resumenCampos.Departamento = camposEntrega.department;
  if (camposEntrega.destination_city_agency) {
    resumenCampos['Ciudad/agencia destino'] = camposEntrega.destination_city_agency;
  }
  if (camposEntrega.recipient_ci) resumenCampos['CI destinatario'] = camposEntrega.recipient_ci;
  if (empresaNombre) resumenCampos['Empresa de encomienda'] = empresaNombre;
  if (camposEntrega.third_party_name) resumenCampos.Retira = camposEntrega.third_party_name;
  if (camposEntrega.third_party_ci) resumenCampos['CI de quien retira'] = camposEntrega.third_party_ci;

  const whatsappUrl = generarCheckoutWhatsApp(items, total, {
    metodoLabel: ETIQUETAS_METODO[metodo],
    esEncomienda: ES_METODO_ENCOMIENDA[metodo],
    resumenCampos,
  });

  return { status: 'success', errors: {}, whatsappUrl };
}
