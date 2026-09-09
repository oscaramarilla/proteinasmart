> **Contexto del repo:** leé `AGENTS.md` en la raíz antes de hacer cambios.
> Este archivo guarda instrucciones de tarea y pendientes específicos.

Leé la sección "Contexto operativo — entrega y facturación" de CLAUDE.md
y implementá el paso de entrega del checkout según esas reglas.

Alcance de esta tarea:

1. Migración de esquema:
   - `shipping_methods` (config: code, label, enabled, sort_order, copy)
   - `metro_cities` (lista de ciudades con envío gratis, editable)
   - `courier_companies` (empresas de encomienda, editable)
   - campos de entrega en `orders`
   - `delivery_details` (los campos condicionales por método)
   - `invoices` en modo manual

2. Selector de método de entrega con campos condicionales según el método.

3. Validación en el servidor: si el método es `delivery_metro`, la ciudad
   tiene que existir en `metro_cities` y estar activa. Si no está, no se
   crea la orden. No confiar en la validación del cliente.

4. El total de la orden nunca incluye flete de encomienda.

5. El copy de ubicación de CLAUDE.md, en las opciones correspondientes.

No hagas:
- Calculadora ni cotizador de tarifas de envío.
- Integración con API de ninguna empresa de encomiendas.
- Nada relacionado a SIFEN, e-Kuatia o facturación electrónica.
- No inventes ciudades: usá exactamente la lista de CLAUDE.md.

Antes de aplicar la migración, mostrame el SQL para revisarlo.
Cuando termines, listame qué queda sin cubrir.

## Pendiente conocido — carrito no persistente + checkout con RUC

No implementado todavía. Anotado para no perderlo, no para hacerlo ahora.

**El problema:** `useCartStore` (web/lib/useCartStore.ts) no usa `persist` de
Zustand — el carrito vive solo en memoria. El checkout pide RUC/CI, que
mucha gente no tiene de memoria. Secuencia real: el cliente arma el
carrito, llega a datos fiscales, no tiene el RUC a mano, abre otra pestaña
o app para buscarlo, el navegador descarta la pestaña de compra (o el
cliente vuelve más tarde), el carrito está vacío.

**Cuando se implemente, las dos partes van juntas — no por separado:**

1. `persist` con `localStorage` en `useCartStore`, con `skipHydration`
   (o un guard de "ya montó" en los componentes que leen el carrito) para
   evitar el mismatch de hidratación entre el render del servidor y el
   valor persistido del cliente.
2. La clave de idempotencia (hoy generada en `web/app/checkout/page.tsx`,
   una por request del servidor) se muda al store persistido: se genera
   una sola vez por carrito y se limpia en `limpiarCarrito()`.

Si se persiste el carrito sin mover la clave de idempotencia junto, cada
refresh de `/checkout` genera una clave nueva del lado del servidor sobre
el mismo carrito persistido — el servidor ya no reconoce el reintento como
el mismo pedido, y aparecen órdenes (y facturas `pending_manual`)
duplicadas.