-- Primer producto real de ProteinaSmart.
-- Ejecutar despues de supabase/schema.sql en el SQL Editor de Supabase.

insert into public.productos (
  nombre,
  descripcion,
  precio,
  unidad_medida,
  proveedor,
  es_refrigerado,
  etiquetas
)
values (
  'Queso Paraguay Cremoso',
  'Queso fresco tradicional, ideal para desayunos clean o recetas locales.',
  30000,
  'kg',
  'San Cristobal Quesos',
  true,
  array['Fresco', 'Tradicional']::text[]
);
