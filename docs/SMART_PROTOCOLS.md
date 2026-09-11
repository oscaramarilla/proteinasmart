# Smart Protocols

Un protocolo describe **prioridades**, nunca productos. La única forma de
llegar a un SKU es la cadena:

```
prioridad --(roles)--> candidatos del catálogo --(elegibilidad)--> recomendación
```

Ninguna definición de protocolo nombra una marca ni un producto. Si el catálogo
cambia, los protocolos no se tocan.

## Piezas

| Archivo | Rol |
|---|---|
| `web/lib/smart-protocols/types.ts` | Modelo: prioridad, nivel, exclusión, SmartCheck |
| `web/lib/smart-protocols/definitions.ts` | Contenido editorial de los 4 protocolos |
| `web/lib/smart-protocols/resolve.ts` | Resolver: prioridades → productos + motivos |
| `web/lib/products.ts` | `ProductRole` y la tabla `productRoles` (relación SKU ↔ rol) |
| `web/lib/product-eligibility.ts` | Gate de aprobación (precio, stock, formulación, safety) |

## Niveles de prioridad

- `required` — base del protocolo.
- `conditional` — entra solo si se cumple `condition` (texto obligatorio).
- `optional` — nunca es necesaria; se suma de a una y con motivo.

Ejemplo (Smart Muscle):

```
required:    CREATINE        roles: [CREATINE]
conditional: PROTEIN_GAP     roles: [PROTEIN_GAP]   condition: "si con comida no llegás…"
optional:    EAA             roles: [EAA]
exclusiones: RECOVERY_AMINO, COLLAGEN (con motivo visible en la página)
```

## Relación `SmartProtocol` ↔ `Product`

`productRoles` en `web/lib/products.ts` es el **único** lugar del código donde
un SKU se asocia a un rol funcional; espeja la tabla `product_roles` que va a
Supabase en el cutover. Las prioridades declaran roles; `productsByRole()`
devuelve los productos activos que los cumplen.

Las exclusiones (`redundancies`) también se expresan por rol: cualquier
producto con un rol excluido queda fuera de todas las prioridades del
protocolo y se muestra en “Lo que no recomendamos” con su motivo.

## Elegibilidad: descubrir no es aprobar

Un candidato por rol **no** es una recomendación. `evaluateProductEligibility`
decide, y falla cerrada: exige precio y stock confirmados con timestamp,
formulación e ingredientes verificados, evidencia de autenticidad, proveedor,
aprobación vigente para ese producto + prioridad + protocolo + rol, y un
contexto de seguridad individual.

Consecuencias visibles hoy:

- En `/protocolos/[slug]` (página pública, sin contexto individual) no se
  recomiendan productos: se muestran las prioridades y se deriva al Quiz o a
  WhatsApp.
- En `/quiz/resultado`, el Quiz sin banderas aporta el contexto
  (`{ status: "CLEARED", flags: [] }`), pero mientras el catálogo no tenga
  datos confirmados el resultado sigue siendo cero productos, con el motivo
  explícito. Es la conducta correcta, no un bug.

## Presupuesto

`tierPolicy()` decide **cuántas** prioridades entran hoy, nunca cuál es el
protocolo: `ESSENTIAL` solo `required`; `LITE` suma `conditional`; `CORE` y
`FULL` incluyen `optional`. Lo que queda afuera se muestra como “para más
adelante”, no desaparece.

## Safety Gate

Una bandera de seguridad devuelve `REVIEW_REQUIRED`: sin protocolo, sin
productos y sin explicaciones que parezcan un diagnóstico. El componente
`components/SafetyGate.tsx` es el mismo en protocolos y en el resultado.

## SmartCheck

`smartCheck` son puntos de revisión (día, foco, pregunta) por protocolo. Hoy es
contenido: no hay automatización ni reposición automática. Ver
`docs/REORDER_ENGINE.md`.
