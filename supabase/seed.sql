-- ============================================================
-- ProteinaSmart: datos iniciales para Supabase/PostgreSQL.
-- Ejecutar despues de supabase/schema.sql en el SQL Editor completo.
-- El contrato coincide con js/catalog.js y con adaptarProducto en js/data-source.js.

insert into public.categorias(nombre, slug)
values
  ('Proteínas', 'proteinas'),
  ('Deportivos', 'deportivos'),
  ('Keto / Low carb', 'keto'),
  ('Salud & Longevidad', 'longevidad');

insert into public.productos (
  nombre,
  descripcion,
  precio,
  unidad_medida,
  categoria,
  objetivos,
  disciplinas,
  imagen,
  stock,
  protocolo,
  complemento,
  etiquetas
)
values
  (
    'Whey Protein Isolate',
    '27 g de proteína por scoop, sin lactosa y con carga glucémica mínima.',
    360000,
    '2 lb · 27 servicios',
    'proteinas',
    array['masa', 'definicion']::text[],
    array['healthy-habits', 'low-carb']::text[],
    null,
    true,
    'Ganar masa',
    'Creatina + EAA',
    array['Más vendido']::text[]
  ),
  (
    'Whey Protein Concentrada',
    'El mejor costo por gramo de proteína para volumen sostenido.',
    480000,
    '5 lb · 68 servicios',
    'proteinas',
    array['masa']::text[],
    array['healthy-habits', 'low-carb']::text[],
    null,
    true,
    'Ganar masa',
    'Creatina + EAA',
    '{}'::text[]
  ),
  (
    'Proteína Vegetal (arveja + arroz)',
    'Perfil de aminoácidos completo, sin lácteos ni gluten. Digestión liviana.',
    295000,
    '1 kg · 30 servicios',
    'proteinas',
    array['definicion', 'masa']::text[],
    array['healthy-habits', 'low-carb']::text[],
    null,
    true,
    'Bajar grasa / Definir',
    'EAA + Aceite MCT',
    '{}'::text[]
  ),
  (
    'Colágeno Hidrolizado + Vitamina C',
    'Péptidos tipo I y III para piel, cabello, uñas y articulaciones.',
    245000,
    '300 g · 30 servicios',
    'proteinas',
    array['belleza']::text[],
    array['healthy-habits', 'low-carb']::text[],
    null,
    true,
    'Belleza & longevidad',
    'Omega 3 + Vitamina D3+K2',
    array['Belleza & longevidad']::text[]
  ),
  (
    'Creatina Monohidratada Micronizada',
    'El suplemento con más evidencia: fuerza, masa magra y función cognitiva.',
    265000,
    '300 g · 100 servicios',
    'deportivos',
    array['masa', 'foco', 'energia']::text[],
    array['healthy-habits']::text[],
    null,
    true,
    'Ganar masa',
    'Whey Protein + EAA',
    array['Base de todo']::text[]
  ),
  (
    'Pre-Entreno sin azúcar',
    'Cafeína, beta-alanina y citrulina. Cero carbohidratos, apto keto.',
    285000,
    '300 g · 30 servicios',
    'deportivos',
    array['energia', 'foco']::text[],
    array['healthy-habits']::text[],
    null,
    true,
    'Energía sostenida',
    'Aceite MCT + Vitamina D3+K2',
    '{}'::text[]
  ),
  (
    'Aminoácidos Esenciales (EAA)',
    'Protege masa muscular durante el ayuno y los déficits calóricos.',
    215000,
    '400 g · 40 servicios',
    'deportivos',
    array['definicion', 'masa']::text[],
    array['healthy-habits']::text[],
    null,
    true,
    'Bajar grasa / Definir',
    'Whey Protein Vegetal + MCT',
    '{}'::text[]
  ),
  (
    'L-Glutamina',
    'Recuperación muscular e integridad intestinal en entrenamientos exigentes.',
    175000,
    '300 g · 60 servicios',
    'deportivos',
    array['definicion']::text[],
    array['healthy-habits']::text[],
    null,
    true,
    'Recuperación muscular',
    'Whey Protein + Creatina',
    '{}'::text[]
  ),
  (
    'Aceite MCT C8/C10',
    'Energía cetónica inmediata sin picos de insulina. Ideal en el café matinal.',
    215000,
    '500 ml',
    'keto',
    array['energia', 'foco']::text[],
    array['keto', 'low-carb']::text[],
    null,
    true,
    'Energía sostenida',
    'Vitamina D3+K2 + Pre-entreno',
    array['Keto esencial']::text[]
  ),
  (
    'Barras Keto (caja x 12)',
    'Snack real para cortar el hambre sin romper la cetosis.',
    169000,
    '12 u · 2 g carbos netos',
    'keto',
    array['definicion']::text[],
    array['keto', 'low-carb']::text[],
    null,
    true,
    'Keto / Low carb',
    'Aceite MCT + Sustituto de Comida',
    '{}'::text[]
  ),
  (
    'Sustituto de Comida Low Carb',
    'Comida completa en 400 kcal: proteína, grasas buenas y fibra.',
    299000,
    '1 kg · 20 servicios',
    'keto',
    array['definicion']::text[],
    array['keto', 'low-carb']::text[],
    null,
    true,
    'Keto / Low carb',
    'Aceite MCT + Proteína Vegetal',
    '{}'::text[]
  ),
  (
    'Endulzante Monk Fruit + Eritritol',
    'Cero índice glucémico, sin regusto. Reemplazo directo del azúcar.',
    99000,
    '250 g',
    'keto',
    array['definicion']::text[],
    array['keto', 'low-carb']::text[],
    null,
    true,
    'Keto / Low carb',
    'Aceite MCT + Barras Keto',
    '{}'::text[]
  ),
  (
    'Omega 3 Ultra (EPA/DHA)',
    'DHA de alta concentración: membrana neuronal, memoria y antiinflamación.',
    199000,
    '120 cápsulas',
    'longevidad',
    array['foco', 'belleza']::text[],
    array['neuroplasticidad', 'healthy-habits']::text[],
    null,
    true,
    'Foco y claridad mental',
    'Magnesio Glicinato + Nootrópico Focus',
    array['Neuroplasticidad']::text[]
  ),
  (
    'Magnesio Glicinato',
    'Sueño profundo y recuperación nerviosa. La forma que sí se absorbe.',
    195000,
    '120 cápsulas',
    'longevidad',
    array['foco', 'energia']::text[],
    array['neuroplasticidad', 'healthy-habits']::text[],
    null,
    true,
    'Foco y claridad mental',
    'Omega 3 + Nootrópico Focus',
    '{}'::text[]
  ),
  (
    'Vitamina D3 + K2',
    'Hueso, inmunidad y testosterona. El déficit más común y más barato de corregir.',
    175000,
    '90 cápsulas',
    'longevidad',
    array['belleza', 'energia']::text[],
    array['neuroplasticidad', 'healthy-habits']::text[],
    null,
    true,
    'Energía sostenida',
    'Aceite MCT + Omega 3',
    '{}'::text[]
  ),
  (
    'Nootrópico Focus (L-teanina + colina)',
    'Concentración sostenida sin ansiedad ni bajón posterior.',
    199000,
    '60 cápsulas',
    'longevidad',
    array['foco']::text[],
    array['neuroplasticidad', 'healthy-habits']::text[],
    null,
    true,
    'Foco y claridad mental',
    'Omega 3 + Magnesio Glicinato',
    array['Nuevo']::text[]
  );
-- ============================================================
-- Reventa BRASA MONTE. Bloque aparte porque estos SI declaran `marca`:
-- es el dato que se anuncia, a diferencia del resto del catalogo.
-- Precio = PVP de BRASA MONTE, sin recargo (igualamos su precio).
-- Vida util de 2 a 4 semanas en la carne seca: va contra pedido, nunca
-- con stock comprado. Ver docs/brasamonte-reventa.md.
-- Espeja los SKU de js/catalog.js; si cambia uno, cambian los dos.
-- ============================================================
insert into public.productos (
  nombre, descripcion, precio, unidad_medida, categoria, marca,
  objetivos, disciplinas, imagen, stock, protocolo, complemento, etiquetas
)
values
  (
    'Carne Seca Original (Beef Jerky)',
    'Carne de res del Chaco marinada y secada, lista para comer. Cero azúcar.',
    99000, '200 g · marinado', 'proteinas', 'BRASA MONTE',
    array['masa', 'definicion']::text[],
    array['healthy-habits', 'low-carb']::text[],
    null, true, 'Alimentación real', 'Whey Protein + Aceite MCT',
    array['Comida real']::text[]
  ),
  (
    'Carne Seca Tipo Cecina',
    'Dos ingredientes: carne y sal. Sin marinar, sin conservantes, cero azúcar.',
    99000, '200 g · solo carne y sal', 'proteinas', 'BRASA MONTE',
    array['masa', 'definicion']::text[],
    array['healthy-habits', 'low-carb']::text[],
    null, true, 'Alimentación real', 'Whey Protein + Aceite MCT',
    '{}'::text[]
  ),
  (
    'Carne Seca Original (Beef Jerky)',
    'El formato para probar o llevar al entrenamiento. Cero azúcar.',
    39000, '75 g · marinado', 'proteinas', 'BRASA MONTE',
    array['definicion']::text[],
    array['healthy-habits', 'low-carb']::text[],
    null, true, 'Alimentación real', 'Barras Keto + Aceite MCT',
    '{}'::text[]
  ),
  (
    'Ghee (manteca clarificada)',
    'Manteca pura sin sólidos lácteos. Para cocinar y freír, sin lactosa.',
    49000, '200 ml', 'keto', 'BRASA MONTE',
    array['energia', 'foco']::text[],
    array['low-carb', 'healthy-habits']::text[],
    null, true, 'Keto / Low carb', 'Aceite MCT + Endulzante Monk Fruit',
    array['Keto esencial']::text[]
  );

-- ============================================================
-- Reventa SANA LIFE PY. Igual que BRASA MONTE, estos declaran `marca`.
-- PRECIO: el PUBLICADO por Sana Life al 28/10/2026, NO un costo mayorista.
-- Mientras no haya precio de compra confirmado, se venden sin margen
-- conocido -- ver docs/sana-life-nichos.md.
-- Espeja los SKU de js/catalog.js; si cambia uno, cambian los dos.
-- ============================================================
insert into public.productos (
  nombre, descripcion, precio, unidad_medida, categoria, marca,
  objetivos, disciplinas, imagen, stock, protocolo, complemento, etiquetas
)
values
  (
    'Multivitamínico Hombre',
    'Fórmula multivitamínica diaria. Consultá la composición y la etiqueta del fabricante.',
    250000, 'Opti-Men · 90 cápsulas', 'longevidad', 'Optimum Nutrition',
    array['energia', 'masa']::text[],
    array['healthy-habits']::text[],
    null, true, 'Base diaria', 'Vitamina D3+K2 + Zinc',
    '{}'::text[]
  ),
  (
    'Multivitamínico Mujer',
    'Fórmula multivitamínica diaria. Consultá la composición y la etiqueta del fabricante.',
    180000, 'Opti-Women · 60 cápsulas', 'longevidad', 'Optimum Nutrition',
    array['energia', 'belleza']::text[],
    array['healthy-habits']::text[],
    null, true, 'Base diaria', 'Vitamina C + Zinc',
    '{}'::text[]
  ),
  (
    'Vitamina C 1000 mg',
    '1000 mg por cápsula. Consultá la composición y la etiqueta del fabricante.',
    150000, '100 cápsulas', 'longevidad', 'NOW',
    array['belleza', 'energia']::text[],
    array['healthy-habits']::text[],
    null, true, 'Base diaria', 'Zinc + Vitamina D3+K2',
    '{}'::text[]
  ),
  (
    'Zinc 50 mg',
    '50 mg por cápsula. Consultá la composición y la etiqueta del fabricante.',
    120000, '100 cápsulas', 'longevidad', 'NOW',
    array['energia', 'belleza']::text[],
    array['healthy-habits']::text[],
    null, true, 'Base diaria', 'Vitamina C + Vitamina D3+K2',
    array['El más accesible']::text[]
  ),
  (
    'Ashwagandha KSM-66',
    'Extracto KSM-66 de raíz. Consultá la composición y la etiqueta del fabricante.',
    230000, '60 cápsulas', 'longevidad', 'Horbaach',
    array['foco', 'energia']::text[],
    array['healthy-habits']::text[],
    null, true, 'Descanso y estrés', 'Magnesio Glicinato',
    array['Nuevo']::text[]
  ),
  (
    'Melena de León en polvo',
    'Hongo melena de león en polvo. Consultá la composición y la etiqueta del fabricante.',
    250000, '113 servicios', 'longevidad', 'Nutricost',
    array['foco']::text[],
    array['healthy-habits']::text[],
    null, true, 'Foco y claridad mental', 'Nootrópico Focus + Omega 3',
    array['Nuevo']::text[]
  ),
  (
    'Whey Protein (gama de entrada)',
    'Proteína de suero para empezar, al menor costo por envase del catálogo.',
    270000, 'Wheyshake · 900 g', 'proteinas', 'LanderFit',
    array['masa', 'definicion']::text[],
    array['healthy-habits']::text[],
    null, true, 'Ganar masa', 'Creatina Monohidratada',
    '{}'::text[]
  ),
  (
    'Creatina Monohidratada (60 servicios)',
    'Creatina monohidratada en su presentación más accesible.',
    200000, '60 servicios', 'deportivos', 'Nutrex',
    array['masa', 'energia']::text[],
    array['healthy-habits']::text[],
    null, true, 'Ganar masa', 'Whey Protein',
    '{}'::text[]
  );
