import type { CartItem } from './useCartStore';

const NUMERO_WHATSAPP = '595985864209';

export function generarCheckoutWhatsApp(
  carrito: CartItem[],
  total: number,
) {
  const precioFormateado = new Intl.NumberFormat('es-PY').format(total);
  const itemsFormateados = carrito.map(
    (item) => `- ${item.cantidad}x ${item.nombre} (${item.unidad})`,
  );

  const mensaje = [
    '¡Hola! Quiero confirmar mi pedido en Proteina Smart:',
    '',
    ...itemsFormateados,
    `Total: ${precioFormateado} Gs.`,
    'Por favor, envíame los métodos de pago y coordinamos el envío para Asunción/Lambaré',
  ].join('\n');

  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}
