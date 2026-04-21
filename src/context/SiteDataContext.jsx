import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  baits as seedBaits,
  brands as seedBrands,
  catches as seedCatches,
  cebos as seedCebos,
  members as seedMembers,
  siteMeta,
  waters as seedWaters,
} from '../data/siteData';
import { slugify } from '../utils/siteUtils';

const WATER_STORAGE_KEY = 'teams-bloster-custom-waters-v1';
const CATCH_STORAGE_KEY = 'teams-bloster-custom-catches-v1';
const EDITED_WATER_STORAGE_KEY = 'teams-bloster-edited-waters-v1';
const EDITED_CATCH_STORAGE_KEY = 'teams-bloster-edited-catches-v1';
const DELETED_WATER_IDS_STORAGE_KEY = 'teams-bloster-deleted-water-ids-v1';
const DELETED_CATCH_IDS_STORAGE_KEY = 'teams-bloster-deleted-catch-ids-v1';
const PROJECT_SYNC_FILE_PATH = '/data/project-overrides.json';

const buildSeedVersion = (value) => {
  const serializedValue = JSON.stringify(value);
  let hash = 0;

  for (let index = 0; index < serializedValue.length; index += 1) {
    hash = (hash * 31 + serializedValue.charCodeAt(index)) >>> 0;
  }

  return `seed-${hash.toString(36)}`;
};

const SEED_VERSION_STORAGE_KEY = 'teams-bloster-seed-version';

const SEED_OVERRIDE_STORAGE_KEYS = [
  EDITED_WATER_STORAGE_KEY,
  EDITED_CATCH_STORAGE_KEY,
  DELETED_WATER_IDS_STORAGE_KEY,
  DELETED_CATCH_IDS_STORAGE_KEY,
];

const EMPTY_PROJECT_SYNC = Object.freeze({
  waters: [],
  catches: [],
  editedWaters: [],
  editedCatches: [],
  deletedWaterIds: [],
  deletedCatchIds: [],
});

const SiteDataContext = createContext(null);

const brandLinks = {
  korda: 'https://kordatackle.com/',
  nash: 'https://www.nashtackle.co.uk/',
  fox: 'https://www.foxint.com/es/',
  ridgemonkey: 'https://ridgemonkey.co.uk/',
  sonik: 'https://www.soniksports.com/',
  shimano: 'https://fish.shimano.com/es-ES/fishing.html',
};

const baitBrandLinks = {
  proelitebaits: 'https://proelitebaits.com',
  luxurybaits: 'https://luxurybaits.com/',
  dsabaits: 'https://dsabaits.com/',
  kromquality: 'https://www.coletascarp.com/index.php/brand/krom-quality/',
  superbaits: 'https://www.santanacarp.com/fabricante/superbaits/',
  peralbaits: 'https://peralbaits.es/',
};

const extraWaters = [
  {
    id: 'las-tijeras',
    name: 'Las Tijeras',
    shortName: 'Las Tijeras',
    type: 'Charca',
    province: 'Badajoz',
    description:
      'Escenario recogido y muy practico para sesiones cortas, con zonas limpias donde destacan las presentaciones visibles.',
    knownFor: 'Jornadas rapidas y montajes visuales',
    bestSeason: 'Primavera y otono',
    difficulty: 'Media',
    image: 'images/logo.png',
    tags: ['sesion corta', 'charca', 'visual'],
    notes:
      'Buena opcion para trabajar puestos concretos con cebado medido y montajes limpios.',
  },
  {
    id: 'gijo',
    name: 'Gijo',
    shortName: 'Gijo',
    type: 'Rio',
    province: 'Badajoz',
    description:
      'Tramo cambiante para leer actividad, aprovechar pasos de pez y sacar partido a cebos de mucha confianza.',
    knownFor: 'Pesca de paso y movilidad',
    bestSeason: 'Primavera',
    difficulty: 'Alta',
    image: 'images/logo.png',
    tags: ['rio', 'movilidad', 'paso de pez'],
    notes:
      'Conviene observar mucho el escenario y ajustar rapido tanto el puesto como la presentacion.',
  },
  {
    id: 'portugal',
    name: 'Portugal',
    shortName: 'Portugal',
    type: 'Pais / zona',
    province: 'Portugal',
    description:
      'Escenario general para viajes, sesiones fuera de Extremadura y capturas registradas en aguas portuguesas.',
    knownFor: 'Viajes y escenarios internacionales',
    bestSeason: 'Todo el ano',
    difficulty: 'Media',
    image: 'images/logo.png',
    tags: ['portugal', 'viaje', 'internacional'],
    notes:
      'Pensado para guardar capturas y jornadas cuando solo quieras indicar que la sesion fue en Portugal.',
  },
];

const ensureSeedVersion = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const currentVersion = window.localStorage.getItem(SEED_VERSION_STORAGE_KEY);

    if (currentVersion === SEED_VERSION) {
      return;
    }

    SEED_OVERRIDE_STORAGE_KEYS.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    window.localStorage.setItem(SEED_VERSION_STORAGE_KEY, SEED_VERSION);
  } catch {
    // Si el navegador bloquea storage o falla algo, no rompemos la app.
  }
};

const SEED_VERSION = buildSeedVersion({
  siteMeta,
  members: seedMembers,
  baits: seedBaits,
  brands: seedBrands,
  cebos: seedCebos,
  waters: [...seedWaters, ...extraWaters],
  catches: seedCatches,
});

const readStoredItems = (key, fallback = []) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  ensureSeedVersion();

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};

const writeStoredItems = (key, items) => {
  if (typeof window === 'undefined') {
    return;
  }

  ensureSeedVersion();

  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      throw new Error(
        'No queda espacio para guardar mas fotos en este navegador. Prueba con imagenes mas ligeras o exporta y limpia los datos locales.',
      );
    }

    throw new Error('No se han podido guardar los cambios en el navegador.');
  }
};

const mergeById = (items) => {
  const registry = new Map();

  items.forEach((item) => {
    registry.set(item.id, item);
  });

  return [...registry.values()];
};

const uniqueIds = (ids) => [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))];

const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const normalizeCarpType = (value = 'common') => {
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

  return 'common';
};

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeWater = (water, source = 'seed') => ({
  id: water.id,
  name: String(water.name ?? water.shortName ?? 'Escenario sin nombre').trim(),
  shortName: String(water.shortName ?? water.name ?? 'Escenario').trim(),
  type: String(water.type ?? 'Escenario').trim(),
  province: String(water.province ?? 'Sin provincia').trim(),
  description: String(
    water.description ?? 'Escenario anadido desde el panel de la web.',
  ).trim(),
  knownFor: String(water.knownFor ?? 'Pendiente de completar').trim(),
  bestSeason: String(water.bestSeason ?? 'Todo el ano').trim(),
  difficulty: String(water.difficulty ?? 'Media').trim(),
  image: water.image || 'images/logo.png',
  tags: normalizeTags(water.tags),
  notes: String(water.notes ?? 'Sin notas adicionales.').trim(),
  website: String(water.website ?? '').trim(),
  source,
});

const normalizeCapture = (capture, source = 'seed') => ({
  id: capture.id ?? createId('capture'),
  memberId: capture.memberId,
  waterId: capture.waterId,
  baitId: capture.baitId,
  carpType: normalizeCarpType(capture.carpType),
  weightKg: Number(capture.weightKg) || 0,
  date: capture.date || new Date().toISOString().slice(0, 10),
  rig: String(capture.rig ?? 'Hair rig clasico').trim(),
  image: capture.image || 'images/logo.png',
  notes: String(capture.notes ?? '').trim(),
  createdAt: capture.createdAt || new Date().toISOString(),
  source,
});

const normalizeImportedWater = (water) =>
  normalizeWater(
    {
      ...water,
      id: water.id || slugify(water.shortName || water.name || '') || createId('water'),
    },
    'custom',
  );

const buildProjectSyncPayload = (payload = EMPTY_PROJECT_SYNC) => ({
  exportedAt: payload.exportedAt || null,
  waters: Array.isArray(payload.waters) ? payload.waters : [],
  catches: Array.isArray(payload.catches) ? payload.catches : [],
  editedWaters: Array.isArray(payload.editedWaters) ? payload.editedWaters : [],
  editedCatches: Array.isArray(payload.editedCatches) ? payload.editedCatches : [],
  deletedWaterIds: uniqueIds(payload.deletedWaterIds),
  deletedCatchIds: uniqueIds(payload.deletedCatchIds),
});

const baseMembers = seedMembers.map((member) => ({ ...member, source: 'seed' }));
const baseBaits = seedBaits.map((bait) => ({ ...bait, source: 'seed' }));
const baseBrands = seedBrands.map((brand) => ({
  ...brand,
  url: brand.url || brandLinks[brand.id] || '',
  source: 'seed',
}));
const baseBaitBrands = seedCebos.map((brand) => ({
  ...brand,
  url: brand.url || baitBrandLinks[brand.id] || '',
  source: 'seed',
}));
const baseWaters = mergeById(
  [...seedWaters, ...extraWaters].map((water) => normalizeWater(water, 'seed')),
);
const baseCatches = seedCatches.map((capture) => normalizeCapture(capture, 'seed'));
const baseMemberIds = new Set(baseMembers.map((member) => member.id));
const baseBaitIds = new Set(baseBaits.map((bait) => bait.id));
const baseWaterIds = new Set(baseWaters.map((water) => water.id));
const baseCatchIds = new Set(baseCatches.map((capture) => capture.id));

const replaceItemById = (items, nextItem) =>
  items.map((item) => (item.id === nextItem.id ? nextItem : item));

export function SiteDataProvider({ children }) {
  const [projectSyncData, setProjectSyncData] = useState(EMPTY_PROJECT_SYNC);
  const [projectSyncStatus, setProjectSyncStatus] = useState('idle');
  const [customWaters, setCustomWaters] = useState(() =>
    readStoredItems(WATER_STORAGE_KEY).map((item) => normalizeWater(item, 'custom')),
  );
  const [customCatches, setCustomCatches] = useState(() =>
    readStoredItems(CATCH_STORAGE_KEY).map((item) => normalizeCapture(item, 'custom')),
  );
  const [editedWaters, setEditedWaters] = useState(() =>
    readStoredItems(EDITED_WATER_STORAGE_KEY).map((item) => normalizeWater(item, 'seed')),
  );
  const [editedCatches, setEditedCatches] = useState(() =>
    readStoredItems(EDITED_CATCH_STORAGE_KEY).map((item) => normalizeCapture(item, 'seed')),
  );
  const [deletedWaterIds, setDeletedWaterIds] = useState(() =>
    uniqueIds(readStoredItems(DELETED_WATER_IDS_STORAGE_KEY)),
  );
  const [deletedCatchIds, setDeletedCatchIds] = useState(() =>
    uniqueIds(readStoredItems(DELETED_CATCH_IDS_STORAGE_KEY)),
  );

  useEffect(() => {
    let isMounted = true;

    const loadProjectSyncData = async () => {
      if (typeof window === 'undefined') {
        return;
      }

      setProjectSyncStatus('loading');

      try {
        const response = await fetch(PROJECT_SYNC_FILE_PATH, { cache: 'no-store' });

        if (!response.ok) {
          throw new Error('No project sync file');
        }

        const payload = await response.json();

        if (!isMounted) {
          return;
        }

        setProjectSyncData(buildProjectSyncPayload(payload));
        setProjectSyncStatus('ready');
      } catch {
        if (!isMounted) {
          return;
        }

        setProjectSyncData(EMPTY_PROJECT_SYNC);
        setProjectSyncStatus('missing');
      }
    };

    loadProjectSyncData();

    return () => {
      isMounted = false;
    };
  }, []);

  const syncedCustomWaters = useMemo(
    () => projectSyncData.waters.map((item) => normalizeWater(item, 'custom')),
    [projectSyncData.waters],
  );
  const syncedCustomCatches = useMemo(
    () => projectSyncData.catches.map((item) => normalizeCapture(item, 'custom')),
    [projectSyncData.catches],
  );
  const syncedEditedWaters = useMemo(
    () => projectSyncData.editedWaters.map((item) => normalizeWater(item, 'seed')),
    [projectSyncData.editedWaters],
  );
  const syncedEditedCatches = useMemo(
    () => projectSyncData.editedCatches.map((item) => normalizeCapture(item, 'seed')),
    [projectSyncData.editedCatches],
  );
  const syncedDeletedWaterIds = useMemo(
    () => uniqueIds(projectSyncData.deletedWaterIds),
    [projectSyncData.deletedWaterIds],
  );
  const syncedDeletedCatchIds = useMemo(
    () => uniqueIds(projectSyncData.deletedCatchIds),
    [projectSyncData.deletedCatchIds],
  );

  const allEditedWaters = useMemo(
    () => mergeById([...syncedEditedWaters, ...editedWaters.map((item) => normalizeWater(item, 'seed'))]),
    [editedWaters, syncedEditedWaters],
  );
  const allCustomWaters = useMemo(
    () => mergeById([...syncedCustomWaters, ...customWaters.map((item) => normalizeWater(item, 'custom'))]),
    [customWaters, syncedCustomWaters],
  );
  const allDeletedWaterIds = useMemo(
    () => uniqueIds([...syncedDeletedWaterIds, ...deletedWaterIds]),
    [deletedWaterIds, syncedDeletedWaterIds],
  );

  const waters = useMemo(() => {
    const merged = mergeById([...baseWaters, ...allEditedWaters, ...allCustomWaters]);
    return merged.filter((water) => !allDeletedWaterIds.includes(water.id));
  }, [allCustomWaters, allDeletedWaterIds, allEditedWaters]);

  const allEditedCatches = useMemo(
    () => mergeById([...syncedEditedCatches, ...editedCatches.map((item) => normalizeCapture(item, 'seed'))]),
    [editedCatches, syncedEditedCatches],
  );
  const allCustomCatches = useMemo(
    () => mergeById([...syncedCustomCatches, ...customCatches.map((item) => normalizeCapture(item, 'custom'))]),
    [customCatches, syncedCustomCatches],
  );
  const allDeletedCatchIds = useMemo(
    () => uniqueIds([...syncedDeletedCatchIds, ...deletedCatchIds]),
    [deletedCatchIds, syncedDeletedCatchIds],
  );

  const catches = useMemo(() => {
    const visibleWaterIds = new Set(waters.map((water) => water.id));

    return mergeById([...baseCatches, ...allEditedCatches, ...allCustomCatches]).filter(
      (capture) =>
        !allDeletedCatchIds.includes(capture.id) &&
        baseMemberIds.has(capture.memberId) &&
        baseBaitIds.has(capture.baitId) &&
        visibleWaterIds.has(capture.waterId),
    );
  }, [allCustomCatches, allDeletedCatchIds, allEditedCatches, waters]);

  const rigOptions = useMemo(() => {
    const allRigs = catches
      .map((item) => item.rig)
      .filter(Boolean)
      .map((rig) => rig.trim());

    return [...new Set(allRigs)].sort((left, right) => left.localeCompare(right));
  }, [catches]);

  const customCounts = useMemo(
    () => ({
      waters: customWaters.length,
      catches: customCatches.length,
      editedWaters: editedWaters.length,
      editedCatches: editedCatches.length,
      deletedWaters: deletedWaterIds.length,
      deletedCatches: deletedCatchIds.length,
      syncedWaters: syncedCustomWaters.length,
      syncedCatches: syncedCustomCatches.length,
      syncedEditedWaters: syncedEditedWaters.length,
      syncedEditedCatches: syncedEditedCatches.length,
      syncedDeletedWaters: syncedDeletedWaterIds.length,
      syncedDeletedCatches: syncedDeletedCatchIds.length,
      totalChanges:
        customWaters.length +
        customCatches.length +
        editedWaters.length +
        editedCatches.length +
        deletedWaterIds.length +
        deletedCatchIds.length,
    }),
    [
      customCatches.length,
      customWaters.length,
      deletedCatchIds.length,
      deletedWaterIds.length,
      editedCatches.length,
      editedWaters.length,
      syncedCustomCatches.length,
      syncedCustomWaters.length,
      syncedDeletedCatchIds.length,
      syncedDeletedWaterIds.length,
      syncedEditedCatches.length,
      syncedEditedWaters.length,
    ],
  );

  const exportPayload = useMemo(
    () => ({
      exportedAt: new Date().toISOString(),
      waters: customWaters,
      catches: customCatches,
      editedWaters,
      editedCatches,
      deletedWaterIds,
      deletedCatchIds,
    }),
    [
      customCatches,
      customWaters,
      deletedCatchIds,
      deletedWaterIds,
      editedCatches,
      editedWaters,
    ],
  );

  const projectSyncPayload = useMemo(
    () => ({
      exportedAt: new Date().toISOString(),
      waters: mergeById([...syncedCustomWaters, ...customWaters]),
      catches: mergeById([...syncedCustomCatches, ...customCatches]),
      editedWaters: mergeById([...syncedEditedWaters, ...editedWaters]),
      editedCatches: mergeById([...syncedEditedCatches, ...editedCatches]),
      deletedWaterIds: uniqueIds([...syncedDeletedWaterIds, ...deletedWaterIds]),
      deletedCatchIds: uniqueIds([...syncedDeletedCatchIds, ...deletedCatchIds]),
    }),
    [
      customCatches,
      customWaters,
      deletedCatchIds,
      deletedWaterIds,
      editedCatches,
      editedWaters,
      syncedCustomCatches,
      syncedCustomWaters,
      syncedDeletedCatchIds,
      syncedDeletedWaterIds,
      syncedEditedCatches,
      syncedEditedWaters,
    ],
  );

  const persistAll = ({
    nextCustomWaters = customWaters,
    nextCustomCatches = customCatches,
    nextEditedWaters = editedWaters,
    nextEditedCatches = editedCatches,
    nextDeletedWaterIds = deletedWaterIds,
    nextDeletedCatchIds = deletedCatchIds,
  }) => {
    writeStoredItems(WATER_STORAGE_KEY, nextCustomWaters);
    writeStoredItems(CATCH_STORAGE_KEY, nextCustomCatches);
    writeStoredItems(EDITED_WATER_STORAGE_KEY, nextEditedWaters);
    writeStoredItems(EDITED_CATCH_STORAGE_KEY, nextEditedCatches);
    writeStoredItems(DELETED_WATER_IDS_STORAGE_KEY, uniqueIds(nextDeletedWaterIds));
    writeStoredItems(DELETED_CATCH_IDS_STORAGE_KEY, uniqueIds(nextDeletedCatchIds));

    setCustomWaters(nextCustomWaters);
    setCustomCatches(nextCustomCatches);
    setEditedWaters(nextEditedWaters);
    setEditedCatches(nextEditedCatches);
    setDeletedWaterIds(uniqueIds(nextDeletedWaterIds));
    setDeletedCatchIds(uniqueIds(nextDeletedCatchIds));
  };

  const addWater = (waterInput) => {
    const rawBaseId = slugify(waterInput.shortName || waterInput.name || '') || createId('water');
    let nextId = rawBaseId;
    let collisionCount = 2;
    const currentIds = new Set([
      ...waters,
      ...allCustomWaters,
      ...allEditedWaters,
      ...syncedCustomWaters,
      ...syncedEditedWaters,
    ].map((water) => water.id));

    while (currentIds.has(nextId)) {
      nextId = `${rawBaseId}-${collisionCount}`;
      collisionCount += 1;
    }

    const nextWater = normalizeWater(
      {
        ...waterInput,
        id: nextId,
        image: waterInput.image || 'images/logo.png',
      },
      'custom',
    );

    const nextWaters = [...customWaters, nextWater];
    writeStoredItems(WATER_STORAGE_KEY, nextWaters);
    setCustomWaters(nextWaters);

    return nextWater;
  };

  const updateWater = (waterId, waterInput) => {
    const existingWater = waters.find((water) => water.id === waterId);

    if (!existingWater) {
      throw new Error('No hemos encontrado el escenario que quieres modificar.');
    }

    const nextWater = normalizeWater(
      {
        ...existingWater,
        ...waterInput,
        id: waterId,
        image: waterInput.image || existingWater.image || 'images/logo.png',
      },
      existingWater.source === 'custom' ? 'custom' : 'seed',
    );

    const syncedHasWater = syncedCustomWaters.some((water) => water.id === waterId);
    const syncedHasEditedWater = syncedEditedWaters.some((water) => water.id === waterId);

    if (existingWater.source === 'custom' && !syncedHasWater) {
      const nextCustomWaters = replaceItemById(customWaters, nextWater);
      writeStoredItems(WATER_STORAGE_KEY, nextCustomWaters);
      setCustomWaters(nextCustomWaters);
    } else {
      const nextEditedWaters = editedWaters.some((water) => water.id === waterId)
        ? replaceItemById(editedWaters, nextWater)
        : syncedHasEditedWater
          ? [...editedWaters.filter((water) => water.id !== waterId), nextWater]
          : [...editedWaters, nextWater];
      writeStoredItems(EDITED_WATER_STORAGE_KEY, nextEditedWaters);
      setEditedWaters(nextEditedWaters);
    }

    return nextWater;
  };

  const addCapture = (captureInput) => {
    const nextCapture = normalizeCapture(
      {
        ...captureInput,
        id: createId('capture'),
        createdAt: new Date().toISOString(),
      },
      'custom',
    );

    const nextCatches = [...customCatches, nextCapture];
    writeStoredItems(CATCH_STORAGE_KEY, nextCatches);
    setCustomCatches(nextCatches);

    return nextCapture;
  };

  const updateCapture = (captureId, captureInput) => {
    const existingCapture = catches.find((capture) => capture.id === captureId);

    if (!existingCapture) {
      throw new Error('No hemos encontrado la captura que quieres modificar.');
    }

    const nextCapture = normalizeCapture(
      {
        ...existingCapture,
        ...captureInput,
        id: captureId,
        image: captureInput.image || existingCapture.image || 'images/logo.png',
        createdAt: existingCapture.createdAt || new Date().toISOString(),
      },
      existingCapture.source === 'custom' ? 'custom' : 'seed',
    );

    const syncedHasCapture = syncedCustomCatches.some((capture) => capture.id === captureId);
    const syncedHasEditedCapture = syncedEditedCatches.some((capture) => capture.id === captureId);

    if (existingCapture.source === 'custom' && !syncedHasCapture) {
      const nextCustomCatches = replaceItemById(customCatches, nextCapture);
      writeStoredItems(CATCH_STORAGE_KEY, nextCustomCatches);
      setCustomCatches(nextCustomCatches);
    } else {
      const nextEditedCatches = editedCatches.some((capture) => capture.id === captureId)
        ? replaceItemById(editedCatches, nextCapture)
        : syncedHasEditedCapture
          ? [...editedCatches.filter((capture) => capture.id !== captureId), nextCapture]
          : [...editedCatches, nextCapture];
      writeStoredItems(EDITED_CATCH_STORAGE_KEY, nextEditedCatches);
      setEditedCatches(nextEditedCatches);
    }

    return nextCapture;
  };

  const deleteCapture = (captureId) => {
    const existingCapture = catches.find((capture) => capture.id === captureId);

    if (!existingCapture) {
      throw new Error('No hemos encontrado la captura que quieres borrar.');
    }

    const syncedHasCapture = syncedCustomCatches.some((capture) => capture.id === captureId);

    if (existingCapture.source === 'custom' && !syncedHasCapture) {
      const nextCustomCatches = customCatches.filter((capture) => capture.id !== captureId);
      writeStoredItems(CATCH_STORAGE_KEY, nextCustomCatches);
      setCustomCatches(nextCustomCatches);
      return;
    }

    const nextEditedCatches = editedCatches.filter((capture) => capture.id !== captureId);
    const nextDeletedCatchIds = uniqueIds([...deletedCatchIds, captureId]);

    writeStoredItems(EDITED_CATCH_STORAGE_KEY, nextEditedCatches);
    writeStoredItems(DELETED_CATCH_IDS_STORAGE_KEY, nextDeletedCatchIds);
    setEditedCatches(nextEditedCatches);
    setDeletedCatchIds(nextDeletedCatchIds);
  };

  const deleteWater = (waterId) => {
    const existingWater = waters.find((water) => water.id === waterId);

    if (!existingWater) {
      throw new Error('No hemos encontrado el escenario que quieres borrar.');
    }

    const relatedVisibleCatches = catches.filter((capture) => capture.waterId === waterId);
    const nextEditedCatches = editedCatches.filter((capture) => capture.waterId !== waterId);
    const nextCustomCatches = customCatches.filter((capture) => capture.waterId !== waterId);
    const nextDeletedCatchIds = uniqueIds([
      ...deletedCatchIds,
      ...relatedVisibleCatches
        .filter((capture) => capture.source !== 'custom')
        .map((capture) => capture.id),
    ]);

    const syncedHasWater = syncedCustomWaters.some((water) => water.id === waterId);

    if (existingWater.source === 'custom' && !syncedHasWater) {
      const nextCustomWaters = customWaters.filter((water) => water.id !== waterId);
      persistAll({
        nextCustomWaters,
        nextCustomCatches,
        nextEditedCatches,
        nextDeletedCatchIds,
      });
      return;
    }

    const nextEditedWaters = editedWaters.filter((water) => water.id !== waterId);
    const nextDeletedWaterIds = uniqueIds([...deletedWaterIds, waterId]);

    persistAll({
      nextCustomCatches,
      nextEditedCatches,
      nextEditedWaters,
      nextDeletedWaterIds,
      nextDeletedCatchIds,
    });
  };

  const importCustomData = (payload, { mode = 'merge' } = {}) => {
    const importedWatersRaw = Array.isArray(payload?.waters) ? payload.waters : [];
    const importedCatchesRaw = Array.isArray(payload?.catches) ? payload.catches : [];
    const importedEditedWatersRaw = Array.isArray(payload?.editedWaters)
      ? payload.editedWaters
      : [];
    const importedEditedCatchesRaw = Array.isArray(payload?.editedCatches)
      ? payload.editedCatches
      : [];
    const importedDeletedWaterIds = uniqueIds(payload?.deletedWaterIds);
    const importedDeletedCatchIds = uniqueIds(payload?.deletedCatchIds);

    if (
      !importedWatersRaw.length &&
      !importedCatchesRaw.length &&
      !importedEditedWatersRaw.length &&
      !importedEditedCatchesRaw.length &&
      !importedDeletedWaterIds.length &&
      !importedDeletedCatchIds.length
    ) {
      throw new Error(
        'El archivo no incluye escenarios ni capturas con el formato esperado.',
      );
    }

    const importedWaters = importedWatersRaw.map((item) => normalizeImportedWater(item));
    const importedEditedWaters = importedEditedWatersRaw
      .map((item) => normalizeWater(item, baseWaterIds.has(item.id) ? 'seed' : 'custom'))
      .filter((item) => item.id);

    const nextCustomWaters =
      mode === 'replace'
        ? mergeById(importedWaters)
        : mergeById([...customWaters, ...importedWaters]);
    const nextEditedWaters =
      mode === 'replace'
        ? mergeById(importedEditedWaters)
        : mergeById([...editedWaters, ...importedEditedWaters]);
    const nextDeletedWaterIds =
      mode === 'replace'
        ? importedDeletedWaterIds
        : uniqueIds([...deletedWaterIds, ...importedDeletedWaterIds]);

    const visibleWaterIds = new Set(
      mergeById([...baseWaters, ...syncedEditedWaters, ...nextEditedWaters, ...syncedCustomWaters, ...nextCustomWaters])
        .filter((water) => !uniqueIds([...syncedDeletedWaterIds, ...nextDeletedWaterIds]).includes(water.id))
        .map((water) => water.id),
    );

    const importedCatches = importedCatchesRaw
      .map((item) => normalizeCapture(item, 'custom'))
      .filter(
        (item) =>
          baseMemberIds.has(item.memberId) &&
          baseBaitIds.has(item.baitId) &&
          visibleWaterIds.has(item.waterId),
      );

    const importedEditedCatches = importedEditedCatchesRaw
      .map((item) => normalizeCapture(item, baseCatchIds.has(item.id) ? 'seed' : 'custom'))
      .filter(
        (item) =>
          baseMemberIds.has(item.memberId) &&
          baseBaitIds.has(item.baitId) &&
          visibleWaterIds.has(item.waterId),
      );

    const skippedCatches = importedCatchesRaw.length - importedCatches.length;
    const skippedEditedCatches = importedEditedCatchesRaw.length - importedEditedCatches.length;

    const nextCustomCatches =
      mode === 'replace'
        ? mergeById(importedCatches)
        : mergeById([...customCatches, ...importedCatches]);
    const nextEditedCatches =
      mode === 'replace'
        ? mergeById(importedEditedCatches)
        : mergeById([...editedCatches, ...importedEditedCatches]);
    const nextDeletedCatchIds =
      mode === 'replace'
        ? importedDeletedCatchIds
        : uniqueIds([...deletedCatchIds, ...importedDeletedCatchIds]);

    persistAll({
      nextCustomWaters,
      nextCustomCatches,
      nextEditedWaters,
      nextEditedCatches,
      nextDeletedWaterIds,
      nextDeletedCatchIds,
    });

    return {
      importedWaters: importedWaters.length,
      importedCatches: importedCatches.length,
      importedEditedWaters: importedEditedWaters.length,
      importedEditedCatches: importedEditedCatches.length,
      skippedCatches: skippedCatches + skippedEditedCatches,
      deletedWaters: importedDeletedWaterIds.length,
      deletedCatches: importedDeletedCatchIds.length,
    };
  };

  const resetCustomData = () => {
    persistAll({
      nextCustomWaters: [],
      nextCustomCatches: [],
      nextEditedWaters: [],
      nextEditedCatches: [],
      nextDeletedWaterIds: [],
      nextDeletedCatchIds: [],
    });
  };

  const value = useMemo(
    () => ({
      siteMeta,
      members: baseMembers,
      baits: baseBaits,
      brands: baseBrands,
      cebos: baseBaitBrands,
      waters,
      catches,
      rigOptions,
      customWaters,
      customCatches,
      customCounts,
      addWater,
      updateWater,
      deleteWater,
      addCapture,
      updateCapture,
      deleteCapture,
      importCustomData,
      resetCustomData,
      exportPayload,
      projectSyncPayload,
      projectSyncStatus,
      projectSyncFilePath: PROJECT_SYNC_FILE_PATH,
      storageMode: 'browser+project-sync',
    }),
    [
      catches,
      customCatches,
      customCounts,
      customWaters,
      exportPayload,
      projectSyncPayload,
      projectSyncStatus,
      rigOptions,
      waters,
    ],
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const context = useContext(SiteDataContext);

  if (!context) {
    throw new Error('useSiteData debe usarse dentro de SiteDataProvider');
  }

  return context;
}
