# Smart Quiz y Smart Profile

El motor puro está en `web/lib/smart-quiz/engine.ts`; la interfaz en
`web/components/smart-quiz/SmartQuizV2.tsx`. El presupuesto solo resuelve
`ESSENTIAL`, `LITE`, `CORE` o `FULL`; nunca cambia el stack fisiológico.

Una bandera de seguridad devuelve `REVIEW_REQUIRED` sin productos recomendados.
La interfaz no pide ni persiste diagnósticos o detalles clínicos.

## Smart Profile

`web/lib/smart-quiz/profile.ts` convierte el resultado del Quiz en un perfil
completo: objetivo, frecuencia, experiencia, protocolo, tier, prioridades
sugeridas, opcionales, lo que queda para más adelante, lo que no recomendamos y
**una razón breve por cada decisión** (`decisions`). Lo renderiza
`components/smart-profile/SmartProfileView.tsx`.

- `parseQuizParams()` valida los parámetros de la URL; si falta lo mínimo,
  devuelve `null` y la página invita a rehacer el Quiz.
- El perfil resuelve el protocolo con `{ safety: { status: "CLEARED", flags: [] } }`:
  el Quiz sin banderas es el único contexto individual que el sistema puede
  afirmar hoy. Ver `docs/SMART_PROTOCOLS.md`.
- `/quiz/resultado` va con `robots: noindex` porque el contenido depende de los
  parámetros de cada persona.

## WhatsApp

`buildProfileWhatsAppMessage()` arma el mensaje con objetivo, entrenamiento,
protocolo y nivel. No incluye nombre, teléfono, respuestas de seguridad ni el
estado del gate. Con `REVIEW_REQUIRED` el mensaje solo pide una revisión humana.
