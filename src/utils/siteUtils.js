export const FISH_TYPE_META = {
  royal: { label: 'Royal', badge: 'royal' },
  common: { label: 'Comun', badge: 'common' },
  koi: { label: 'Koi', badge: 'koi' },
  barbo: { label: 'Barbo', badge: 'barbo' },
  'pez-gato': { label: 'Pez gato', badge: 'pez-gato' },
};

export const FISH_TYPE_OPTIONS = [
  { value: 'royal', label: 'Royal' },
  { value: 'common', label: 'Comun' },
  { value: 'koi', label: 'Koi' },
  { value: 'barbo', label: 'Barbo' },
  { value: 'pez-gato', label: 'Pez gato' },
];

export const buildLookup = (items) =>
  items.reduce((accumulator, item) => {
    accumulator[item.id] = item;
    return accumulator;
  }, {});

export const assetPath = (path = '') => {
  const value = String(path ?? '');

  if (!value) {
    return '';
  }

  if (/^(https?:|data:|blob:|mailto:|tel:)/i.test(value)) {
    return value;
  }

  return `${import.meta.env.BASE_URL}${value.replace(/^\/+/, '')}`;
};

export const formatWeight = (value) => `${Number(value).toFixed(1)} kg`;

export const formatDate = (dateString) =>
  new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));

export const capitalize = (value = '') =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

export const slugify = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const getFishTypeMeta = (fishType = 'common') =>
  FISH_TYPE_META[fishType] ?? {
    label: capitalize(String(fishType).replace(/-/g, ' ')),
    badge: 'neutral',
  };

export const formatFishType = (fishType = 'common') => getFishTypeMeta(fishType).label;

export const countFishTypes = (catches) =>
  catches.reduce(
    (accumulator, item) => {
      const fishType = item?.carpType;

      if (Object.prototype.hasOwnProperty.call(accumulator, fishType)) {
        accumulator[fishType] += 1;
      } else {
        accumulator.other += 1;
      }

      return accumulator;
    },
    {
      royal: 0,
      common: 0,
      koi: 0,
      barbo: 0,
      'pez-gato': 0,
      other: 0,
    },
  );

export const getMemberCatches = (catches, memberId) =>
  catches.filter((item) => item.memberId === memberId);

export const getWaterCatches = (catches, waterId) =>
  catches.filter((item) => item.waterId === waterId);

export const getBestCatch = (catches) =>
  catches.reduce(
    (best, current) =>
      current.weightKg > (best?.weightKg ?? 0) ? current : best,
    null,
  );

export const getMostUsedBaitId = (catches) => {
  const counts = catches.reduce((accumulator, item) => {
    accumulator[item.baitId] = (accumulator[item.baitId] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
};

export const getTopWaters = (catches) => {
  const counts = catches.reduce((accumulator, item) => {
    accumulator[item.waterId] = (accumulator[item.waterId] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};

export const getTopBaitsForMember = (memberId, catches) => {
  const filtered = catches.filter((item) => item.memberId === memberId);
  const counts = filtered.reduce((accumulator, item) => {
    accumulator[item.baitId] = (accumulator[item.baitId] ?? 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([baitId]) => baitId)
    .slice(0, 3);
};

export const getMemberStats = (memberId, catches) => {
  const memberCatches = catches.filter((item) => item.memberId === memberId);
  const fishTypeCounts = countFishTypes(memberCatches);
  const bestCatch = getBestCatch(memberCatches);

  return {
    total: memberCatches.length,
    fishTypeCounts,
    royalCount: fishTypeCounts.royal,
    commonCount: fishTypeCounts.common,
    koiCount: fishTypeCounts.koi,
    barboCount: fishTypeCounts.barbo,
    pezGatoCount: fishTypeCounts['pez-gato'],
    otherSpeciesCount: fishTypeCounts.koi + fishTypeCounts.barbo + fishTypeCounts['pez-gato'],
    bestWeight: bestCatch?.weightKg ?? 0,
    bestCatch,
  };
};

export const getOverallStats = (catches) => {
  const fishTypeCounts = countFishTypes(catches);
  const bestCatch = getBestCatch(catches);

  return {
    total: catches.length,
    fishTypeCounts,
    royalCount: fishTypeCounts.royal,
    commonCount: fishTypeCounts.common,
    koiCount: fishTypeCounts.koi,
    barboCount: fishTypeCounts.barbo,
    pezGatoCount: fishTypeCounts['pez-gato'],
    otherSpeciesCount: fishTypeCounts.koi + fishTypeCounts.barbo + fishTypeCounts['pez-gato'],
    bestCatch,
    trophyCount: catches.filter((item) => item.weightKg >= 12).length,
  };
};

export const sortCatches = (items, sortBy) => {
  const sorted = [...items];

  switch (sortBy) {
    case 'weight-desc':
      return sorted.sort((a, b) => b.weightKg - a.weightKg);
    case 'weight-asc':
      return sorted.sort((a, b) => a.weightKg - b.weightKg);
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    case 'name':
      return sorted.sort((a, b) => a.memberId.localeCompare(b.memberId));
    case 'water':
      return sorted.sort((a, b) => a.waterId.localeCompare(b.waterId));
    case 'date-desc':
    default:
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};

export const filterCatches = ({ catches, membersById, watersById, baitsById, filters }) => {
  const {
    query = '',
    memberId = 'all',
    waterId = 'all',
    baitId = 'all',
    carpType = 'all',
    year = 'all',
    minWeight = '',
    maxWeight = '',
  } = filters;

  const normalizedQuery = query.trim().toLowerCase();

  return catches.filter((capture) => {
    const member = membersById[capture.memberId];
    const water = watersById[capture.waterId];
    const bait = baitsById[capture.baitId];
    const captureYear = String(new Date(capture.date).getFullYear());
    const fishLabel = formatFishType(capture.carpType).toLowerCase();

    const textHaystack = [
      member?.name,
      water?.name,
      water?.province,
      bait?.name,
      capture.rig,
      capture.notes,
      capture.carpType,
      fishLabel,
    ]
      .join(' ')
      .toLowerCase();

    if (normalizedQuery && !textHaystack.includes(normalizedQuery)) {
      return false;
    }

    if (memberId !== 'all' && capture.memberId !== memberId) {
      return false;
    }

    if (waterId !== 'all' && capture.waterId !== waterId) {
      return false;
    }

    if (baitId !== 'all' && capture.baitId !== baitId) {
      return false;
    }

    if (carpType !== 'all' && capture.carpType !== carpType) {
      return false;
    }

    if (year !== 'all' && captureYear !== year) {
      return false;
    }

    if (minWeight !== '' && capture.weightKg < Number(minWeight)) {
      return false;
    }

    if (maxWeight !== '' && capture.weightKg > Number(maxWeight)) {
      return false;
    }

    return true;
  });
};

export const uniqueYears = (catches) =>
  [...new Set(catches.map((item) => new Date(item.date).getFullYear()))].sort(
    (a, b) => b - a,
  );
