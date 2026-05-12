# Team's Bloster

Web React + Vite para mostrar capturas, cebos, escenarios y marcas de carpfishing del grupo **Team's Bloster**.

La UI, rutas y estructura visual se mantienen, pero los datos base se cargan desde Supabase y las imágenes se referencian mediante Supabase Storage.

## Arrancar en local

```bash
cp .env.example .env
npm install
npm run dev
```

Rellena `.env` con las claves de tu proyecto Supabase antes de abrir la app.

## Supabase

Consulta `README_SUPABASE.md` para:

- ejecutar `supabase/schema.sql`
- ejecutar `supabase/seed.sql`
- subir los assets iniciales al bucket `team-assets`
- configurar variables de entorno
- entender qué tabla guarda cada dato

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run supabase:upload-assets
```

## Estructura principal

```bash
src/
├─ components/
├─ context/
├─ data/
├─ lib/
├─ pages/
├─ services/
├─ styles/
└─ utils/

supabase/
├─ assets/
├─ schema.sql
├─ seed.sql
└─ upload-assets.mjs
```
# teams-bloster
