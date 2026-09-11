# Modelo de producto

`Product` tiene identidad, URL estable, categoría, descripción neutral, presentación, precio, stock, timestamps, objetivos y campos opcionales de información nutricional. La ausencia de un campo significa “pendiente de confirmar”, no un valor por defecto.

`productCompleteness()` expone el estado de precio, presentación, nutrición, imagen y trazabilidad para la UI y para auditorías internas.

## Completitud y publicación

`getProductCompleteness()` evalúa 22 campos sin completar valores ausentes. Los niveles son `DRAFT`, `PUBLISHABLE`, `VERIFIED` y `COMPLETE`. Un producto publicable puede mostrar un precio o disponibilidad pendientes de confirmar; eso no los convierte en datos confirmados.

## Elegibilidad

`RecommendationStatus` distingue `PRIMARY_ELIGIBLE`, `OPTIONAL_ELIGIBLE`, `CATALOG_ONLY` y `MANUAL_REVIEW`. La coincidencia con una categoría o prioridad nunca basta: `evaluateProductEligibility()` también exige actividad, publicación, precio y disponibilidad confirmados, formulación mínima, evidencia de autenticidad y habilitación explícita para el rol.
