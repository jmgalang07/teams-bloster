import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  buildEmptySiteData,
  createCapture,
  createWater,
  loadSiteData,
  removeCapture,
  removeWater,
  resetCustomRows,
  saveCapture,
  saveWater,
} from '../services/siteDataService';

const SiteDataContext = createContext(null);

const serializeForExport = ({ waters, catches }) => ({
  exportedAt: new Date().toISOString(),
  waters: waters.filter((water) => water.source === 'custom'),
  catches: catches.filter((capture) => capture.source === 'custom'),
  editedWaters: [],
  editedCatches: [],
  deletedWaterIds: [],
  deletedCatchIds: [],
});

export function SiteDataProvider({ children }) {
  const [siteData, setSiteData] = useState(buildEmptySiteData);
  const [projectSyncStatus, setProjectSyncStatus] = useState('loading');
  const [lastError, setLastError] = useState(null);

  const refreshSiteData = useCallback(async () => {
    setProjectSyncStatus('loading');
    setLastError(null);

    try {
      const nextData = await loadSiteData();
      setSiteData(nextData);
      setProjectSyncStatus('ready');
      return nextData;
    } catch (error) {
      setLastError(error);
      setProjectSyncStatus('error');
      return null;
    }
  }, []);

  useEffect(() => {
    refreshSiteData();
  }, [refreshSiteData]);

  const rigOptions = useMemo(() => {
    const allRigs = siteData.catches
      .map((item) => item.rig)
      .filter(Boolean)
      .map((rig) => rig.trim());

    return [...new Set(allRigs)].sort((left, right) => left.localeCompare(right));
  }, [siteData.catches]);

  const customCounts = useMemo(() => {
    const customWaters = siteData.waters.filter((water) => water.source === 'custom').length;
    const customCatches = siteData.catches.filter((capture) => capture.source === 'custom').length;

    return {
      waters: customWaters,
      catches: customCatches,
      editedWaters: 0,
      editedCatches: 0,
      deletedWaters: 0,
      deletedCatches: 0,
      syncedWaters: customWaters,
      syncedCatches: customCatches,
      syncedEditedWaters: 0,
      syncedEditedCatches: 0,
      syncedDeletedWaters: 0,
      syncedDeletedCatches: 0,
      totalChanges: customWaters + customCatches,
    };
  }, [siteData.catches, siteData.waters]);

  const exportPayload = useMemo(
    () => serializeForExport({ waters: siteData.waters, catches: siteData.catches }),
    [siteData.catches, siteData.waters],
  );

  const addWater = useCallback(
    async (waterInput) => {
      const existingIds = new Set(siteData.waters.map((water) => water.id));
      const savedWater = await createWater(waterInput, existingIds);
      await refreshSiteData();
      return savedWater;
    },
    [refreshSiteData, siteData.waters],
  );

  const updateWater = useCallback(
    async (waterId, waterInput) => {
      const existingWater = siteData.waters.find((water) => water.id === waterId);

      if (!existingWater) {
        throw new Error('No hemos encontrado el escenario que quieres modificar.');
      }

      const savedWater = await saveWater(waterId, waterInput, existingWater);
      await refreshSiteData();
      return savedWater;
    },
    [refreshSiteData, siteData.waters],
  );

  const deleteWater = useCallback(
    async (waterId) => {
      const existingWater = siteData.waters.find((water) => water.id === waterId);

      if (!existingWater) {
        throw new Error('No hemos encontrado el escenario que quieres borrar.');
      }

      await removeWater(waterId);
      await refreshSiteData();
    },
    [refreshSiteData, siteData.waters],
  );

  const addCapture = useCallback(
    async (captureInput) => {
      const savedCapture = await createCapture(captureInput);
      await refreshSiteData();
      return savedCapture;
    },
    [refreshSiteData],
  );

  const updateCapture = useCallback(
    async (captureId, captureInput) => {
      const existingCapture = siteData.catches.find((capture) => capture.id === captureId);

      if (!existingCapture) {
        throw new Error('No hemos encontrado la captura que quieres modificar.');
      }

      const savedCapture = await saveCapture(captureId, captureInput, existingCapture);
      await refreshSiteData();
      return savedCapture;
    },
    [refreshSiteData, siteData.catches],
  );

  const deleteCapture = useCallback(
    async (captureId) => {
      const existingCapture = siteData.catches.find((capture) => capture.id === captureId);

      if (!existingCapture) {
        throw new Error('No hemos encontrado la captura que quieres borrar.');
      }

      await removeCapture(captureId);
      await refreshSiteData();
    },
    [refreshSiteData, siteData.catches],
  );

  const importCustomData = useCallback(
    async (payload) => {
      const watersToImport = Array.isArray(payload?.waters) ? payload.waters : [];
      const catchesToImport = Array.isArray(payload?.catches) ? payload.catches : [];
      let importedWaters = 0;
      let importedCatches = 0;

      for (const water of watersToImport) {
        await createWater(water, new Set(siteData.waters.map((item) => item.id)));
        importedWaters += 1;
      }

      for (const capture of catchesToImport) {
        await createCapture(capture);
        importedCatches += 1;
      }

      await refreshSiteData();

      return {
        importedWaters,
        importedCatches,
        importedEditedWaters: 0,
        importedEditedCatches: 0,
        skippedCatches: 0,
        deletedWaters: 0,
        deletedCatches: 0,
      };
    },
    [refreshSiteData, siteData.waters],
  );

  const resetCustomData = useCallback(async () => {
    await resetCustomRows();
    await refreshSiteData();
  }, [refreshSiteData]);

  const value = useMemo(
    () => ({
      ...siteData,
      rigOptions,
      customWaters: siteData.waters.filter((water) => water.source === 'custom'),
      customCatches: siteData.catches.filter((capture) => capture.source === 'custom'),
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
      projectSyncPayload: exportPayload,
      projectSyncStatus,
      projectSyncFilePath: 'Supabase',
      storageMode: 'supabase',
      lastError,
      refreshSiteData,
    }),
    [
      addCapture,
      addWater,
      customCounts,
      deleteCapture,
      deleteWater,
      exportPayload,
      importCustomData,
      lastError,
      projectSyncStatus,
      refreshSiteData,
      resetCustomData,
      rigOptions,
      siteData,
      updateCapture,
      updateWater,
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
