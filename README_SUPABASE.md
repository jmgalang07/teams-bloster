# Team's Bloster + Supabase

Este proyecto mantiene la UI y las rutas originales, pero los datos base ya no se cargan desde arrays locales: salen de Supabase mediante la API REST y las imágenes se referencian como objetos de Supabase Storage.

## 1. Crear el proyecto en Supabase

1. Entra en Supabase y crea un proyecto llamado `teams-bloster`.
2. Abre **Project Settings > API** y copia:
   - Project URL
   - anon public key
   - service_role key solo para tareas locales de administración, nunca en el frontend.
3. Copia `.env.example` a `.env` y rellena:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
```

La app Vite expone únicamente las variables `NEXT_PUBLIC_*`. `SUPABASE_SERVICE_ROLE_KEY` se usa solo con el script local de subida de assets.

## 2. Ejecutar la base de datos

En Supabase, ve a **SQL Editor** y ejecuta en este orden:

```sql
-- 1
supabase/schema.sql

-- 2
supabase/seed.sql
```

`schema.sql` crea tablas, enums, relaciones, índices, triggers `updated_at`, bucket de Storage `team-assets` y políticas RLS. `seed.sql` inserta los datos reales extraídos del proyecto original.

## 3. Subir assets iniciales a Supabase Storage

El seed referencia las imágenes como `storage://team-assets/...`. Para que se vean desde Supabase, sube todo el contenido de:

```bash
supabase/assets/
```

al bucket:

```bash
team-assets
```

manteniendo exactamente las rutas internas, por ejemplo:

```bash
images/logo.webp
images/members/juanma.jpeg
images/catches/c-juanma-proserpina-1.jpeg
images/uploads/waters/horno-tejero.jpg
```

Puedes hacerlo desde el panel de Supabase Storage o con el script incluido:

```bash
npm run supabase:upload-assets
```

El archivo `images/uploads/waters/horno-tejero.jpg` se extrajo del `public/data/project-overrides.json` original, que estaba guardado como base64.

## 4. Ejecutar localmente

```bash
npm install
npm run dev
```

Para producción:

```bash
npm run build
```

## 5. Tablas creadas

- `site_settings`: metadatos editables de la web, como nombre, tagline y CTAs.
- `members`: pescadores del equipo.
- `baits`: cebos internos usados en capturas.
- `waters`: escenarios, charcas, ríos, embalses y zonas.
- `catches`: capturas con pescador, escenario, cebo, pez, peso, fecha, montaje e imagen.
- `brands`: marcas de material de carpfishing.
- `bait_brands`: marcas de cebos de carpfishing.
- `member_favorite_baits`: relación ordenada entre pescadores y cebos favoritos.
- `member_home_waters`: relación ordenada entre pescadores y escenarios habituales.
- `fish_types`: tipos de pez visibles en filtros y formularios.
- `water_type_options`: opciones de tipo de escenario del panel.
- `water_difficulty_options`: opciones de dificultad del panel.
- `assets`: registro de assets migrados o subidos, con bucket, path, tipo MIME, entidad y metadatos.

## 6. Storage y subidas desde la app

La app sube las imágenes nuevas del panel al bucket público `team-assets` en estas carpetas:

```bash
uploads/catches/
uploads/waters/
```

Después guarda en la tabla correspondiente una referencia `storage://team-assets/...`. El helper `assetPath()` la convierte en URL pública usando `NEXT_PUBLIC_SUPABASE_URL`.

## 7. Notas importantes

- No hay claves reales dentro del repositorio.
- La app no usa `service_role` en frontend.
- Las políticas RLS permiten lectura pública y escritura desde la anon key en `waters`, `catches`, `assets` y `storage.objects` para conservar el comportamiento del panel público original. Si el panel pasa a ser privado, cambia esas políticas para exigir usuarios autenticados.
- Los datos migrados salen de `src/data/siteData.js`, los escenarios extra que estaban en el contexto y `public/data/project-overrides.json` del proyecto original.
