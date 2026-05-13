import {
  SUPABASE_ASSET_BUCKET,
  getStoragePublicUrl,
  isSupabaseConfigured,
  supabaseRest,
  toStorageUri,
  uploadStorageObject,
} from '../lib/supabaseClient';
import { slugify } from '../utils/siteUtils';

const TABLES = {
  siteSettings: 'site_settings',
  members: 'members',
  memberFavoriteBaits: 'member_favorite_baits',
  memberHomeWaters: 'member_home_waters',
  baits: 'baits',
  waters: 'waters',
  catches: 'catches',
  brands: 'brands',
  baitBrands: 'bait_brands',
  fishTypes: 'fish_types',
  waterTypes: 'water_type_options',
  waterDifficulties: 'water_difficulty_options',
  assets: 'assets',
};

const defaultSiteMeta = {
  name: "Team's Bloster",
  tagline: '',
  intro: '',
  ctaPrimary: 'Ver capturas',
  ctaSecondary: 'Explorar charcas',
};

const selectAll = (table, order = 'sort_order.asc') =>
  supabaseRest(`${table}?select=*&order=${order}`);

const selectById = (table, id) =>
  supabaseRest(`${table}?select=*&id=eq.${encodeURIComponent(id)}&limit=1`).then((rows) => rows?.[0] ?? null);

const insertRow = (table, row) =>
  supabaseRest(table, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  }).then((rows) => rows?.[0] ?? null);

const updateRow = (table, id, row) =>
  supabaseRest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  }).then((rows) => rows?.[0] ?? null);

const deleteRow = (table, id) =>
  supabaseRest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });

const deleteWhere = (table, query) =>
  supabaseRest(`${table}?${query}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });

export const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

export const normalizeCarpType = (value = 'common') => {
  const normalizedValue = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-');

  if (['royal', 'espejo'].includes(normalizedValue)) {
    return 'royal';
  }

  if (['common', 'comun', 'comunes', 'carpa-comun'].includes(normalizedValue)) {
    return 'common';
  }

  if (['koi', 'carpa-koi'].includes(normalizedValue)) {
    return 'koi';
  }

  if (['barbo', 'barbos', 'barbel'].includes(normalizedValue)) {
    return 'barbo';
  }

    if (['pez-gato', 'pezgato', 'catfish', 'siluro', 'siluros'].includes(normalizedValue)) {
    return 'pez-gato';
  }

  if (['black-bass', 'blackbass', 'bass', 'blass-blass', 'blass'].includes(normalizedValue)) {
    return 'black-bass';
  }

  if (['lucio', 'pike'].includes(normalizedValue)) {
    return 'lucio';
  }

  return 'common';
};

const mapMember = (row, favoriteBaitIdsByMember, homeWaterIdsByMember) => ({
  id: row.id,
  name: row.name,
  role: row.role,
  intro: row.intro,
  image: row.image,
  favoriteBaitIds: favoriteBaitIdsByMember[row.id] || [],
  homeWaters: homeWaterIdsByMember[row.id] || [],
  accent: row.accent,
  source: row.source,
});

const mapBait = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  style: row.style,
  description: row.description,
  image: row.image,
  source: row.source,
});

const mapWater = (row) => ({
  id: row.id,
  name: row.name,
  shortName: row.short_name,
  type: row.type,
  province: row.province,
  description: row.description,
  knownFor: row.known_for,
  bestSeason: row.best_season,
  difficulty: row.difficulty,
  image: row.image,
  tags: normalizeTags(row.tags),
  notes: row.notes,
  website: row.website || '',
  source: row.source,
});

const mapCapture = (row) => ({
  id: row.id,
  memberId: row.member_id,
  waterId: row.water_id,
  baitId: row.bait_id,
  carpType: normalizeCarpType(row.carp_type),
  weightKg: Number(row.weight_kg) || 0,
  date: row.caught_on,
  rig: row.rig,
  image: row.image,
  notes: row.notes || '',
  createdAt: row.created_at,
  source: row.source,
});

const mapBrand = (row) => ({
  id: row.id,
  name: row.name,
  specialty: row.specialty,
  knownFor: row.known_for,
  featuredProducts: Array.isArray(row.featured_products) ? row.featured_products : [],
  description: row.description,
  image: row.image,
  url: row.url || '',
  source: row.source,
});

const mapFishType = (row) => ({
  value: row.id,
  label: row.label,
  badge: row.badge,
});

const rowsToOrderedRegistry = (rows, idKey, valueKey) =>
  rows.reduce((registry, row) => {
    registry[row[idKey]] = [...(registry[row[idKey]] || []), row[valueKey]];
    return registry;
  }, {});

export const buildEmptySiteData = () => ({
  siteMeta: defaultSiteMeta,
  members: [],
  baits: [],
  brands: [],
  cebos: [],
  waters: [],
  catches: [],
  fishTypes: [],
  waterTypeOptions: [],
  waterDifficultyOptions: [],
});

export async function loadSiteData() {
  if (!isSupabaseConfigured) {
    throw new Error('Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para cargar los datos desde Supabase.');
  }

  const [
    settingsRows,
    membersRows,
    favoriteRows,
    homeWaterRows,
    baitsRows,
    watersRows,
    catchesRows,
    brandsRows,
    baitBrandsRows,
    fishTypeRows,
    waterTypeRows,
    waterDifficultyRows,
  ] = await Promise.all([
    selectAll(TABLES.siteSettings, 'key.asc'),
    selectAll(TABLES.members),
    selectAll(TABLES.memberFavoriteBaits),
    selectAll(TABLES.memberHomeWaters),
    selectAll(TABLES.baits),
    selectAll(TABLES.waters),
    selectAll(TABLES.catches, 'caught_on.desc'),
    selectAll(TABLES.brands),
    selectAll(TABLES.baitBrands),
    selectAll(TABLES.fishTypes),
    selectAll(TABLES.waterTypes),
    selectAll(TABLES.waterDifficulties),
  ]);

  const settings = settingsRows.reduce((registry, row) => {
    registry[row.key] = row.value;
    return registry;
  }, {});
  const favoriteBaitIdsByMember = rowsToOrderedRegistry(favoriteRows, 'member_id', 'bait_id');
  const homeWaterIdsByMember = rowsToOrderedRegistry(homeWaterRows, 'member_id', 'water_id');

  return {
    siteMeta: settings.site_meta || defaultSiteMeta,
    members: membersRows.map((row) => mapMember(row, favoriteBaitIdsByMember, homeWaterIdsByMember)),
    baits: baitsRows.map(mapBait),
    waters: watersRows.map(mapWater),
    catches: catchesRows.map(mapCapture),
    brands: brandsRows.map(mapBrand),
    cebos: baitBrandsRows.map(mapBrand),
    fishTypes: fishTypeRows.map(mapFishType),
    waterTypeOptions: waterTypeRows.map((row) => row.label),
    waterDifficultyOptions: waterDifficultyRows.map((row) => row.label),
  };
}

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const getDataUrlMeta = (dataUrl) => {
  const mimeType = String(dataUrl).match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
  const extension = mimeType.includes('png')
    ? 'png'
    : mimeType.includes('webp')
      ? 'webp'
      : mimeType.includes('svg')
        ? 'svg'
        : 'jpg';

  return { mimeType, extension };
};

const uploadImageIfNeeded = async (image, { folder, entityType, entityId, altText }) => {
  const imageValue = String(image || '');

  if (!imageValue) {
    return 'storage://team-assets/images/logo.png';
  }

  if (!imageValue.startsWith('data:')) {
    return imageValue.startsWith('images/') ? toStorageUri(SUPABASE_ASSET_BUCKET, imageValue) : imageValue;
  }

  const { mimeType, extension } = getDataUrlMeta(image);
  const blob = await dataUrlToBlob(image);
  const fileName = `${slugify(entityId || entityType || 'asset')}-${Date.now()}.${extension}`;
  const path = `${folder}/${fileName}`;
  const uploaded = await uploadStorageObject({
    bucket: SUPABASE_ASSET_BUCKET,
    path,
    body: blob,
    contentType: mimeType,
  });

  await insertRow(TABLES.assets, {
    bucket: SUPABASE_ASSET_BUCKET,
    path: uploaded.path,
    public_url: getStoragePublicUrl(SUPABASE_ASSET_BUCKET, uploaded.path),
    source_path: uploaded.storageUri,
    entity_type: entityType,
    entity_id: entityId,
    kind: 'image',
    mime_type: mimeType,
    metadata: { alt: altText || '' },
  });

  return toStorageUri(SUPABASE_ASSET_BUCKET, uploaded.path);
};

export const createWaterPayload = (waterInput, source = 'custom') => ({
  id: waterInput.id,
  name: String(waterInput.name ?? waterInput.shortName ?? 'Escenario sin nombre').trim(),
  short_name: String(waterInput.shortName ?? waterInput.name ?? 'Escenario').trim(),
  type: String(waterInput.type ?? 'Escenario').trim(),
  province: String(waterInput.province ?? 'Sin provincia').trim(),
  description: String(waterInput.description ?? 'Escenario anadido desde el panel de la web.').trim(),
  known_for: String(waterInput.knownFor ?? 'Pendiente de completar').trim(),
  best_season: String(waterInput.bestSeason ?? 'Todo el ano').trim(),
  difficulty: String(waterInput.difficulty ?? 'Media').trim(),
  image: waterInput.image || 'storage://team-assets/images/logo.png',
  tags: normalizeTags(waterInput.tags),
  notes: String(waterInput.notes ?? 'Sin notas adicionales.').trim(),
  website: String(waterInput.website ?? '').trim(),
  source,
});

export const createCapturePayload = (captureInput, source = 'custom') => ({
  id: captureInput.id,
  member_id: captureInput.memberId,
  water_id: captureInput.waterId,
  bait_id: captureInput.baitId,
  carp_type: normalizeCarpType(captureInput.carpType),
  weight_kg: Number(captureInput.weightKg) || 0,
  caught_on: captureInput.date || new Date().toISOString().slice(0, 10),
  rig: String(captureInput.rig ?? 'Hair rig clasico').trim(),
  image: captureInput.image || 'storage://team-assets/images/logo.png',
  notes: String(captureInput.notes ?? '').trim(),
  source,
});

export async function createWater(waterInput, existingIds = new Set()) {
  const rawBaseId = slugify(waterInput.shortName || waterInput.name || '') || `water-${Date.now()}`;
  let nextId = rawBaseId;
  let collisionCount = 2;

  while (existingIds.has(nextId) || (await selectById(TABLES.waters, nextId))) {
    nextId = `${rawBaseId}-${collisionCount}`;
    collisionCount += 1;
  }

  const image = await uploadImageIfNeeded(waterInput.image, {
    folder: 'images/uploads/waters',
    entityType: 'water',
    entityId: nextId,
    altText: waterInput.shortName || waterInput.name,
  });

  const row = await insertRow(TABLES.waters, createWaterPayload({ ...waterInput, id: nextId, image }, 'custom'));
  return mapWater(row);
}

export async function saveWater(waterId, waterInput, existingWater) {
  const image = await uploadImageIfNeeded(waterInput.image || existingWater?.image, {
    folder: 'images/uploads/waters',
    entityType: 'water',
    entityId: waterId,
    altText: waterInput.shortName || waterInput.name || existingWater?.shortName,
  });
  const row = await updateRow(TABLES.waters, waterId, createWaterPayload({ ...existingWater, ...waterInput, id: waterId, image }, existingWater?.source || 'custom'));
  return mapWater(row);
}

export async function removeWater(waterId) {
  await deleteWhere(TABLES.catches, `water_id=eq.${encodeURIComponent(waterId)}`);
  await deleteRow(TABLES.waters, waterId);
}

export async function createCapture(captureInput) {
  const nextId = `capture-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const image = await uploadImageIfNeeded(captureInput.image, {
    folder: 'images/uploads/catches',
    entityType: 'capture',
    entityId: nextId,
    altText: 'Captura Team Bloster',
  });
  const row = await insertRow(TABLES.catches, createCapturePayload({ ...captureInput, id: nextId, image }, 'custom'));
  return mapCapture(row);
}

export async function saveCapture(captureId, captureInput, existingCapture) {
  const image = await uploadImageIfNeeded(captureInput.image || existingCapture?.image, {
    folder: 'images/uploads/catches',
    entityType: 'capture',
    entityId: captureId,
    altText: 'Captura Team Bloster',
  });
  const row = await updateRow(TABLES.catches, captureId, createCapturePayload({ ...existingCapture, ...captureInput, id: captureId, image }, existingCapture?.source || 'custom'));
  return mapCapture(row);
}

export async function removeCapture(captureId) {
  await deleteRow(TABLES.catches, captureId);
}

export async function resetCustomRows() {
  await supabaseRest(`${TABLES.catches}?source=eq.custom`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
  await supabaseRest(`${TABLES.waters}?source=eq.custom`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  });
}
