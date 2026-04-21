# Team's Bloster

Web hecha con React + Vite para mostrar capturas, cebos, escenarios y marcas de carpfishing del grupo **Team's Bloster**.

## Lo que lleva ahora

- Portada, galeria de capturas y fichas de pescadores
- Pagina de escenarios con ficha individual y filtros
- Paginas de marcas y cebos con enlace directo a sus webs
- Boton **Subir** en el header para entrar al panel de carga
- Formulario para subir capturas con:
  - foto
  - pescador
  - tipo de carpa
  - peso
  - fecha
  - escenario
  - cebo
  - montaje
  - notas
- Formulario para crear escenarios nuevos
- Campo opcional de **web o mapa** en los escenarios nuevos
- Reutilizacion automatica de montajes nuevos en futuras cargas
- Guardado local en `localStorage` para no depender de que te manden las fotos a ti
- Exportacion de respaldo en JSON y limpieza de datos locales

## Importante

Ahora mismo las capturas y escenarios que se suben desde la web se guardan en el **navegador del usuario**.

Eso significa:

- si una persona sube una captura, la vera en ese navegador
- aparece en portada, capturas, perfil de pescador y ficha del escenario
- **no se comparte automaticamente con todos los usuarios**

Si despues quieres que todo quede compartido para todos en Vercel, el siguiente paso seria conectar el frontend a un backend o storage tipo Supabase, Firebase o Vercel Blob.

## Como arrancar

```bash
npm install
npm run dev
```

## Build de produccion

```bash
npm run build
```

## Publicacion en Vercel

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

La app usa `HashRouter`, asi que evita problemas de rutas al recargar.

## Donde tocar el contenido base

Todo el contenido base vive en:

```bash
src/data/siteData.js
```

Ahi puedes editar:

- `members`
- `waters`
- `catches`
- `brands`
- `cebos`
- `baits`

## Estructura importante

```bash
src/
├─ components/
├─ context/
├─ data/
├─ pages/
├─ styles/
└─ utils/
```

## Funcionalidad nueva que se ha metido

- panel de subida accesible desde el header
- escenarios nuevos desde frontend
- enlaces externos en marcas y cebos
- montajes personalizados reutilizables
- exportacion de respaldo
- enlace opcional de web o mapa para escenarios nuevos

## Guardar cambios del panel en GitHub y Vercel

1. En la web entra en **Subir captura** y pulsa **Exportar para GitHub y Vercel**.
2. Guarda el archivo descargado como respaldo.
3. En tu proyecto local ejecuta:

```bash
npm run sync:project -- "C:/ruta/al/project-overrides.json"
```

Tambien puedes copiar manualmente ese archivo sobre `public/data/project-overrides.json`.

4. Despues haz:

```bash
git add .
git commit -m "Actualizar datos del proyecto"
git push origin main
```

Con eso Vercel mostrara tambien los escenarios, capturas, ediciones y borrados que hiciste desde el panel.
